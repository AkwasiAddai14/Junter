"use server";


import mongoose, { Types } from 'mongoose';
import { connectToDB } from '../mongoose';
import Bedrijf from '../models/bedrijf.model';
import ShiftArray, {IShiftArray} from '../models/shiftArray.model';
import Shift, { ShiftType } from '@/app/lib/models/shift.model';
import Freelancer from '@/app/lib/models/freelancer.model';
import { currentUser } from '@clerk/nextjs/server'
import cron from 'node-cron';



export const haalShifts = async (clerkId : string) => {
  try {
    // Connect to the database
    await connectToDB();
    const freelancer = await Freelancer.findOne({clerkId: clerkId}).populate('shifts').exec();;
    if (!freelancer) {
      throw new Error(`Freelancer with ID ${clerkId} not found`);
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

export const haalAlleShifts = async () => {
  try {
    await connectToDB();

    const allShiftArrays = await ShiftArray.find();

    return allShiftArrays;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw new Error('Failed to fetch shifts');
  }
};


export const haalShift = async (freelancerId: Types.ObjectId) => {
  try {
    await connectToDB();
    // Find the freelancer by their ObjectId
    let freelancer; 
    let shiftsArrayIds: string | any[];
    if(mongoose.Types.ObjectId.isValid(freelancerId)){
      freelancer = await Freelancer.findById(freelancerId);
      if (freelancer && freelancer.shifts && freelancer.shifts.length > 0) {
        // Fetch the related Flexpool documents
        const shifts = await Shift.find({ _id: { $in: freelancer.shifts } }).lean() as ShiftType[];
        // Extract shiftArrayIds from each shift
        console.log("alle shifts: ", shifts)
        shiftsArrayIds = shifts.map(shift => shift.shiftArrayId);
    } else {
      const user = await currentUser();
      if (user) {
         freelancer = await Freelancer.findOne({ clerkId: user.id });
         if (freelancer && freelancer.shifts && freelancer.shifts.length > 0) {
          // Fetch the related shifts documents
          const shifts = await Shift.find({ _id: { $in: freelancer.shifts } }) as ShiftType[];
          // Extract shiftArrayIds from each shift
          shiftsArrayIds = shifts.map(shift => shift.shiftArrayId);
        }
    } else {
      console.log('No shifts found for this freelancer.');
      return [];
    }   
}
    // Find all ShiftArray documents
    const allShiftArrays = await ShiftArray.find({beschikbaar: true});

    // Filter ShiftArrays that do not match any shiftArrayId in the freelancer's shifts
    const filteredShiftArrays = allShiftArrays.filter((shiftArray: any) => 
      !shiftsArrayIds.includes(shiftArray._id.toString())
    );
    console.log("filtered shifts: ", filteredShiftArrays)
    return filteredShiftArrays;
  } 
} catch (error) {
  console.error('Error fetching shifts:', error);
  throw new Error('Failed to fetch shifts');
  }
}


export const haalGeplaatsteShifts = async ({ bedrijfId }: { bedrijfId: string }) => {
  try {
    const bedrijf = await Bedrijf.findById(bedrijfId);

    if (!bedrijf || !bedrijf.shifts) {
      throw new Error(`Bedrijf with ID ${bedrijfId} not found or shifts not available`);
    }

    const shiftArrays = await ShiftArray.find({ _id: { $in: bedrijf.shifts }, beschikbaar: true });
       
    console.log("ShiftArrays: ", JSON.stringify(shiftArrays, null, 2)); // Pretty print the objects for better readability

    return shiftArrays;
  } catch (error) {
    console.error('Error fetching geplaatste shifts:', error);
    throw new Error('Failed to fetch geplaatste shifts');
  }
};

export const haalOngepubliceerdeShifts = async ({ bedrijfId }: { bedrijfId: string }) => {
  try {
    const bedrijf = await Bedrijf.findById(bedrijfId);

    if (!bedrijf || !bedrijf.shifts) {
      throw new Error(`Bedrijf with ID ${bedrijfId} not found or shifts not available`);
    }

    const shiftArrays = await ShiftArray.find(
      { _id: { $in: bedrijf.shifts }, beschikbaar: false, status: 'container' }, 
      ).lean(); // Use lean to return plain JS objects
    console.log("ShiftArrays: ", JSON.stringify(shiftArrays, null, 2)); // Pretty print the objects for better readability
    return shiftArrays;
  } catch (error) {
    console.error('Error fetching geplaatste shifts:', error);
    throw new Error('Failed to fetch geplaatste shifts');
  }
};

export const fetchUnpublishedShifts = async (bedrijfId: string) => {
  try {
    const bedrijf = await Bedrijf.findOne({ clerkId: bedrijfId });
    let shiftArrays: (mongoose.FlattenMaps<IShiftArray> & Required<{ _id: mongoose.FlattenMaps<unknown>; }>)[] = [];

    if (bedrijf) {
      const id = bedrijf._id;
      // Query to find only shifts with beschikbaar: false and status: 'container'
      shiftArrays = await ShiftArray.find(
        { opdrachtgever: id, beschikbaar: false, status: 'container' } // All conditions go here
      ).lean();
    }

    return shiftArrays;
  } catch (error: any) {
    console.error('Error fetching unpublished shifts:', error);
    throw error;
  }
}


export const fetchBedrijfShiftsByClerkId = async (clerkId: string) => {
  try {
    await connectToDB();
    
    // Find the company by its ObjectId
    const bedrijf = await Bedrijf.findOne({ clerkId }).exec();
    
    if (bedrijf) {
      const shiftArrays = await ShiftArray.find({ _id: { $in: bedrijf.shifts } })
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
export const cloudShift = async () => {

cron.schedule('0 * * * *', async () => {
  try {
    const currentDate = new Date();
    const currentTimeString = currentDate.toTimeString().slice(0, 5); // Get current time in HH:MM format

    // Find shifts where the date is today and time has passed
    const shiftsToUpdate = await ShiftArray.find({
      begindatum: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // today's date at midnight
        $lte: new Date(currentDate.setHours(23, 59, 59, 999)) // today's date at 23:59:59
      },
      begintijd: { $lte: currentTimeString }, // shifts where begintijd has passed
      beschikbaar: true // only update if still available
    });

    // Update shifts
    await Promise.all(shiftsToUpdate.map(async (shift) => {
      shift.beschikbaar = false;
      await shift.save();
    }));

    console.log(`${shiftsToUpdate.length} shifts updated to beschikbaar: false.`);
  } catch (error) {
    console.error('Error updating shifts:', error);
  }
})
};

cron.schedule('0 * * * *', async () => {
  try {
    const currentDate = new Date();
    const currentTimeString = currentDate.toTimeString().slice(0, 5); // Get current time in HH:MM format

    // Find shifts where the date is today and time has passed
    const shiftsToUpdate = await ShiftArray.find({
      begindatum: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // today's date at midnight
        $lte: new Date(currentDate.setHours(23, 59, 59, 999)) // today's date at 23:59:59
      },
      begintijd: { $lte: currentTimeString }, // shifts where begintijd has passed
      beschikbaar: true // only update if still available
    });

    // Update shifts
    await Promise.all(shiftsToUpdate.map(async (shift) => {
      shift.beschikbaar = false;
      await shift.save();
    }));

    console.log(`${shiftsToUpdate.length} shifts updated to beschikbaar: false.`);
  } catch (error) {
    console.error('Error updating shifts:', error);
  }
});

export const cloudShifts = async () => {
  try {
    const currentDate = new Date();
    const currentTimeString = currentDate.toTimeString().slice(0, 5); // Get current time in HH:MM format

    // Find shifts where the date is today and time has passed
    const shiftsToUpdate = await ShiftArray.find({
      begindatum: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // today's date at midnight
        $lte: new Date(currentDate.setHours(23, 59, 59, 999)) // today's date at 23:59:59
      },
      begintijd: { $lte: currentTimeString }, // shifts where begintijd has passed
      beschikbaar: true // only update if still available
    });

    // Update shifts
    await Promise.all(shiftsToUpdate.map(async (shift) => {
      shift.beschikbaar = false;
      await shift.save();
    }));

    console.log(`${shiftsToUpdate.length} shifts updated to beschikbaar: false.`);
  } catch (error) {
    console.error('Error updating shifts:', error);
  }
}