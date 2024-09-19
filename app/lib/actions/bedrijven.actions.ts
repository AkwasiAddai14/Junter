"use server"

import { connectToDB} from "../mongoose";
import mongoose from "mongoose";
import Bedrijf from "../models/bedrijf.model";
import { currentUser } from "@clerk/nextjs/server";


type bedrijf = {
    clerkId: string,
    profielfoto: string,
    naam: string,
    displaynaam: string,
    kvknr: string,
    btwnr: string,
    postcode: string,
    huisnummer: string,
    stad: string,
    straat: string,
    emailadres: string,
    telefoonnummer: string,
    iban: string,
    path: string
};




export async function maakBedrijf(organization: bedrijf) {
    try {
        await connectToDB();
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
        await connectToDB();
        const newBedrijf = await Bedrijf.create(organization);
        return JSON.parse(JSON.stringify(newBedrijf))
        } 
            catch (error: any) {
                throw new Error(`Failed to create or update user: ${error.message}`);
               }
}

export async function verwijderBedrijf(organization: bedrijf) {
    try {
        await connectToDB();
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
        await connectToDB()
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
      await connectToDB();
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
        await connectToDB()
        console.log(mongoose.modelNames());
        const bedrijf = await Bedrijf.findOne({ clerkId: clerkId });
    if (bedrijf) {
      console.log('Found Bedrijf: ', JSON.stringify(bedrijf, null, 2));  // Log the entire bedrijf object
      return bedrijf.toObject();
    } else {
      console.log('Bedrijf not found for Clerk ID:', clerkId);
      throw new Error('Bedrijf not found');
    }
  } catch (error) {
    console.error('Error fetching bedrijf details:', error);
    throw error;
    }
  };

  export const isBedrijf = async () => {
    try {
      await connectToDB();
      const gebruiker = await currentUser();
      const bedrijf = await Bedrijf.findOne({ clerkId: gebruiker!.id }).exec();
      if (bedrijf) {
        return true;
      }
      if(!bedrijf) {
        return false;
      }
    } catch (error) {
      console.error('Error fetching bedrijf details:', error);
    }
  };

  export const fetchBedrijfClerkId = async (bedrijfId: string): Promise<string> => {
    try {
      await connectToDB();
      
      // Find the company by its ObjectId
      const bedrijf = await Bedrijf.findById(bedrijfId).exec();
      
      if (bedrijf) {
        return bedrijf.clerkId; // Return the clerkId of the found company
      }
      
      throw new Error('Bedrijf not found');
    } catch (error) {
      console.error('Error fetching bedrijf details:', error);
      throw error;
    }
  };


  export const haalAlleBedrijven = async (): Promise<bedrijf[]> => {
    try {
        await connectToDB();
        const opdrachtgevers = await Bedrijf.find().lean<bedrijf[]>(); // Use lean() to return plain objects

        console.log(opdrachtgevers);
        return opdrachtgevers || []; // Return an array with 'naam' property
    } catch (error) {
        console.error('Error fetching bedrijven:', error);
        throw new Error('Failed to fetch bedrijven');
    }
};

