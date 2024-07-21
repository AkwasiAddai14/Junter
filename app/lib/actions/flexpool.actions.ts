"use server"

import { connectToDB} from "../mongoose";
import { revalidatePath } from "next/cache";
import Flexpool from "../models/flexpool.model";
import Bedrijf from "../models/bedrijven.model";
import Freelancer from "../models/freelancer.model";
import mongoose from "mongoose";


export async function maakFlexpool({
    bedrijfId,
    titel,
    freelancers = [],
    shifts = []
}: {
    bedrijfId: mongoose.Types.ObjectId,
    titel: string,
    freelancers?: mongoose.Types.ObjectId[],
    shifts?: mongoose.Types.ObjectId[]
}) {
    try {
        await connectToDB();
        // Find the associated bedrijf to ensure it exists
        const bedrijf = await Bedrijf.findById(bedrijfId);
        if (!bedrijf) {
            throw new Error('Bedrijf not found');
        }

        // Create a new Flexpool instance
        const newFlexpool = new Flexpool({
            titel,
            bedrijf: bedrijfId,
            freelancers,
            shifts
        });

        // Save the new Flexpool to the database
        const savedFlexpool = await newFlexpool.save();

        // Return the created Flexpool
        return savedFlexpool;
    } catch (error) {
        console.error('Error creating flexpool:', error);
        throw new Error('Error creating flexpool');
    }
};

export async function voegAanFlexpool({
    flexpoolId,
    freelancerIds
}: {
    flexpoolId: mongoose.Types.ObjectId,
    freelancerIds: mongoose.Types.ObjectId[]
}){
    try {
        await connectToDB();
        // Find the Flexpool to ensure it exists
        const flexpool = await Flexpool.findById(flexpoolId);
        if (!flexpool) {
            throw new Error('Flexpool not found');
        }

        // Check if each freelancer exists before adding
        for (const freelancerId of freelancerIds) {
            const freelancer = await Freelancer.findById(freelancerId);
            if (!freelancer) {
                throw new Error(`Freelancer with ID ${freelancerId} not found`);
            }
        }

        // Add freelancers to the flexpool
        flexpool.freelancers.push(...freelancerIds);

        // Save the updated flexpool
        const updatedFlexpool = await flexpool.save();

        // Return the updated flexpool
        return updatedFlexpool;
    } catch (error) {
        console.error('Error adding freelancers to flexpool:', error);
        throw new Error('Error adding freelancers to flexpool');
    }
};

export const verwijderUitFlexpool = async ({
    flexpoolId,
    freelancerIds
}: {
    flexpoolId: mongoose.Types.ObjectId,
    freelancerIds: mongoose.Types.ObjectId[]
}) => {
    try {
        await connectToDB();
        // Find the Flexpool to ensure it exists
        const flexpool = await Flexpool.findById(flexpoolId);
        if (!flexpool) {
            throw new Error('Flexpool not found');
        }

        // Remove the freelancers from the flexpool
        flexpool.freelancers = flexpool.freelancers.filter(
            (freelancerId: mongoose.Types.ObjectId) => !freelancerIds.includes(freelancerId)
        );

        // Save the updated flexpool
        const updatedFlexpool = await flexpool.save();

        // Return the updated flexpool
        return updatedFlexpool;
    } catch (error) {
        console.error('Error removing freelancers from flexpool:', error);
        throw new Error('Error removing freelancers from flexpool');
    }
};

export const verwijderFlexpool = async (flexpoolId: mongoose.Types.ObjectId) => {
    try {
        await connectToDB();
        // Find the flexpool
        const flexpool = await Flexpool.findById(flexpoolId);
        if (!flexpool) {
            throw new Error('Flexpool not found');
        }

        // Delete the flexpool
        await Flexpool.findByIdAndDelete(flexpoolId);

        // Return the deleted flexpool
        return flexpool;
    } catch (error) {
        console.error('Error deleting flexpool:', error);
        throw new Error('Error deleting flexpool');
    }
};

export const haalFlexpool = async (freelancerId: string) => {
    try {
        await connectToDB();
        // Zoek de freelancer op basis van het gegeven ID
        const freelancer = await Freelancer.findById(freelancerId).populate('flexpools');

        if (!freelancer) {
            throw new Error('Freelancer niet gevonden');
        }

        // Retourneer de flexpools van de freelancer
        return freelancer.flexpools;
    } catch (error) {
        console.error('Error fetching flexpools:', error);
        throw new Error('Failed to fetch flexpools');
    }
};