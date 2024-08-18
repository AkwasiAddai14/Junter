"use server"

import { connectToDB} from "../mongoose";
import mongoose from "mongoose";
import Bedrijf from "../models/bedrijven.model";


type bedrijf = {
    clerkId: string,
    profielfoto: string,
    naam: string,
    displaynaam: string,
    kvknr: string,
    btwnr: string,
    postcode: string,
    huisnummer: string,
    emailadres: string,
    telefoonnummer: string,
    iban: string,
    path: string
};

connectToDB();
console.log('Connected to DB');

export async function maakBedrijf(organization: bedrijf) {
    try {

       

        if (mongoose.connection.readyState === 1) {
            console.log("Connected to db");
        } else {
            console.log("DB connection attempt failed");
            throw new Error("DB connection attempt failed");
        }

        console.log("Creating a new bedrijf document...");
        const newBedrijf = new Bedrijf(organization);
        
        await newBedrijf.save();
        console.log("Document saved successfully:", newBedrijf);

        return newBedrijf;
    } catch (error) {
        console.error('Error creating bedrijf:', error);
        throw new Error('Error creating bedrijf');
    }
}

export async function updateBedrijf( organization: bedrijf)
{


    try {

        connectToDB();
        const newBedrijf = await Bedrijf.create(organization);
        return JSON.parse(JSON.stringify(newBedrijf))
        } 
            catch (error: any) {
                throw new Error(`Failed to create or update user: ${error.message}`);
               }
}

export async function verwijderBedrijf(organization: bedrijf) {
    try {
        connectToDB();
        const deletedBedrijf = await Bedrijf.findOneAndDelete(organization);

        if (!deletedBedrijf) {
            throw new Error('Bedrijf not found');
        }

        return { success: true, message: 'Bedrijf deleted successfully' };
    } catch (error) {
        console.error('Error deleting bedrijf:', error);
        throw new Error('Error deleting bedrijf');
    }
}

export async function zoekBedrijf({
    clerkId,
    searchString = "",
    pageNumber = 1,
    pageSize = 40,
    sortBy = 'desc'
}: {
    clerkId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: 'asc' | 'desc';
}) {
    try {
        // Build the query object
        const query: any = { clerkId };

        if (searchString) {
            query.$or = [
                { naam: { $regex: searchString, $options: 'i' } },
                { kvknr: { $regex: searchString, $options: 'i' } },
                { btwnr: { $regex: searchString, $options: 'i' } },
                { postcode: { $regex: searchString, $options: 'i' } },
                { emailadres: { $regex: searchString, $options: 'i' } },
                { telefoonnummer: { $regex: searchString, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (pageNumber - 1) * pageSize;

        // Retrieve the documents from the database
        const bedrijven = await Bedrijf.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ naam: sortBy });

        // Get the total count for pagination
        const totalCount = await Bedrijf.countDocuments(query);

        return {
            bedrijven,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: pageNumber
        };
    } catch (error) {
        console.error('Error searching for bedrijven:', error);
        throw new Error('Error searching for bedrijven');
    }
}

export const fetchBedrijfDetails = async (clerkId: string) => {
    try {
      connectToDB();
      const bedrijf = await Bedrijf.findOne({ clerkId }).exec();
      if (bedrijf) {
        return bedrijf.toObject();
      }
      throw new Error('Bedrijf not found');
    } catch (error) {
      console.error('Error fetching bedrijf details:', error);
      throw error;
    }
  };

  export const fetchBedrijfByClerkId = async (clerkId: string) => {
    try {
        console.log(mongoose.modelNames());
        const bedrijf = await Bedrijf.findOne({ clerkId }).populate([
            { path: 'flexpools' },
            { path: 'shifts' },
            { path: 'facturen' },
          ]);  // Ensure flexpools are populated
    if (bedrijf) {
      console.log('Found Bedrijf: ', JSON.stringify(bedrijf, null, 2));  // Log the entire bedrijf object
      if (!bedrijf.flexpools || bedrijf.flexpools.length === 0) {
        console.log('No flexpools found for this Bedrijf.');
      }
      return bedrijf;
    } else {
      console.log('Bedrijf not found for Clerk ID:', clerkId);
      throw new Error('Bedrijf not found');
    }
  } catch (error) {
    console.error('Error fetching bedrijf details:', error);
    throw error;
    }
  };


