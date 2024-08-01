"use server"

import { connectToDB} from "../mongoose";
import Freelancer from "../models/freelancer.model";
import { revalidatePath } from "next/cache";
import { SortOrder } from "mongoose";

type freelancer = {
    clerkId:string,
    voornaam: string,
    tussenvoegsel: string,
    achternaam: string,
    geboortedatum: string,
    emailadres: string,
    telefoonnummer: string,
    postcode: string,
    huisnummer: string,
    straat: string,
    stad: string,
    korregeling: boolean,
    btwid: string,
    iban: string,
    path: string,
    bio: string,
    kvk:string,
    profielfoto: any,
    werkervaring: string,
    vaardigheden: string,
    opleidingen: string,
}


export const maakFreelancer = async (user:freelancer) => {
    try {
        console.log("Connecting to db..")
        connectToDB();
        console.log("Connected to db")
        const newFreelancer = await Freelancer.create(user);
        await Freelancer.findOneAndUpdate({id: user.clerkId}, {
            onboarded:true
        },
        {
            upsert:true, new: true 
        });
        if(user.path === "profiel/wijzigen"){
            revalidatePath(user.path)
        }
        return JSON.parse(JSON.stringify(newFreelancer))
        
        } 
            catch (error: any) {
                throw new Error(`Failed to create or update user: ${error.message}`);
               }
}


export const updateFreelancer = async  (user: freelancer ) => {

    try {
        connectToDB();
        const updatedUser = await Freelancer.findOneAndUpdate(
            { clerkId: user.clerkId },
            {
                telefoonnummer: user.telefoonnummer,
                emailadres: user.emailadres,
                iban: user.iban,
                postcode: user.postcode,
                huisnummer: user.huisnummer,
                korregeling: user.korregeling,
                profielfoto: user.profielfoto,
                werkervaring: user.werkervaring,
                vaardigheden: user.vaardigheden,
                opleidingen: user.opleidingen,
                kvk: user.kvk,
                bio: user.bio,
                onboarded: true
            },
            { new: true } // Return the updated document
        );

        return updatedUser;
    } catch (error) {
        console.error('Error updating freelancer:', error);
        throw new Error('Error updating freelancer');
    }
    
   } 


export async function verwijderFreelancer(clerkId: string): Promise<freelancer | null> {
    try {
        const deletedFreelancer = await Freelancer.findOneAndDelete({ clerkId: clerkId });
        if (!deletedFreelancer) {
            throw new Error('Freelancer not found');
        }
        return deletedFreelancer;
    } catch (error) {
        console.error('Error deleting freelancer:', error);
        throw new Error('Error deleting freelancer');
    }
}

export const haalFreelancer = async  (clerkId: string) => {
    
    try {
        connectToDB();
        const freelancer = await Freelancer.findById({clerkId});
        return freelancer;
    } catch (error) {
        console.error('Error retrieving freelancers:', error);
        throw new Error('Error retrieving freelancers');
    }
}

export const haalFreelancers = async ({
    clerkId,
    searchString ="",
    pageNumber = 1,
    pageSize = 40,
    sortBy = "desc"
} : {
    clerkId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder; 
}) =>{ 
    try {
        // Build the search query
        const query = {
            $and: [
                { clerkId: { $ne: clerkId } }, // Exclude the provided clerkId
                {
                    $or: [
                        { voornaam: new RegExp(searchString, 'i') },
                        { achternaam: new RegExp(searchString, 'i') },
                        { emailadres: new RegExp(searchString, 'i') }
                    ]
                }
            ]
        };

        // Calculate the number of documents to skip for pagination
        const skipDocuments = (pageNumber - 1) * pageSize;

        // Execute the query with pagination and sorting
        const freelancers = await Freelancer.find(query)
            .sort({ voornaam: sortBy })
            .skip(skipDocuments)
            .limit(pageSize);

        // Get the total number of documents that match the query
        const totalFreelancers = await Freelancer.countDocuments(query);

        // Return the result with pagination info
        return {
            freelancers,
            totalFreelancers,
            totalPages: Math.ceil(totalFreelancers / pageSize),
            currentPage: pageNumber
        };
    } catch (error) {
        console.error('Error retrieving freelancers:', error);
        throw new Error('Error retrieving freelancers');
    }
};



