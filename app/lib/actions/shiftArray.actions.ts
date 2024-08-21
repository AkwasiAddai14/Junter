"use server";


import mongoose from 'mongoose';
import { connectToDB } from '../mongoose';
import Bedrijf from '../models/bedrijf.model';
import ShiftArray, {IShiftArray} from '../models/shiftArray.model';
import Shift, { ShiftType } from '@/app/lib/models/shift.model';
import Freelancer from '@/app/lib/models/freelancer.model';



export const haalShifts = async () => {
  try {
      // Find all shiftArrays
      await connectToDB()
      const shiftArrays = await ShiftArray.find();

      // Iterate through each shiftArray
      for (const shiftArray of shiftArrays) {
          // Check if the shifts array is not empty
          const populatedShifts = shiftArray.shifts as (ShiftType | mongoose.Types.ObjectId)[];
          
          if (Array.isArray(populatedShifts) && populatedShifts.length > 0) {
              // Return the first shift in the shifts array
              return populatedShifts[0];
          }
      }
      // If no non-empty shifts array found, return null
      return null;
  } catch (error) {
      console.error('Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
  }
};

export const haalShift = async () => {
  try {
      // Find all shiftArrays
      await connectToDB()
      const shifts = await Shift.find();

      // Iterate through each shiftArray
          if (shifts) {
              // Return the first shift in the shifts array
              return shifts;
          }

      // If no non-empty shifts array found, return null
      return null;
  } catch (error) {
      console.error('Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
  }
};


export const haalGeplaatsteShifts = async ({ bedrijfId }: { bedrijfId: string }): Promise<any[] | null> => {
  try {
    await connectToDB();

    // Find the bedrijf and populate the shifts array with ShiftArray documents
    const bedrijf = await Bedrijf.findById(bedrijfId).populate({
      path: 'shifts',          // Populating the ShiftArray documents
    });

    if (!bedrijf || !bedrijf.shifts || bedrijf.shifts.length === 0) {
      console.log('No ShiftArrays found for this bedrijf');
      return null;
    }
    // Return the populated ShiftArray documents
    console.log(bedrijf.shifts)
    return bedrijf.shifts;
  } catch (error) {
    console.error('Error fetching ShiftArrays:', error);
    throw new Error('Failed to fetch ShiftArrays');
  }
};




export const haalAanmeldingen = async (shiftId: any) => {
  try {
    await connectToDB()
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    const shiftArray = await ShiftArray.findOne({ shiftArrayId: shift.shiftArrayId }).populate('aanmeldingen');
    if (!shiftArray) {
      throw new Error(`ShiftArray with ID ${shift.shiftArrayId} not found`);
    }

    const freelancers = await Freelancer.find({
      _id: { $in: shiftArray.aanmeldingen }
    });

    return freelancers;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch aanmeldingen: ${error.message}`);
  }
};