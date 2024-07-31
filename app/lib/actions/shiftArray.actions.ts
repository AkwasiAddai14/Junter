"use server";


import mongoose from 'mongoose';
import { connectToDB } from '../mongoose';
import Bedrijf from '../models/bedrijven.model';
import ShiftArray from '../models/shiftArray.model';
import Shift from '@/app/lib/models/shift.model';
import Freelancer from '@/app/lib/models/freelancer.model';



export const haalShifts = async () => {
    try {
        // Find all shiftArrays
        const shiftArrays = await ShiftArray.find();

        // Iterate through each shiftArray
        for (const shiftArray of shiftArrays) {
            // Check if the shifts array is not empty
            if (shiftArray.shifts.length > 0) {
                // Return the first shift in the shifts array
                return shiftArray.shifts[0];
            }
        }

        // If no non-empty shifts array found, return null
        return null;
    } catch (error) {
        console.error('Error fetching shifts:', error);
        throw new Error('Failed to fetch shifts');
    }
};

export const haalGeplaatsteShifts = async ({ bedrijfId }: { bedrijfId: string }) => {
    try {
        // Find the Bedrijf by ID
        const bedrijf = await Bedrijf.findById(bedrijfId).populate('shifts');

        // Check if bedrijf and shifts array exist
        if (!bedrijf || !bedrijf.shifts) {
            throw new Error(`Bedrijf with ID ${bedrijfId} not found or shifts not available`);
        }

        // Find the shiftsArray in the shifts array
        const shiftsArray = bedrijf.shifts.find((shift: { shifts: string | any[]; }) => shift.shifts.length > 0);

        return shiftsArray || null; // Return shiftsArray or null if not found
    } catch (error) {
        console.error('Error fetching geplaatste shifts:', error);
        throw new Error('Failed to fetch geplaatste shifts');
    }
};



export const haalAanmeldingen = async (shiftId: any) => {
  try {
    connectToDB()
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