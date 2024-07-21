"use server"

import { connectToDB } from "../mongoose";
import Shift from '../models/shift.model';
import Checkout from '../models/checkout.model';
import Bedrijf from "../models/bedrijven.model";
import Freelancer from "../models/freelancer.model";

export const maakCheckout = async ({shiftId} : {shiftId: string}) => {
  try {
    await connectToDB();


    // Find shifts with status 'afgerond'
    const shiftsToCheckout = await Shift.find({ status: 'voltooi checkout' });

    for (const shift of shiftsToCheckout) {
      // Create a checkout instance
      await Checkout.create({
        opdrachtgever: shift.opdrachtgever,
        opdrachtnemer: shift.opdrachtnemer,
        shift: shift._id,
        titel: shift.titel,
        afbeelding: shift.afbeelding,
        uurtarief: shift.uurtarief,
        datum: shift.datum,
        begintijd: shift.begintijd,
        eindtijd: shift.eindtijd,
        pauze: shift.pauze
      });

      // Update the shift status to 'checkout'
      shift.status = 'checkout';
      await shift.save();
    }
    
    console.log('Shift statuses updated and checkouts created.');
  } catch (error: any) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
};

interface CheckoutParams {
    shiftId: string;
    rating: number;
    begintijd: string;
    eindtijd: string;
    pauze?: number;
    feedback?: string;
    opmerking?: string;
}

export const vulCheckout = async ({ shiftId, rating, begintijd, eindtijd, pauze, feedback, opmerking }: CheckoutParams) => {
    try {
        await connectToDB();

        const checkout = await Checkout.findOne({ shift: shiftId });
        const opdrachtgever = await Bedrijf.findById(checkout.opdrachtgever._id);
            if (opdrachtgever) {
                const allRatings = await Shift.find({ opdrachtgever: opdrachtgever._id }).select('ratings');
                const totalRatings = allRatings.reduce((acc, shift) => acc.concat(shift.ratings), []);
                const averageRating = totalRatings.reduce((acc: any, rating: any) => acc + rating, 0) / totalRatings.length;
    
                opdrachtgever.rating = averageRating;
                await opdrachtgever.save();
            }
        // Find the checkout document by shiftId
        

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the fields with the provided user input
        if (rating !== undefined) {
            checkout.rating = rating;
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


export const accepteerCheckout = async ({ shiftId, rating }: { shiftId: string; rating: number }) => {
    try {
        // Find the checkout document by shiftId
        const checkout = await Checkout.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the opdrachtnemer's shift status to 'checkout accepted'
        // Assuming opdrachtnemerId is stored in the Checkout document
        const opdrachtnemerId = checkout.opdrachtnemer;
        // Update the shift status in the opdrachtnemer's shifts array
        await Freelancer.updateOne(
            { _id: opdrachtnemerId, 'shifts.shift': shiftId },
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
        const checkout = await Checkout.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the shift's status to 'Checkout geweigerd'
        await Checkout.updateOne({ shift: shiftId }, { $set: { status: 'Checkout geweigerd' } });

        console.log('Checkout geweigerd successfully.');
    } catch (error: any) {
        throw new Error(`Failed to weiger checkout: ${error.message}`);
    }
};

export const noShowCheckout = async ({ shiftId }: { shiftId: string }) =>{
    try {
        // Find the checkout document by shiftId
        const checkout = await Checkout.findOne({ shift: shiftId });

        if (!checkout) {
            throw new Error(`Checkout not found for shift ID: ${shiftId}`);
        }

        // Update the shift's status to 'Checkout geweigerd'
        await Checkout.updateOne({ shift: shiftId }, { $set: { status: 'No show' } });

        console.log('Checkout geweigerd successfully.');
    } catch (error: any) {
        throw new Error(`Failed to weiger checkout: ${error.message}`);
    }
};

export const haalCheckouts = async (freelancerId: string) => {
    try {
        await connectToDB();

        // Vind de checkouts voor de specifieke freelancer
        const checkouts = await Checkout.find({ opdrachtnemer: freelancerId })
            .populate('opdrachtgever')
            .populate('shift');

        return checkouts;
    } catch (error) {
        console.error('Error fetching checkouts:', error);
        throw new Error('Failed to fetch checkouts');
    }
};