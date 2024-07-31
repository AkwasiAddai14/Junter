"use server"

import { connectToDB} from "../mongoose";
import Bedrijf from "../models/bedrijven.model";

type bedrijf = {
    clerkId:string,
    profielfoto: string,
    naam: string,
    kvknr: string,
    btwnr: string,
    postcode: string,
    huisnummer: string,
    emailadres: string,
    telefoonnummer: string,
    iban: string,
    path: string
}

export async function maakBedrijf(organization: bedrijf){
    try {
        connectToDB();
        // Create a new bedrijf document
        const newBedrijf = new Bedrijf(organization);
        
        // Save the document to the database
        await newBedrijf.save();
        
        return newBedrijf;
    } catch (error) {
        console.error('Error creating bedrijf:', error);
        throw new Error('Error creating bedrijf');
    }
}

export async function updateBedrijf( organization: bedrijf)
{
    connectToDB();

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

export const fetchBedrijfDetails = async (bedrijvenID: string) => {
    try {
        connectToDB();
      const bedrijf = await Bedrijf.findById(bedrijvenID).exec();
      if (bedrijf) {
        return bedrijf.toObject();
      }
      throw new Error('Bedrijf not found');
    } catch (error) {
      console.error('Error fetching bedrijf details:', error);
      throw error;
    }
  };


