"use server";

import mongoose, { Schema, Document, ObjectId }  from "mongoose";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import Freelancer from "../models/freelancer.model";
import Bedrijf from "../models/bedrijf.model";
import Flexpool from "../models/flexpool.model";
import Shift, { ShiftType } from "../models/shift.model";
import ShiftArray from "../models/shiftArray.model";
import Pauze from "@/app/lib/models/pauze.model";
import Category from "../models/categorie.model";
import dayjs from 'dayjs';


export type voegAangepastParams = {
  Aangepast: string
}

export const voegAangepast = async ({ Aangepast }: voegAangepastParams) => {
  try {
    await connectToDB();

    const Voegaangepast = await Pauze.create({ name: Aangepast });

    return JSON.parse(JSON.stringify(Voegaangepast));
  } catch (error: any) {
    console.log(error)
  }
}


interface Params {
  opdrachtgever: string;
  opdrachtgeverNaam: string;
  titel: string;
  functie: string;
  afbeelding: string;
  uurtarief: number;
  plekken: number;
  adres: string;
  begindatum: Date;
  einddatum: Date;
  begintijd: String;
  eindtijd: String;
  pauze?: string;
  beschrijving: string;
  vaardigheden?: string[];
  kledingsvoorschriften?: string[];
  opdrachtnemers?: string[];
  flexpoolId?: string;
  checkoutbegintijd: String;
  checkouteindtijd: String;
  checkoutpauze: String;
  feedback: string;
  shiftArrayId: string;
  opmerking: string;
  ratingFreelancer: number;
  ratingBedrijf: number;
  path: string;
  status: string; // Ensure this is provided
}

export async function maakShift({
  opdrachtgever,
  opdrachtgeverNaam,
  titel,
  functie,
  afbeelding,
  uurtarief,
  plekken,
  adres,
  begindatum,
  einddatum,
  begintijd,
  eindtijd,
  pauze,
  beschrijving,
  vaardigheden,
  kledingsvoorschriften,
  opdrachtnemers = [],
  flexpoolId,
  path,
  status,
  checkoutbegintijd,
  checkouteindtijd,
  checkoutpauze,
  feedback,
  shiftArrayId,
  opmerking,
  ratingFreelancer,
  ratingBedrijf,
}: Params) {
  try {
    await connectToDB();

    // Validate and convert opdrachtgever to ObjectId
    if (!opdrachtgever || !mongoose.Types.ObjectId.isValid(opdrachtgever)) {
      throw new Error('Invalid opdrachtgever ID');
    }
    const opdrachtgeverId = new mongoose.Types.ObjectId(opdrachtgever);
    const opdrachtgevernaam = opdrachtgeverNaam || "Junter"

    // Validate flexpoolId if provided
    let flexpoolObjectId: mongoose.Types.ObjectId | undefined;
    if (flexpoolId) {
      if (!mongoose.Types.ObjectId.isValid(flexpoolId)) {
        throw new Error('Invalid flexpool ID');
      }
      flexpoolObjectId = new mongoose.Types.ObjectId(flexpoolId);
    }

    // Generate dates between begindatum and einddatum
    const start = dayjs(begindatum);
    const end = dayjs(einddatum);
    const dateRange: dayjs.Dayjs[] = [];

    for (let date = start; date.isBefore(end) || date.isSame(end, 'day'); date = date.add(1, 'day')) {
      dateRange.push(date);
    }

    let firstShift: ShiftType | null = null;

    for (const date of dateRange) {
      const dateString = date.toDate();

      // Create ShiftArray for the specific date
      const shiftArray = new ShiftArray({
        opdrachtgever: opdrachtgeverId,
        opdrachtgeverNaam: opdrachtgevernaam,
        titel,
        functie,
        afbeelding,
        uurtarief: Number(uurtarief),
        plekken: Number(plekken),
        adres,
        begindatum: dateString,
        einddatum: dateString,
        begintijd,
        eindtijd,
        pauze,
        beschrijving,
        vaardigheden,
        kledingsvoorschriften,
        opdrachtnemers,
        status,
        inFlexpool: !!flexpoolId,
      });

      const savedShiftArray = await shiftArray.save();

      // Create 'plekken' number of Shifts for the ShiftArray and push them to the shiftArray's shifts array
      for (let i = 0; i < plekken; i++) {
        const shift = new Shift({
          opdrachtgever: opdrachtgeverId,
          opdrachtgeverNaam,
          titel,
          functie,
          afbeelding,
          uurtarief: Number(uurtarief),
          plekken: 1, // Each shift has only one spot
          adres,
          begindatum: dateString,
          einddatum: dateString,
          begintijd,
          eindtijd,
          pauze,
          beschrijving,
          vaardigheden,
          kledingsvoorschriften,
          opdrachtnemers,
          status,
          shiftArrayId: savedShiftArray._id as mongoose.Types.ObjectId,
          checkoutbegintijd,
          checkouteindtijd,
          checkoutpauze,
          feedback,
          opmerking,
          ratingFreelancer,
          ratingBedrijf,
        });

        const savedShift = await shift.save();
        savedShiftArray.shifts.push(savedShift._id as unknown as mongoose.Types.ObjectId);

        if (!firstShift) {
          firstShift = savedShift;
        }
      }

      await savedShiftArray.save();

      // Push the saved ShiftArray into the Bedrijf's shifts array
      await Bedrijf.findByIdAndUpdate(opdrachtgeverId, {
        $push: { shifts: savedShiftArray._id },
      });

      // If a flexpoolId is provided, add the ShiftArray to the Flexpool
      if (flexpoolObjectId) {
        const flexpool = await Flexpool.findById(flexpoolObjectId);
        if (flexpool) {
          flexpool.shifts.push(savedShiftArray._id as mongoose.Schema.Types.ObjectId);
          await flexpool.save();
        } else {
          throw new Error(`Flexpool with ID ${flexpoolId} not found`);
        }
      }
    }

    return true; // Return true if successful
  } catch (error) {
    console.error('Error creating shift:', error);
    throw new Error('Error creating shift');
  }
}


  
  export async function updateShift({
    opdrachtgever,
    opdrachtgeverNaam,
    titel,
    afbeelding,
    uurtarief,
    plekken,
    adres,
    begindatum,
    einddatum,
    begintijd,
    eindtijd,
    pauze,
    beschrijving,
    vaardigheden,
    kledingsvoorschriften,
    opdrachtnemers = [],
    flexpoolId,
    path,
    status,
    checkoutbegintijd,
    checkouteindtijd,
    checkoutpauze,
    feedback,
    opmerking,
    ratingFreelancer,
    ratingBedrijf,
  }: Params) {
    try {
      await connectToDB();
  
      const shiftData: any = {
        opdrachtgever: new mongoose.Types.ObjectId(opdrachtgever),
        opdrachtgeverNaam,
        titel,
        afbeelding,
        uurtarief: Number(uurtarief),
        plekken: Number(plekken),
        adres,
        begindatum,
        einddatum,
        begintijd,
        eindtijd,
        pauze,
        beschrijving,
        vaardigheden,
        kledingsvoorschriften,
        status,
        checkoutbegintijd,
        checkouteindtijd,
        checkoutpauze,
        feedback,
        opmerking,
        ratingFreelancer,
        ratingBedrijf,
      };
  
      // Check if the number of opdrachtnemers (freelancers) is equal to the number of plekken (spots)
      if (opdrachtnemers.length === plekken) {
        shiftData.beschikbaar = false;
      }
  
      if (flexpoolId) {
        const flexpool = await Flexpool.findById(flexpoolId);
        if (flexpool) {
          shiftData.flexpool = flexpool._id;
        } else {
          throw new Error(`Flexpool with ID ${flexpoolId} not found`);
        }
      }
  
      if (opdrachtnemers.length > 0) {
        const freelancers = await Freelancer.find({ _id: { $in: opdrachtnemers.map(id => new mongoose.Types.ObjectId(id)) } });
        shiftData.opdrachtnemer = freelancers.map(freelancer => freelancer._id);
      }
  
      const filter = { opdrachtgever: new mongoose.Types.ObjectId(opdrachtgever), titel, begindatum, begintijd, eindtijd }; // Define the criteria to find the existing shift
      const options = { upsert: true, new: true }; // Create a new document if none is found, and return the new document
  
      const updatedShift = await Shift.findOneAndUpdate(filter, shiftData, options);
  
      if (!updatedShift) {
        throw new Error('Failed to update or create shift: Shift not found or created.');
      }
  
      if (updatedShift.isNew) {
        // If a new shift was created, update the relevant Bedrijf and Flexpool
        await Bedrijf.findByIdAndUpdate(opdrachtgever, {
          $push: { shifts: updatedShift._id },
        });
  
        if (flexpoolId) {
          await Flexpool.findByIdAndUpdate(flexpoolId, {
            $push: { shifts: updatedShift._id },
          });
        }
      }
  
      revalidatePath(path);
      return updatedShift;
    } catch (error: any) {
      throw new Error(`Failed to update or create shift: ${error.message}`);
    }
  }
  

interface DeleteShiftArrayParams {
    shiftArrayId: string;
    forceDelete: boolean;
    path: string;
};

export async function verwijderShiftArray({
    shiftArrayId,
    forceDelete = false,
    path
  }: DeleteShiftArrayParams) {
    try {
      await connectToDB();
  
      const shiftArray = await ShiftArray.findById(shiftArrayId);
  
      if (!shiftArray) {
        throw new Error(`ShiftsArray with ID ${shiftArrayId} not found`);
      }
  
      const currentTime = new Date();
      const shiftBegintijd = new Date(shiftArray.begintijd);
      // Check if the ShiftsArray should be deleted based on begintijd and aanmeldingen array
      if (forceDelete || (shiftBegintijd < currentTime && shiftArray.aanmeldingen.length === 0)) {
        // Remove the shifts from the related Bedrijf and Flexpool documents
        await Bedrijf.findByIdAndUpdate(shiftArray.opdrachtgever, {
          $pull: { shifts: { $in: shiftArray.shifts } }
        });
  
        if (shiftArray.flexpools) {
          await Flexpool.findByIdAndUpdate(shiftArray.flexpools, {
            $pull: { shifts: { $in: shiftArray.shifts } }
          });
        }
  
        // Delete all shifts in the ShiftsArray
        await Shift.deleteMany({ _id: { $in: shiftArray.shifts } });
  
        // Delete the ShiftsArray
        await ShiftArray.findByIdAndDelete(shiftArrayId);
  
        revalidatePath(path);
        return { success: true, message: 'ShiftsArray and associated shifts successfully deleted' };
      } else {
        return { success: false, message: 'ShiftsArray cannot be deleted based on the current conditions' };
      }
    } catch (error: any) {
      throw new Error(`Failed to delete ShiftsArray: ${error.message}`);
    }
  }

  interface ReageerShiftParams {
    shiftArrayId: string;
    freelancerId: string;
  }
  
  export async function reageerShift({
    shiftArrayId,
    freelancerId,
  }: ReageerShiftParams) {
    try {
      await connectToDB();
  
      // Find the ShiftArray by ID and populate the shifts with full documents
      const shiftArray = await ShiftArray.findById(shiftArrayId).populate('shifts');
  
      if (!shiftArray) {
        throw new Error(`ShiftArray with ID ${shiftArrayId} not found`);
      }
  
      // Find the freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }
  
      // Ensure that shifts is an array of ShiftType
      if (Array.isArray(shiftArray.shifts) && typeof shiftArray.shifts[0] !== 'string') {
        const populatedShifts = shiftArray.shifts as unknown as ShiftType[];
  
        // Check if the freelancer is in the same flexpool
        const inSameFlexpool = shiftArray.flexpools.some((fp) =>
          freelancer.flexpools.includes(fp as mongoose.Types.ObjectId)
        );
  
        if (inSameFlexpool) {
          // Assign the first Shift from the ShiftArray to the freelancer
          const firstShift = populatedShifts[0];
          firstShift.opdrachtnemer = freelancer._id;
          firstShift.status = 'aangenomen';
  
          await firstShift.save();
  
          // Update the freelancer's shifts array
          freelancer.shifts.push({
            shift: firstShift._id,
            status: 'aangenomen',
          });
  
          await freelancer.save();
        } else {
          // Add the freelancer to the ShiftArray aanmeldingen array
          shiftArray.aanmeldingen.push(freelancer._id);
          await shiftArray.save();
  
          // Create a new shift with status 'aangemeld' for the freelancer
          const newShift = new Shift({
            ...populatedShifts[0],
            shiftArrayId,
            aanmeldingen: [],
            opdrachtnemer: freelancer._id,
            status: 'aangemeld',
          });
  
          await newShift.save();
  
          // Update the freelancer's shifts array
          freelancer.shifts.push({
            shift: newShift._id,
            status: 'aangemeld',
          });
  
          await freelancer.save();
        }
      } else {
        throw new Error('Shifts were not populated correctly.');
      }
  
      return { success: true, message: 'Freelancer successfully applied for the shift' };
    } catch (error: any) {
      throw new Error(`Failed to apply for shift: ${error.message}`);
    }
  }


  interface AnnuleerAanmeldingenParams {
    shiftArrayId: string;
    freelancerId: string;
  }
  
  export async function annuleerAanmeldingen({
    shiftArrayId,
    freelancerId
  }: AnnuleerAanmeldingenParams) {
    try {
      await connectToDB();

      const shiftArrayObjectId = new mongoose.Types.ObjectId(shiftArrayId);
      const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);
  
      // Find the ShiftsArray by ID
      const shiftArray = await ShiftArray.findById(shiftArrayObjectId);
      if (!shiftArray) {
        throw new Error(`ShiftsArray with ID ${shiftArrayId} not found`);
      }
  
      // Find the freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }
  
      // Check if the freelancer is in the aanmeldingen array
      if (!shiftArray.aanmeldingen.includes(freelancerObjectId)) {
        return { success: false, message: "Freelancer is not applied for this ShiftsArray" };
      }
  
      // Remove the freelancer from the aanmeldingen array
      shiftArray.aanmeldingen = shiftArray.aanmeldingen.filter((id: { toString: () => string; }) => id.toString() !== freelancerId);
      await shiftArray.save();
  
      // Remove the shift from the freelancer's shifts array
      freelancer.shifts = freelancer.shifts.filter((shift: any[]) => shift.shift.toString() !== shiftArrayId);
      await freelancer.save();
  
      return { success: true, message: "Freelancer successfully removed from the ShiftsArray's aanmeldingen and shift removed from the freelancer's shifts array" };
    } catch (error: any) {
      throw new Error(`Failed to remove freelancer from ShiftsArray and shift from freelancer: ${error.message}`);
    }
  }

export async function annuleerShift(){

};


interface AccepteerFreelancerParams {
    shiftId: string;
    freelancerId: string;
}

export async function accepteerFreelancer({
    shiftId,
    freelancerId
}: AccepteerFreelancerParams) {
    try {
        await connectToDB();
       
        const shiftObjectId = new mongoose.Types.ObjectId(shiftId);
        const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);
        // Find the shift by ID
        const shift = await Shift.findById(shiftId).populate('opdrachtnemer');
        if (!shift) {
            throw new Error(`Shift with ID ${shiftId} not found`);
        }

        // Find the shift array by ID
        const shiftArray = await ShiftArray.findById(shift.shiftArrayId);
        if (!shiftArray) {
            throw new Error(`ShiftArray with ID ${shift.shiftArrayId} not found`);
        }

        // Move the freelancer from the aanmeldingen array to the opdrachtnemers array
        const aanmeldingenIndex = shiftArray.aanmeldingen.indexOf(freelancerObjectId);
        if (aanmeldingenIndex > -1) {
            shiftArray.aanmeldingen.splice(aanmeldingenIndex, 1);
        }
        

        // Find the freelancer by ID
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            throw new Error(`Freelancer with ID ${freelancerId} not found`);
        }

        if (shift.opdrachtnemer === undefined) {
          shift.opdrachtnemer = freelancerObjectId; ;
        } else {
          console.log("Action failed.")
        }

        if (!Array.isArray(shiftArray.shifts) || shiftArray.shifts.length === 0) {
          throw new Error('No shifts found in the shiftArray.');
      }
        // Find the first shift in the shift array's shifts array
        const firstShiftId = shiftArray.shifts[0];
        const firstShift = await Shift.findById(firstShiftId);
        if (!firstShift) {
            throw new Error(`Shift with ID ${firstShiftId} not found`);
        }

        // Add the first shift to the freelancer's shifts array
        freelancer.shifts.push({ shift: firstShift._id, status: 'aangenomen' });

        // Remove the shift instance in the freelancer's shifts array with the same shiftArrayId and status 'aangemeld'
        freelancer.shifts = freelancer.shifts.filter((s: { shiftArrayId: { toString: () => any; }; status: string; }) => {
          const shiftArrayIdString = (shiftArray._id as mongoose.Types.ObjectId).toString();
          return s.shiftArrayId.toString() !== shiftArrayIdString || s.status !== 'aangemeld';
        });

        // Save the updates
        await shiftArray.save();
        await freelancer.save();
        await shift.save();

        return { success: true, message: "Freelancer successfully accepted for the shift" };
    } catch (error: any) {
        throw new Error(`Failed to accept freelancer for shift: ${error.message}`);
    }
}


interface AfwijzenFreelancerParams {
    shiftId: string;
    freelancerId: string;
}

export async function afwijzenFreelancer({ shiftId, freelancerId }: AfwijzenFreelancerParams) {
    try {
        await connectToDB();

        // Find the shift
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new Error(`Shift with ID ${shiftId} not found`);
        }

        // Change the status of the shift to 'afgewezen'
        shift.status = 'afgewezen';
        await shift.save();

        // Find the shift array by ID
        const shiftArray = await ShiftArray.findById(shift.shiftArrayId);
        if (!shiftArray) {
            throw new Error(`ShiftArray with ID ${shift.shiftArrayId} not found`);
        }

        // Remove the freelancer from the aanmeldingen array
        shiftArray.aanmeldingen = shiftArray.aanmeldingen.filter((id: { toString: () => string; }) => id.toString() !== freelancerId);
        await shiftArray.save();

        // Find the freelancer
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            throw new Error(`Freelancer with ID ${freelancerId} not found`);
        }

        // Update the freelancer's shift status to 'afgewezen'
        const shiftIndex = freelancer.shifts.findIndex((s: any) => s.shift.toString() === shiftId);
        if (shiftIndex > -1) {
            freelancer.shifts[shiftIndex].status = 'afgewezen';
        } else {
            throw new Error(`Shift with ID ${shiftId} not found in freelancer's shifts`);
        }
        await freelancer.save();

        return { success: true, message: 'Freelancer rejected successfully' };
    } catch (error: any) {
        throw new Error(`Failed to reject freelancer: ${error.message}`);
    }
}
interface afrondenShiftParams {
    shiftId: string;
}
export async function afrondenShift({ shiftId} :afrondenShiftParams) {
    try {
        await connectToDB();

        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new Error(`Shift with ID ${shiftId} not found`);
        }

        const now = new Date();
        const eindtijd = new Date(shift.eindtijd);
        if (now <= eindtijd) {
            return { success: false, message: 'Shift has not ended yet' };
        }

        const freelancers = await Freelancer.find({
            'shifts.shift': shiftId,
            'shifts.status': 'aangenomen'
        });

        for (const freelancer of freelancers) {
            const shiftIndex = freelancer.shifts.findIndex((s: any[]) => s.shift.toString() === shiftId);
            if (shiftIndex > -1) {
                freelancer.shifts[shiftIndex].status = 'voltooi checkout';
                await freelancer.save();
            }
        }

        return { success: true, message: 'Shift completed successfully' };
    } catch (error:any) {
        throw new Error(`Failed to complete shift: ${error.message}`);
    }
}

interface FilterParams {
    tarief?: number;
    range?: number;
    dates?: Date | Date[];
    freelancerLocation?: { lat: number, lng: number };
}

export async function filterShift({ tarief, range, dates, freelancerLocation }: FilterParams) {
    try {
        await connectToDB();

        // Initialize the query object
        const query: any = {};

        // Filter by tarief (hourly rate)
        if (tarief !== undefined) {
            query.uurtarief = { $gte: tarief };
        }

        // Filter by date(s)
        if (dates) {
            if (Array.isArray(dates)) {
                query.datum = { $in: dates };
            } else if (dates instanceof Date) {
                query.datum = dates;
            }
        }

        // Find shifts that match the initial query
        let shifts = await Shift.find(query);

        // Filter by range (distance from freelancer's location)
        if (range !== undefined && freelancerLocation) {
            const { lat, lng } = freelancerLocation;
            shifts = shifts.filter(async shift => {
                const shiftLocation = await getCoordinatesFromAddress(shift.adres); // You need to implement this function
                const distance = calculateDistance(lat, lng, shiftLocation.lat, shiftLocation.lng); // You need to implement this function
                return distance <= range;
            });
        }

        return shifts;
    } catch (error:any) {
        throw new Error(`Failed to filter shifts: ${error.message}`);
    }
}

// Example function to calculate the distance between two coordinates
// You can use the Haversine formula or a library like geolib
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Example function to get coordinates from an address
// You might need to use an API like Google Maps Geocoding API
async function getCoordinatesFromAddress(address: string) {
    // Dummy implementation, replace with actual geocoding logic
    return { lat: 52.3676, lng: 4.9041 }; // Coordinates for Amsterdam, for example
}

const populateShift = (query: any) => {
  return query
    .populate({ path: 'opdrachtgever', model: Bedrijf, select: 'naam displaynaam' })
    .populate({ path: 'flexpools', model: Flexpool, select: 'titel' })
}

export async function haalShiftMetId(shiftId: string) {
  try {
    await connectToDB();

    const shift = await populateShift(Shift.findById(shiftId)).exec();

    if (!shift) throw new Error('Shift not found');

    return JSON.parse(JSON.stringify(shift));
  } catch (error: any) {
    console.error(error);
    throw new Error('Failed to fetch shift');
  }
}

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

export type GetRelatedEventsByCategoryParams = {
  categoryId: string
  shiftId: string
  limit?: number
  page: number | string
}

export async function haalGerelateerdShiftsMetCategorie({
  categoryId,
  shiftId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDB()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: shiftId } }] }

    const eventsQuery = Shift.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateShift(eventsQuery)
    const eventsCount = await Shift.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    console.log(error)
  }
}



export const haalShiftMetIdCard = async (id: string) => {
  try {
    const shift = await Shift.findById(id)
      .populate('opdrachtgever')
      .populate('flexpools')
      .exec();
    return shift;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};
