"use server"

import { connectToDB } from "../mongoose";
import Shift from '../models/shift.model';
import Bedrijf from "../models/bedrijf.model";
import Freelancer from "../models/freelancer.model";
import mongoose from "mongoose";

export const maakCheckout = async ({shiftId} : {shiftId: string}) => {
  try {

    await connectToDB();

    const shiftsToCheckout = await Shift.find({ status: 'voltooi checkout' });
    for (const shift of shiftsToCheckout) {
      // Create a checkout instance
      shift.status = 'checkout';
      await shift.save();
      console.log('Shift statuses updated and checkouts created.');
      }
    }
   catch (error: any) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
};

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

        const checkout = await Shift.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        const opdrachtgever = await Bedrijf.findById(checkout.opdrachtgever._id);

            if (opdrachtgever) {
            const allRatings = await Shift.find({ opdrachtgever: opdrachtgever._id }).select('ratingBedrijf');

            // Use explicit typing for reduce accumulator
            const totalRatings = allRatings.reduce<number[]>((acc, shift) => {
                const rating = shift.ratingBedrijf ?? 0; // Fallback to 0 if undefined
                return acc.concat(rating);
            }, []);

            const averageRating = totalRatings.reduce((acc, rating) => acc + rating, 0) / totalRatings.length;

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

        // Save the updated checkout document
        await checkout.save();

        console.log('Checkout fields updated successfully.');
    } catch (error: any) {
        throw new Error(`Failed to update checkout: ${error.message}`);
    }
};


export const accepteerCheckout = async ({ shiftId, rating, feedback }: { shiftId: string; rating: number; feedback: string }) => {
    try {
        // Find the checkout document by shiftId
        const checkout = await Shift.findOne({ shift: shiftId });
        
        
        await Shift.updateOne(
                { _id: shiftId },
            { $set: { feedback: feedback } }
        );
            
        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the opdrachtnemer's shift status to 'checkout accepted'
        // Assuming opdrachtnemerId is stored in the Checkout document
        const opdrachtnemerId = checkout.opdrachtnemer;
        const opdrachtgeverId = checkout.opdrachtgever
        // Update the shift status in the opdrachtnemer's shifts array
        await Freelancer.updateOne(
            { _id: opdrachtnemerId, 'shifts.shift': shiftId },
            { $set: { 'shifts.$.status': 'checkout accepted' } }
        );
        await Bedrijf.updateOne(
            { _id: opdrachtgeverId, 'shifts.shift': shiftId },
            { $set: { 'shifts.$.status': 'checkout accepted' } }
        );
        // Get the opdrachtnemer's current rating and the total number of ratings
        const opdrachtnemer = await Freelancer.findById(opdrachtnemerId);
        const currentRating = opdrachtnemer.rating || 0;
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

        console.log('Checkout accepted successfully.');
    } catch (error: any) {
        throw new Error(`Failed to accept checkout: ${error.message}`);
    }
};

export const weigerCheckout = async ({ shiftId }: { shiftId: string }) => {
    try {
        // Find the checkout document by shiftId
        const checkout = await Shift.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the shift's status to 'Checkout geweigerd'
        await Shift.updateOne({ shift: shiftId }, { $set: { status: 'Checkout geweigerd' } });

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

export const haalCheckouts = async (userId: string) => {
    try {
        await connectToDB();
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid freelancer ID');
          }
        // Vind de checkouts voor de specifieke freelancer
        const checkouts = await Shift.find({ opdrachtnemer: userId })
            .populate('opdrachtgever')
            .populate('shift');

        return checkouts;
    } catch (error) {
        console.error('Error fetching checkouts:', error);
        throw new Error('Failed to fetch checkouts');
    }
};