"use server";


import mongoose, { Types } from 'mongoose';
import { connectToDB } from '../mongoose';
import Bedrijf from '../models/bedrijf.model';
import ShiftArray, {IShiftArray} from '../models/shiftArray.model';
import Shift, { ShiftType } from '@/app/lib/models/shift.model';
import Freelancer from '@/app/lib/models/freelancer.model';
import { currentUser } from '@clerk/nextjs/server'



export const haalShifts = async (): Promise<IShiftArray[] | ShiftType[] | null> => {
  try {
    // Connect to the database
    await connectToDB();
    const shiftArrays = await ShiftArray.find(); // Ensure shifts are populated with full details
    // Filter out any shiftArrays that have empty shifts arrays
    const nonEmptyShiftArrays = shiftArrays.filter((shiftArray) => 
      Array.isArray(shiftArray.shifts) && shiftArray.shifts.length > 0
    );

    // If we find non-empty shift arrays, return them
    if (nonEmptyShiftArrays.length > 0) {
      return nonEmptyShiftArrays as IShiftArray[] | ShiftType[]; // Cast to IShiftArray[]
    }

    // If no non-empty shifts array found, return an empty array
    return [];
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw new Error('Failed to fetch shifts');
  }
};



export const haalShift = async (freelancerId: Types.ObjectId) => {
  try {
    await connectToDB();

    // Find the freelancer by their ObjectId
    const freelancer = await Freelancer.findById(freelancerId).populate('shifts').exec();
    
    if (!freelancer) {
      throw new Error(`Freelancer with ID ${freelancerId} not found`);
    }

    // Extract shiftArrayIds from the freelancer's shifts
    const freelancerShiftArrayIds = freelancer.shifts.map((shift: any) => shift.shiftArrayId.toString());
    console.log(freelancerShiftArrayIds)
    // Find all ShiftArray documents
    const allShiftArrays = await ShiftArray.find();

    // Filter ShiftArrays that do not match any shiftArrayId in the freelancer's shifts
    const filteredShiftArrays = allShiftArrays.filter((shiftArray: any) => 
      !freelancerShiftArrayIds.includes(shiftArray._id.toString())
    );
    return filteredShiftArrays;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw new Error('Failed to fetch shifts');
  }
};


export const haalGeplaatsteShifts = async ({ bedrijfId }: { bedrijfId: string }) => {
  try {
    const bedrijf = await Bedrijf.findById(bedrijfId);

    if (!bedrijf || !bedrijf.shifts) {
      throw new Error(`Bedrijf with ID ${bedrijfId} not found or shifts not available`);
    }

    const shiftArrays = await ShiftArray.find({ _id: { $in: bedrijf.shifts } })
      .populate('shifts')
      .lean(); // Use lean to return plain JS objects

    console.log("ShiftArrays: ", JSON.stringify(shiftArrays, null, 2)); // Pretty print the objects for better readability

    return shiftArrays;
  } catch (error) {
    console.error('Error fetching geplaatste shifts:', error);
    throw new Error('Failed to fetch geplaatste shifts');
  }
};

export const fetchBedrijfShiftsByClerkId = async (clerkId: string) => {
  try {
    await connectToDB();
    
    // Find the company by its ObjectId
    const bedrijf = await Bedrijf.findOne({ clerkId }).exec();
    
    if (bedrijf) {
      const shiftArrays = await ShiftArray.find({ _id: { $in: bedrijf.shifts } })
      .populate('shifts')
      .lean(); // Use lean to return plain JS objects

    console.log("ShiftArrays: ", JSON.stringify(shiftArrays, null, 2)); // Pretty print the objects for better readability

    return shiftArrays;
    }
    
    throw new Error('Bedrijf not found');
  } catch (error) {
    console.error('Error fetching bedrijf details:', error);
    throw error;
  }
};



export const haalAanmeldingen = async (shiftId: any) => {
  try {
    await connectToDB()
    const shift = await ShiftArray.findById(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    const freelancers = await Freelancer.find({
      _id: { $in: shift.aanmeldingen }
    });
    console.log(freelancers)
    return freelancers;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch aanmeldingen: ${error.message}`);
  }
};

export const haalAangenomen = async (shiftId: any) => {
  try {
    await connectToDB()
    const shift = await ShiftArray.findById(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    const freelancers = await Freelancer.find({
      _id: { $in: shift.aangenomen }
    });
    console.log(freelancers)
    return freelancers;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch aangenomen ${error.message}`);
  }
};

export const haalReserves = async (shiftId: any) => {
  try {
    await connectToDB()
    const shift = await ShiftArray.findById(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    const freelancers = await Freelancer.find({
      _id: { $in: shift.reserves }
    });
    console.log(freelancers)
    return freelancers;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch reserves: ${error.message}`);
  }
};