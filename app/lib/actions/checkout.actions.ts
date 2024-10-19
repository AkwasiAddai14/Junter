"use server"

import { connectToDB } from "../mongoose";
import cron from 'node-cron';
import Shift from '../models/shift.model';
import Bedrijf from "../models/bedrijf.model";
import Freelancer, { IFreelancer } from "../models/freelancer.model";
import mongoose, { Types } from "mongoose";
import { sendEmailBasedOnStatus } from '@/app/lib/actions/shift.actions.ts'
import { currentUser } from "@clerk/nextjs/server";

export async function updateShiftsAndMoveToCheckout() {
    try {
      await connectToDB();
  
      // Step 1: Find shifts with the status 'aangenomen'
      const shifts = await Shift.find({ status: 'aangenomen' });
  
      const currentTime = new Date();
  
      for (const shift of shifts) {
        const shiftStartDateTime = new Date(shift.begindatum);
        const [hours, minutes] = shift.begintijd.split(':').map(Number);
        shiftStartDateTime.setHours(hours, minutes, 0, 0);
  
        const timeDifference = currentTime.getTime() - shiftStartDateTime.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);
  
        if (hoursDifference >= 1) {
          // Step 2: Change status to 'voltooi checkout'
          shift.status = 'voltooi checkout';
  
          // Step 3: Find the freelancer associated with the shift
          const freelancer = await Freelancer.findById(shift.opdrachtnemer) as IFreelancer;
          if (!freelancer) {
            throw new Error(`Freelancer with ID ${shift.opdrachtnemer} not found`);
          }
  
          // Step 4: Remove the shift from the freelancer's shifts array
          freelancer.shifts = freelancer.shifts.filter((s: mongoose.Types.ObjectId) => !s.equals(shift._id));
  
          // Step 5: Push the shift into the freelancer's checkouts array
          if (!freelancer.checkouts) {
            freelancer.checkouts = []; // Initialize the checkouts array if it doesn't exist
          }
          freelancer.checkouts.push(new mongoose.Types.ObjectId(shift._id));
          await sendEmailBasedOnStatus(freelancer.emailadres as string, shift, 'voltooi checkout', freelancer, shift.opdrachtgever);
          // Step 6: Save the updated shift and freelancer
          await shift.save();
          await freelancer.save();
        }
      }
  
      return { success: true, message: "Shifts successfully updated and moved to checkout where applicable" };
    } catch (error: any) {
      throw new Error(`Failed to update shifts and move to checkout: ${error.message}`);
    }
  }

interface CheckoutParams {
    shiftId: string;
    rating: number;
    begintijd: string;
    eindtijd: string;
    pauze?: string;
    feedback?: string;
    opmerking?: string;
}

export const vulCheckout = async ({ shiftId, rating, begintijd, eindtijd, pauze, feedback, opmerking }: CheckoutParams) => {
    try {
        await connectToDB();

        const checkout = await Shift.findById( shiftId );

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtgever = await Bedrijf.findById(checkout.opdrachtgever);

            if (opdrachtgever) {
            const allRatings = await Shift.find({ opdrachtgever: opdrachtgever._id }).select('ratingBedrijf');

            // Use explicit typing for reduce accumulator
            const totalRatings = allRatings.reduce<number[]>((acc, shift) => {
                const rating = shift.ratingBedrijf ?? 0; // Fallback to 0 if undefined
                return acc.concat(rating);
            }, []);

            const averageRating = totalRatings.reduce((acc, rating) => acc + rating, 0) / totalRatings.length;
            opdrachtgever?.checkouts.push(new mongoose.Types.ObjectId(checkout._id))
            opdrachtgever.rating = averageRating;
            await opdrachtgever.save();
        }

        // Update the fields with the provided user input
        if (rating !== undefined) {
            checkout.ratingBedrijf = rating;
        }
        if (begintijd !== undefined) {
            checkout.begintijd = begintijd;
        }
        if (eindtijd !== undefined) {
            checkout.eindtijd = eindtijd;
        }
        if (pauze !== undefined) {
            checkout.pauze = pauze;
        }
        if (feedback !== undefined) {
            checkout.feedback = feedback;
        }
        if (opmerking !== undefined) {
            checkout.opmerking = opmerking;
        }
        checkout.status = "checkout ingevuld"
        // Save the updated checkout document
        await checkout.save();
        console.log('Checkout fields updated successfully.');
        return { success: true, message: "Checkout fields updated successfully."}
    } catch (error: any) {
        throw new Error(`Failed to update checkout: ${error.message}`);
    }
};


export const accepteerCheckout = async ({ shiftId, rating, feedback }: { shiftId: string; rating: number; feedback: string }) => {
    try {
        // Find the checkout document by shiftId
        const checkout = await Shift.findById(shiftId);
        
        
        await Shift.updateOne(
          { _id: shiftId },
          {
              $set: {
                  feedback: feedback,
                  status: 'checkout geaccepteerd'
              }
          }
      );
            
        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the opdrachtnemer's shift status to 'checkout accepted'
        // Assuming opdrachtnemerId is stored in the Checkout document
        const opdrachtnemerId = checkout.opdrachtnemer;
        const opdrachtgeverId = checkout.opdrachtgever
        // Update the shift status in the opdrachtnemer's shifts array
        /* await Freelancer.updateOne(
            { _id: opdrachtnemerId, 'shifts.shift': shiftId },
            { $set: { 'shifts.$.status': 'checkout geaccepteerd' } }
        );
        await Bedrijf.updateOne(
            { _id: opdrachtgeverId, 'shifts.shift': shiftId },
            { $set: { 'shifts.$.status': 'checkout geaccepteerd' } }
        ); */
        // Get the opdrachtnemer's current rating and the total number of ratings
        const opdrachtnemer = await Freelancer.findById(opdrachtnemerId);
        const currentRating = opdrachtnemer.rating || 5;
        const totalRatings = opdrachtnemer.ratingCount || 0;

        // Calculate the new average rating
        const newTotalRating = currentRating * totalRatings + rating;
        const newRatingCount = totalRatings + 1;
        const newAverageRating = newTotalRating / newRatingCount;

        // Update the opdrachtnemer's rating with the new average rating
        await Freelancer.updateOne(
            { _id: opdrachtnemerId },
            { $set: { rating: newAverageRating, ratingCount: newRatingCount } }
        );
        await sendEmailBasedOnStatus(opdrachtnemer.emailadres as string, checkout, 'voltooi checkout', "freelancer", "shift.opdrachtgever");
        console.log('Checkout accepted successfully.');
    } catch (error: any) {
        throw new Error(`Failed to accept checkout: ${error.message}`);
    }
};

export const weigerCheckout = async ({ shiftId, rating, begintijd, eindtijd, pauze, feedback, opmerking } : CheckoutParams) => {
    try {
        // Find the checkout document by shiftId
        const checkout = await Shift.findById(shiftId);

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        if (rating !== undefined) {
            checkout.ratingBedrijf = rating;
        }
        if (begintijd !== undefined) {
            checkout.begintijd = begintijd;
        }
        if (eindtijd !== undefined) {
            checkout.eindtijd = eindtijd;
        }
        if (pauze !== undefined) {
            checkout.pauze = pauze;
        }
        if (feedback !== undefined) {
            checkout.feedback = feedback;
        }
        if (opmerking !== undefined) {
            checkout.opmerking = opmerking;
        }

        // Update the shift's status to 'Checkout geweigerd'
        await Shift.updateOne({ _id: shiftId }, { $set: { status: 'Checkout geweigerd' } });

        console.log('Checkout geweigerd successfully.');
    } catch (error: any) {
        throw new Error(`Failed to weiger checkout: ${error.message}`);
    }
};

export const noShowCheckout = async ({ shiftId }: { shiftId: string }) =>{
    try {
        // Find the checkout document by shiftId
        const checkout = await Shift.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the shift's status to 'Checkout geweigerd'
        await Shift.updateOne({ shift: shiftId }, { $set: { status: 'No show' } });

        console.log('Checkout geweigerd successfully.');
    } catch (error: any) {
        throw new Error(`Failed to weiger checkout: ${error.message}`);
    }
};

export const haalCheckouts = async (freelancerId: Types.ObjectId | string ) => {
  try {
    await connectToDB();
    let freelancer;
    if(mongoose.Types.ObjectId.isValid(freelancerId)){
      freelancer = await Freelancer.findById(freelancerId);
    // Case 1: If freelancerId is provided
      if (freelancer) {
        // Find shifts where the freelancer is 'opdrachtnemer' and 'status' is 'voltooi checkout'
        const filteredShifts = await Shift.find({ 
          opdrachtnemer: freelancer._id,
          status: { $in: ['voltooi checkout', 'checkout geweigerd', 'checkout geaccepteerd'] }
      });
      console.log(filteredShifts);
        return filteredShifts;
      } 
    }
      // Case 2: If freelancerId is not provided, use the logged-in user (Clerk)
      if(freelancerId.toString() !== ""){
        freelancer = await Freelancer.findOne({clerkId : freelancerId});
        if (freelancer) {
          // Find shifts where the logged-in freelancer is 'opdrachtnemer' and 'status' is 'voltooi checkout'
          const filteredShifts = await Shift.find({ opdrachtnemer: freelancer._id,
            status: { $in: ['voltooi checkout', 'checkout geweigerd', 'checkout geaccepteerd'] }
            });
          return filteredShifts;
        } 
      } else {
        const user = await currentUser();
        if (user) {
          freelancer = await Freelancer.findOne({ clerkId: user.id });
          if (freelancer) {
            // Find shifts where the logged-in freelancer is 'opdrachtnemer' and 'status' is 'voltooi checkout'
            const filteredShifts = await Shift.find({ opdrachtnemer: freelancer._id,
              status: { $in: ['voltooi checkout', 'checkout geweigerd', 'checkout geaccepteerd'] }
               });
            return filteredShifts;
          } else {
            console.log("No freelancer found for the current user");
            return [];
          }
        } else {
          console.log("Freelancer not found");
          return [];
        }
      }
    console.log("No user or freelancer found");
    return [];
  } catch (error: any) {
    throw new Error(`Failed to find shift: ${error.message}`);
  }
};

export const haalcheckout = async ({ shiftId }: { shiftId: string}) =>{
  try {
    await connectToDB();
    const shift = await Shift.findById(shiftId);
    return shift;
  } catch (error: any) {
    throw new Error(`Failed to find shift: ${error.message}`);
  }
}

export const updateNoShowCheckouts = async () => {
    try {
      // Connect to the database
      await connectToDB();
  
      // Find all freelancers
      await connectToDB();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      // Find all shifts with status 'checkout ingevuld'
      const shifts = await Shift.find({ 
        status: 'voltooi checkout', 
        begindatum: { $lte: twoDaysAgo } 
    });
  
      if (shifts.length > 0) {
        // Iterate over all shifts and update their status to 'checkout geaccepteerd'
        for (const shift of shifts) {
          shift.status = 'no show';
          await shift.save(); // Save the updated shift
        }
      }
      console.log('All relevant checkouts updated to no show.');
    } catch (error) {
      console.error('Error updating checkouts:', error);
      throw new Error('Failed to update checkouts to no show');
    }
  };

  export const updateCheckoutStatus = async () => {
    try {
      // Ensure the DB is connected
      await connectToDB();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      // Find all shifts with status 'checkout ingevuld'
      const shifts = await Shift.find({ 
        status: 'checkout ingevuld', 
        begindatum: { $lte: twoDaysAgo } 
    });
  
      if (shifts.length > 0) {
        // Iterate over all shifts and update their status to 'checkout geaccepteerd'
        for (const shift of shifts) {
          shift.status = 'checkout geaccepteerd';
          await shift.save(); // Save the updated shift
        }
  
        console.log(`${shifts.length} shifts updated to 'checkout geaccepteerd'`);
      } else {
        console.log('No shifts with status "checkout ingevuld" found.');
      }
    } catch (error) {
      console.error('Error updating checkout status:', error);
    }
  };

  cron.schedule('0 0 * * 4', async () => {
    try {
      console.log('Running updateNoShowCheckouts job at midnight on Wednesday');
  
      // Ensure DB is connected before running the function
      await connectToDB();
  
      // Run the function to update checkouts
      await updateNoShowCheckouts();
      await updateCheckoutStatus();
  
      console.log('Completed updateNoShowCheckouts job');
    } catch (error) {
      console.error('Error running updateNoShowCheckouts job:', error);
    }
  });

cron.schedule('0 * * * *', async () => {
    try {
      const result = await updateShiftsAndMoveToCheckout();
      console.log(result.message);
    } catch (error: any) {
      console.error('Error running updateShiftsAndMoveToCheckout:', error.message);
    }
  });