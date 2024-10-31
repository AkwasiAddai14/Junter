"use server"

import { connectToDB} from "../mongoose";
import Freelancer from "../models/freelancer.model";
import { revalidatePath } from "next/cache";
import mongoose, { SortOrder } from "mongoose";
import { currentUser } from "@clerk/nextjs/server";


connectToDB();

type Werkervaring = {
    bedrijf: string;
    functie: string;
    duur: string;
  };
  
  type Vaardigheid = {
    vaardigheid: string;
  };
  
  type Opleiding = {
    naam: string;
    school: string;
    niveau?: string;
  };
  
  type Freelancer = {
    clerkId: string;
    voornaam: string;
    tussenvoegsel?: string;
    achternaam: string;
    geboortedatum: Date;
    emailadres?: string;
    telefoonnummer?: string;
    postcode: string;
    huisnummer: string;
    straat: string;
    stad: string;
    onboarded: true;
    korregeling?: boolean;
    btwid?: string;
    iban: string;
    path: string;
    bio?: string;
    kvknr?: string;
    profielfoto?: any;
    cv?: any;
    werkervaring?: Werkervaring[];
    vaardigheden?: Vaardigheid[];
    opleidingen?: Opleiding[];
    bsn?: string; // Ensure bsn is included as it is required in the schema
  };


export const maakFreelancer = async (user:Freelancer) => {
    try {
        const newFreelancer = await Freelancer.create(user);
        await Freelancer.findOneAndUpdate({clerkId: user.clerkId}, {
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


export const updateFreelancer = async  (user: Freelancer ) => {

    try {
        
        await Freelancer.findOneAndUpdate(
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
                kvknr: user.kvknr,
                bio: user.bio,
                onboarded: true
            },
            { new: true } // Return the updated document
        );

        return { success: true, message: 'Freelancer successfully updated.' };
    } catch (error) {
        console.error('Error updating freelancer:', error);
        throw new Error('Error updating freelancer');
    }
    
   } 


export async function verwijderFreelancer(clerkId: string): Promise<Freelancer | null> {
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
      await connectToDB();
      let freelancer;
      if(mongoose.Types.ObjectId.isValid(clerkId)){
        freelancer = await Freelancer.findById(clerkId).lean();
      }
      if (clerkId.toString() !== ""){
        freelancer = await Freelancer.findOne({clerkId: clerkId}).lean();
      } else {
        const user = await currentUser();
        if (user) {
          freelancer = await Freelancer.findOne({clerkId: user!.id}).lean();
        }
        else {
          console.log("No user logged in or found!")
        }
      }
      console.log(freelancer)
        return freelancer;
    } catch (error) {
        console.error('Error retrieving freelancers:', error);
        throw new Error('Error retrieving freelancers');
    }
}

export const haalFreelancerVoorAdres = async  (clerkId: string) => {
  try {
    await connectToDB();
    let freelancer;
    if(mongoose.Types.ObjectId.isValid(clerkId)){
      freelancer = await Freelancer.findById(clerkId);
    }
    if (clerkId.toString() !== ""){
      freelancer = await Freelancer.findOne({clerkId: clerkId});
    } else {
      const user = await currentUser();
      if (user) {
        freelancer = await Freelancer.findOne({clerkId: user!.id});
      }
      else {
        console.log("No user logged in or found!")
      }
    }
    console.log(freelancer)
      return freelancer.toObject();
  } catch (error) {
      console.error('Error retrieving freelancers:', error);
      throw new Error('Error retrieving freelancers');
  }
}

export const haalFreelancerFlexpool = async  (clerkId: string) => {
    
  try {
      const freelancer = await Freelancer.findById(clerkId);
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



export const haalAlleFreelancers = async (): Promise<Freelancer[]> => {
    try {
        await connectToDB();
        const opdrachtnemers = await Freelancer.find();
        
        console.log(opdrachtnemers)
        return opdrachtnemers || []; // Return an array with 'naam' property
    } catch (error) {
        console.error('Error fetching freelancers:', error);
        throw new Error('Failed to fetch freelancers');
    }
};

export const updateKorregeling = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate({clerkId : clerkId}
            ,{ korregeling: value, },
  { new: true, runValidators: true });

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
} 
export const updateBio = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate({clerkId : clerkId}
            ,{ bio: value, },
  { new: true, runValidators: true });

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
} 
export const updateWerkervaring = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate(
            { clerkId: clerkId },  // Find freelancer by clerkId
            { 
              $addToSet: { werkervaring: value }  // Properly wrap $addToSet inside an object
            },
            { 
              new: true,  // Return the updated document
              runValidators: true  // Ensure schema validation is run
            }
          );

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
}
export const updateOpleiding = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate(
            { clerkId: clerkId },  // Find freelancer by clerkId
            { 
              $addToSet: { opleidingen: value }  // Properly wrap $addToSet inside an object
            },
            { 
              new: true,  // Return the updated document
              runValidators: true  // Ensure schema validation is run
            }
          );

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
} 
export const updateProfielfoto  = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate({clerkId : clerkId},
            
            { profielfoto: value, },
            { new: true, runValidators: true }
            
            );

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
}
export const updateAdres = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate({clerkId : clerkId},
            
            { 
              straatnaam: value[0],
              huisnummer: value[1]
            },
            { new: true, runValidators: true }
  
  );

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
} 
export const updateTelefoonnummer = async (clerkId: string, value: any) => {
    try {
        const freelancer = await Freelancer.findOneAndUpdate({clerkId : clerkId},
            { telefoonnummer: value, },
  { new: true, runValidators: true });

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer;  // Return the updated freelancer object
  } catch (error) {
    console.error('Error updating freelancer:', error);
    throw new Error('Failed to update freelancer');
  }
} 


