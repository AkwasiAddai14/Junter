"use server";


import mongoose from 'mongoose';
import { connectToDB } from '../mongoose';
import Bedrijf from '../models/bedrijven.model';
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


export const haalGeplaatsteShifts = async ({ bedrijfId }: { bedrijfId: string }): Promise<IShiftArray | null> => {
  try {
    // Find the Bedrijf by ID and populate the shifts array, ensuring full documents are populated
    await connectToDB()
    const bedrijf = await Bedrijf.findById(bedrijfId).populate<{
      shifts: IShiftArray[];
    }>({
      path: 'shifts', // Path to populate
      populate: { path: 'opdrachtgever aanmeldingen flexpools', model: 'Freelancer Shift Bedrijf Flexpool' }, // Ensure all related fields are populated
    });

    // Check if bedrijf and shifts array exist
    if (!bedrijf || !bedrijf.shifts) {
      throw new Error(`Bedrijf with ID ${bedrijfId} not found or shifts not available`);
    }

    // Iterate over each shifts array in bedrijf.shifts to find the first non-empty one
    for (const shiftArray of bedrijf.shifts) {
      // Check if the shifts array is populated and has elements
      if (Array.isArray(shiftArray.shifts) && shiftArray.shifts.length > 0) {
        return shiftArray.shifts[0] as unknown as IShiftArray; // Return the first shift found
      }
    }

    // If no non-empty shifts array found, return null
    return null;
  } catch (error) {
    console.error('Error fetching geplaatste shifts:', error);
    throw new Error('Failed to fetch geplaatste shifts');
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