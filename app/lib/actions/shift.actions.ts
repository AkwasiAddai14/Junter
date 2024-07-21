"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import Freelancer from "../models/freelancer.model";
import Bedrijf from "../models/bedrijven.model";
import Flexpool from "../models/flexpool.model";
import Shift from "../models/shift.model";
import ShiftArray from "../models/shiftArray.model";


interface Params {
    opdrachtgever: string;
    titel: string;
    functie: string;
    afbeelding: string;
    uurtarief: number;
    plekken: number;
    adres: string;
    datum: Date;
    begintijd: string;
    eindtijd: string;
    pauze?: number;
    beschrijving: string;
    vaardigheden?: string;
    kledingsvoorschriften?: string;
    opdrachtnemers?: string[];
    flexpoolId?: string;
    path: string;
  }
  
  export async function maakShift({
    opdrachtgever,
    titel,
    functie,
    afbeelding,
    uurtarief,
    plekken,
    adres,
    datum,
    begintijd,
    eindtijd,
    pauze,
    beschrijving,
    vaardigheden,
    kledingsvoorschriften,
    opdrachtnemers = [],
    flexpoolId,
    path
  }: Params) {
    try {
      await connectToDB();
  
      const shiftArrayData: any = {
        opdrachtgever,
        titel,
        functie,
        afbeelding,
        uurtarief,
        plekken,
        adres,
        datum,
        begintijd,
        eindtijd,
        pauze,
        beschrijving,
        vaardigheden,
        kledingsvoorschriften,
        shifts: []
      };
  
      if (flexpoolId) {
        const flexpool = await Flexpool.findById(flexpoolId);
        if (flexpool) {
          shiftArrayData.flexpool = flexpool._id;
        } else {
          throw new Error(`Flexpool with ID ${flexpoolId} not found`);
        }
      }
  
      const shiftArray = await ShiftArray.create(shiftArrayData);
  
      for (let i = 0; i < plekken; i++) {
        const shiftData: any = {
          opdrachtgever,
          titel,
          afbeelding,
          uurtarief,
          plekken: 1, // Each individual shift has only one place
          adres,
          datum,
          begintijd,
          eindtijd,
          pauze,
          beschrijving,
          vaardigheden,
          kledingsvoorschriften,
          beschikbaar: true,
          inFlexpool: flexpoolId ? true : false,
          status: 'open', // Example status, adjust as needed
          shiftArrayId: shiftArray._id // Include the shiftArrayId
        };
  
        if (opdrachtnemers.length > 0) {
          const freelancers = await Freelancer.find({ _id: { $in: opdrachtnemers } });
          shiftData.opdrachtnemer = freelancers.map(freelancer => freelancer._id);
        }
  
        const gemaakteShift = await Shift.create(shiftData);
        shiftArray.shifts.push(gemaakteShift._id);
  
        await Bedrijf.findByIdAndUpdate(opdrachtgever, {
          $push: { shifts: gemaakteShift._id }
        });
  
        if (flexpoolId) {
          await Flexpool.findByIdAndUpdate(flexpoolId, {
            $push: { shifts: gemaakteShift._id }
          });
        }
      }
  
      await shiftArray.save();
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }
  }


export async function updateShift({
    opdrachtgever,
    titel,
    afbeelding,
    uurtarief,
    plekken,
    adres,
    datum,
    begintijd,
    eindtijd,
    pauze,
    beschrijving,
    vaardigheden,
    kledingsvoorschriften,
    opdrachtnemers = [],
    flexpoolId,
    path
}: Params) {
    try {
        await connectToDB();

        const shiftData: any = {
            opdrachtgever,
            titel,
            afbeelding,
            uurtarief,
            plekken,
            adres,
            datum,
            begintijd,
            eindtijd,
            pauze,
            beschrijving,
            vaardigheden,
            kledingsvoorschriften,
        };

        // Check if the number of opdrachtnemers (freelancers) is equal to the number of plekken (spots)
        if (opdrachtnemers.length === plekken) {
            shiftData.beschikbaar = false;
        }

        if (flexpoolId) {
            const flexpool = await Flexpool.findById(flexpoolId);
            if (flexpool) {
                shiftData.flexpools = flexpool._id;
            } else {
                throw new Error(`Flexpool with ID ${flexpoolId} not found`);
            }
        }

        if (opdrachtnemers.length > 0) {
            const freelancers = await Freelancer.find({ _id: { $in: opdrachtnemers } });
            shiftData.opdrachtnemer = freelancers.map(freelancer => freelancer._id);
        }

        const filter = { opdrachtgever, titel, datum, begintijd, eindtijd }; // Define the criteria to find the existing shift
        const options = { upsert: true, new: true }; // Create a new document if none is found, and return the new document

        const updatedShift = await Shift.findOneAndUpdate(filter, shiftData, options);

        if (updatedShift.isNew) {
            // If a new shift was created, update the relevant Bedrijf and Flexpool
            await Bedrijf.findByIdAndUpdate(opdrachtgever, {
                $push: { shifts: updatedShift._id }
            });

            if (flexpoolId) {
                await Flexpool.findByIdAndUpdate(flexpoolId, {
                    $push: { shifts: updatedShift._id }
                });
            }
        }

        revalidatePath(path);
        return updatedShift;
    } catch (error: any) {
        throw new Error(`Failed to update or create shift: ${error.message}`);
    }
};

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
  
      // Check if the ShiftsArray should be deleted based on begintijd and aanmeldingen array
      if (forceDelete || (shiftArray.begintijd < currentTime && shiftArray.aanmeldingen.length === 0)) {
        // Remove the shifts from the related Bedrijf and Flexpool documents
        await Bedrijf.findByIdAndUpdate(shiftArray.opdrachtgever, {
          $pull: { shifts: { $in: shiftArray.shifts } }
        });
  
        if (shiftArray.flexpool) {
          await Flexpool.findByIdAndUpdate(shiftArray.flexpool, {
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
    freelancerId
  }: ReageerShiftParams) {
    try {
      await connectToDB();
  
      // Find the ShiftsArray by ID
      const shiftArray = await ShiftArray.findById(shiftArrayId).populate('shifts');
      if (!shiftArray) {
        throw new Error(`ShiftsArray with ID ${shiftArrayId} not found`);
      }
  
      // Find the freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }
  
      // Check if the freelancer is in the same flexpool
      const inSameFlexpool = shiftArray.flexpool && freelancer.flexpools.includes(shiftArray.flexpool.toString());
  
      if (inSameFlexpool) {
        // Assign the first Shift from the ShiftsArray to the freelancer
        const firstShift = shiftArray.shifts[0];
        firstShift.opdrachtnemer = freelancerId;
        firstShift.status = 'aangenomen';
  
        await firstShift.save();
  
        // Update the freelancer's shifts array
        freelancer.shifts.push({
          shift: firstShift._id,
          status: 'aangenomen'
        });
  
        await freelancer.save();
      } else {
        // Add the freelancer to the ShiftsArray aanmeldingen array
        shiftArray.aanmeldingen.push(freelancerId);
        await shiftArray.save();
  
        // Create a shift with status 'aangemeld' for the freelancer
        const newShift = new Shift({
          ...shiftArray.shifts[0].toObject(),
          shiftArrayId,
          aanmeldingen: [],
          opdrachtnemer: [freelancerId],
          status: 'aangemeld'
        });
  
        await newShift.save();
  
        // Update the freelancer's shifts array
        freelancer.shifts.push({
          shift: newShift._id,
          status: 'aangemeld'
        });
  
        await freelancer.save();
      }
  
      return { success: true, message: "Freelancer successfully applied for the shift" };
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
  
      // Find the ShiftsArray by ID
      const shiftArray = await ShiftArray.findById(shiftArrayId);
      if (!shiftArray) {
        throw new Error(`ShiftsArray with ID ${shiftArrayId} not found`);
      }
  
      // Find the freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }
  
      // Check if the freelancer is in the aanmeldingen array
      if (!shiftArray.aanmeldingen.includes(freelancerId)) {
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

        // Find the shift by ID
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new Error(`Shift with ID ${shiftId} not found`);
        }

        // Find the shift array by ID
        const shiftArray = await ShiftArray.findById(shift.shiftArrayId);
        if (!shiftArray) {
            throw new Error(`ShiftArray with ID ${shift.shiftArrayId} not found`);
        }

        // Move the freelancer from the aanmeldingen array to the opdrachtnemers array
        const aanmeldingenIndex = shiftArray.aanmeldingen.indexOf(freelancerId);
        if (aanmeldingenIndex > -1) {
            shiftArray.aanmeldingen.splice(aanmeldingenIndex, 1);
        }
        shiftArray.opdrachtnemers.push(freelancerId);

        // Find the freelancer by ID
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            throw new Error(`Freelancer with ID ${freelancerId} not found`);
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
        freelancer.shifts = freelancer.shifts.filter((s: { shiftArrayId: { toString: () => any; }; status: string; }) => s.shiftArrayId.toString() !== shiftArray._id.toString() || s.status !== 'aangemeld');

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
        if (now <= shift.eindtijd) {
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








