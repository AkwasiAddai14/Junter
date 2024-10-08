"use server";

import mongoose, { Schema, Document, ObjectId, Types }  from "mongoose";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import Freelancer from "../models/freelancer.model";
import Bedrijf from "../models/bedrijf.model";
import Flexpool from "../models/flexpool.model";
import Shift, { ShiftType } from "../models/shift.model";
import ShiftArray, { IShiftArray } from "../models/shiftArray.model";
import Pauze from "@/app/lib/models/pauze.model";
import Category from "../models/categorie.model";
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { currentUser } from '@clerk/nextjs/server'
import axios from "axios";


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

interface unpublishedParams {
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
}

export const maakOngepubliceerdeShift = async ({
  opdrachtgever,
  opdrachtgeverNaam,
  titel,
  functie,
  afbeelding,
  uurtarief,
  plekken,
  adres,
  begintijd,
  eindtijd,
  pauze,
  beschrijving,
  vaardigheden,
  kledingsvoorschriften,
}: unpublishedParams) => {
  try {

    const shiftArray = new ShiftArray({
      opdrachtgever: opdrachtgever,
      opdrachtgeverNaam: opdrachtgeverNaam,
      titel,
      functie,
      afbeelding,
      uurtarief: Number(uurtarief),
      plekken: Number(plekken),
      adres,
      begintijd,
      eindtijd,
      pauze,
      beschrijving,
      vaardigheden,
      kledingsvoorschriften,
      beschikbaar: false,
    });

     await shiftArray.save();

    return {succes: true, message: 'unpublished shift succesfully created.'}
  } catch (error: any) {
    console.error('Error creating unpublished shift:', error);
    throw error;
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
      return true;
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
    freelancerId
  }: ReageerShiftParams) {
    await connectToDB();
    let userId ;
    if(!freelancerId){
      const user = await currentUser()
      userId = user?.id;
    }
    try {
      
      userId = freelancerId
      
      // Find the ShiftArray by ID and populate the shifts with full documents
      const shiftArray = await ShiftArray.findById(shiftArrayId).populate('shifts');
  
      if (!shiftArray) {
        throw new Error(`ShiftArray with ID ${shiftArrayId} not found`);
      }
  
      // Find the freelancer by ID
      const freelancer = await Freelancer.findOne({clerkId : userId});
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${userId} not found`);
      }
  
      // Ensure that shifts is an array of ShiftType
      if (Array.isArray(shiftArray.shifts) && typeof shiftArray.shifts[0] !== 'string') {
        const populatedShifts = shiftArray.shifts as unknown as ShiftType[];

        if (!populatedShifts) {
          throw new Error('No shift found to populate.');
        }
  
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
          });
  
          await freelancer.save();
        } else {
          // Add the freelancer to the ShiftArray aanmeldingen array
          shiftArray.aanmeldingen.push(freelancer._id);
          await shiftArray.save();

          const populatedShift = populatedShifts[0];
          
          // Check if populatedShift has all the required fields
              if (!populatedShift) {
                   throw new Error('No shift found to populate.');
                  }
  
          // Create a new shift with status 'aangemeld' for the freelancer
          const newShift = new Shift({
            shiftArrayId: shiftArrayId,
            opdrachtgever: populatedShift.opdrachtgever, // Ensure opdrachtgever is populated
            opdrachtnemer: freelancer._id,
            opdrachtgeverNaam: populatedShift.opdrachtgeverNaam || "Junter",  // Fallback value for opdrachtgeverNaam
            titel: populatedShift.titel || "Default Title",  // Fallback value for titel
            functie: populatedShift.functie || "Default Function",  // Fallback value for functie
            afbeelding: populatedShift.afbeelding || "default.jpg",  // Fallback value for afbeelding
            uurtarief: !isNaN(Number(populatedShift.uurtarief)) ? Number(populatedShift.uurtarief) : 0,  // Ensure uurtarief is a valid number
            plekken: 1, // Each shift has only one spot
            adres: populatedShift.adres || "Default Address",  // Fallback value for adres
            begindatum: populatedShift.begindatum || new Date(),  // Fallback value for begindatum
            einddatum: populatedShift.einddatum || new Date(),  // Fallback value for einddatum
            begintijd: populatedShift.begintijd || "09:00",  // Fallback value for begintijd
            eindtijd: populatedShift.eindtijd || "17:00",  // Fallback value for eindtijd
            pauze: populatedShift.pauze || "30 minutes",  // Fallback value for pauze
            beschrijving: populatedShift.beschrijving || "No description available",  // Fallback value for beschrijving
            vaardigheden: populatedShift.vaardigheden || [],  // Ensure vaardigheden is an array
            kledingsvoorschriften: populatedShift.kledingsvoorschriften || "Casual",  // Fallback value for kledingsvoorschriften
            status: 'aangemeld',
          });
          
  
          await newShift.save();
  
          // Update the freelancer's shifts array
          freelancer.shifts.push(newShift._id);
          
          const shiftToRemove = freelancer.shifts.find(
            (shift: { shiftArrayId: { toString: () => string; }; status: string; }) => shift.shiftArrayId?.toString() === shiftArrayId && shift.status === 'aangemeld'
          );
  
          if (shiftToRemove) {
            freelancer.shifts = freelancer.shifts.filter(
              (shift: { _id: { toString: () => any; }; }) => shift._id.toString() !== shiftToRemove._id.toString()
            );
          }
  
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

  interface EmailContent {
    subject: string;
    text: string;
}

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider, e.g., Gmail, SendGrid, etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

export async function sendEmailBasedOnStatus(freelancerEmail: string, shiftDetails: any, status: string) {
    const emailContent = generateEmailContent(shiftDetails, status);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: freelancerEmail,
        subject: emailContent.subject,
        text: emailContent.text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to ' + freelancerEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

function generateEmailContent(shiftDetails: any, status: string): EmailContent {
    switch (status) {
        case 'aangenomen':
            return {
                subject: `Gefeliciteerd! Jij bent geaccepteerd voor de shift: ${shiftDetails.titel}`,
                text: `
                Gefeliciteerd! Jij bent geaccepteerd voor de volgende shift:

                Titel: ${shiftDetails.titel}
                Datum: ${new Date(shiftDetails.begindatum).toLocaleDateString('nl-NL')}
                Starttijd: ${shiftDetails.begintijd}
                Eindtijd: ${shiftDetails.eindtijd}
                Adres: ${shiftDetails.adres}
                Beschrijving: ${shiftDetails.beschrijving}
                Vaardigheden: ${shiftDetails.vaardigheden.join(', ') || 'Geen'}
                Kledingsvoorschriften: ${shiftDetails.kledingsvoorschriften.join(', ') || 'Geen'}

                Succes en veel plezier!
                `,
            };
        case 'geannuleerd':
            return {
                subject: `Helaas! De shift ${shiftDetails.titel} is geannuleerd`,
                text: `
                Helaas! De volgende shift is geannuleerd:

                Titel: ${shiftDetails.titel}
                Datum: ${new Date(shiftDetails.begindatum).toLocaleDateString('nl-NL')}
                Starttijd: ${shiftDetails.begintijd}
                Eindtijd: ${shiftDetails.eindtijd}
                Adres: ${shiftDetails.adres}

                Neem contact op met ons als je vragen hebt.
                `,
            };
        case 'voltooi checkout':
            return {
                subject: `Vul nu de checkout voor ${shiftDetails.titel} in`,
                text: `
                Het is tijd om de checkout in te vullen voor de volgende shift:

                Titel: ${shiftDetails.titel}
                Datum: ${new Date(shiftDetails.begindatum).toLocaleDateString('nl-NL')}
                Starttijd: ${shiftDetails.begintijd}
                Eindtijd: ${shiftDetails.eindtijd}

                Adres: ${shiftDetails.adres}

                Vul de checkout zo snel mogelijk in.
                `,
            };
        case 'checkout geaccepteerd':
            return {
                subject: `De checkout voor shift ${shiftDetails.titel} is geaccepteerd!`,
                text: `
                De checkout voor de volgende shift is geaccepteerd:

                Titel: ${shiftDetails.titel}
                Datum: ${new Date(shiftDetails.begindatum).toLocaleDateString('nl-NL')}cddss
                Starttijd: ${shiftDetails.begintijd}
                Eindtijd: ${shiftDetails.eindtijd}
                Adres: ${shiftDetails.adres}

                Bedankt voor je inzet!
                `,
            };
        default:
            throw new Error(`Invalid status: ${status}`);
    }
}


  interface AnnuleerAanmeldingenParams {
    shiftArrayId: string;
    freelancerId: string;
  }
  
  export async function annuleerAanmeldingen({
    shiftArrayId,
    freelancerId,
  }: AnnuleerAanmeldingenParams) {
    try {
      await connectToDB();
  
      const shiftArrayObjectId = new mongoose.Types.ObjectId(shiftArrayId);
      
      // Attempt to create an ObjectId from freelancerId
      let freelancer: any = null;
      if (mongoose.Types.ObjectId.isValid(freelancerId)) {
        freelancer = await Freelancer.findById(freelancerId);
      }
  
      // If freelancer wasn't found by ObjectId, try finding by clerkId
      if (!freelancer) {
        freelancer = await Freelancer.findOne({ clerkId: freelancerId });
      }
  
      // Throw an error if the freelancer wasn't found by either method
      if (!freelancer) {
        throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }
  
      // Find the shift array by ID
      const shiftArray = await ShiftArray.findById(shiftArrayObjectId);
      if (!shiftArray) {
        throw new Error(`ShiftsArray with ID ${shiftArrayId} not found`);
      }
  
      // Check if the freelancer is in the aanmeldingen array
      const freelancerObjectId = freelancer._id;
      if (!shiftArray.aanmeldingen.includes(freelancerObjectId)) {
        return {
          success: false,
          message: "Freelancer is not applied for this ShiftsArray",
        };
      }
  
      // Remove the freelancer from the shift array's aanmeldingen
      shiftArray.aanmeldingen = shiftArray.aanmeldingen.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(freelancerObjectId)
      );
      await shiftArray.save();
  
      // Remove shifts with status 'aangemeld' from the freelancer's shifts array
      freelancer.shifts = freelancer.shifts.filter(
        (shift: { shiftArrayId: mongoose.Types.ObjectId; status: string }) =>
          !(shift.shiftArrayId?.equals(shiftArrayObjectId) && shift.status === 'aangemeld')
      );
      await freelancer.save();
  
      return {
        success: true,
        message: "Freelancer successfully removed from the ShiftsArray's aanmeldingen and shift removed from the freelancer's shifts array",
      };
    } catch (error: any) {
      throw new Error(`Failed to remove freelancer from ShiftsArray and shift from freelancer: ${error.message}`);
    }
  }
  


interface AccepteerFreelancerParams {
    shiftId: string;
    freelancerId: string;
}

async function removeFreelancerFromAanmeldingen({
  shiftId,
  freelancerId
}: AccepteerFreelancerParams) {
  try {
    const result = await ShiftArray.updateOne(
      { _id: shiftId },
      { $pull: { aanmeldingen: freelancerId } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('No modifications were made. Either the document was not found or the freelancer was not in the aanmeldingen array.');
    }

    console.log(`Freelancer with ID ${freelancerId} removed from aanmeldingen`);
  } catch (error: any) {
    throw new Error(`Failed to remove freelancer from aanmeldingen: ${error.message}`);
  }
}

export async function accepteerFreelancer({
  shiftId,
  freelancerId
}: AccepteerFreelancerParams) {
  try {
      await connectToDB();

      if (!mongoose.Types.ObjectId.isValid(shiftId)) {
          throw new Error(`Invalid shift ID: ${shiftId}`);
      }

      if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
          throw new Error(`Invalid freelancer ID: ${freelancerId}`);
      }

      const shiftObjectId = new mongoose.Types.ObjectId(shiftId);
      const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);

      const shiftArray = await ShiftArray.findById(shiftObjectId) as (Document<unknown, {}, IShiftArray> & IShiftArray & { _id: mongoose.Types.ObjectId });
      if (!shiftArray) {
          throw new Error(`ShiftArray with ID ${shiftId} not found`);
      }

      const freelancer = await Freelancer.findById(freelancerObjectId);
      if (!freelancer) {
          throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }

      if (!Array.isArray(shiftArray.shifts) || shiftArray.shifts.length === 0) {
        console.log('No shifts found, creating a reserve shift...');
        shiftArray.beschikbaar = false;
        // Create a new shift with the status 'reserve'
        const newShift = new Shift({
          opdrachtgever: shiftArray.opdrachtgever, // Assuming it's an ObjectId
          opdrachtnemer: freelancerObjectId, // Assigning the freelancer ObjectId
          shiftArrayId: shiftArray._id, // Reference to the shiftArray
          titel: shiftArray.titel, // Mapping relevant fields from shiftArray
          opdrachtgeverNaam: shiftArray.opdrachtgeverNaam || "Junter",
          functie: shiftArray.functie,
          afbeelding: shiftArray.afbeelding,
          uurtarief: shiftArray.uurtarief,
          plekken: 1,  // Default value
          adres: shiftArray.adres,
          begindatum: shiftArray.begindatum,
          einddatum: shiftArray.einddatum,
          begintijd: shiftArray.begintijd,
          eindtijd: shiftArray.eindtijd,
          pauze: shiftArray.pauze ? shiftArray.pauze : "30 minuten pauze", // Providing a default if not present
          beschrijving: shiftArray.beschrijving,
          vaardigheden: shiftArray.vaardigheden,
          kledingsvoorschriften: shiftArray.kledingsvoorschriften,
          beschikbaar: true, // Assuming a new shift should be available
          status: 'reserve', // Status for the new shift
          checkoutbegintijd: "00:00",
          checkouteindtijd: "00:00",
          feedback: "",
          opmerking: "",
          ratingBedrijf: 5,
          ratingFreelancer: 5,
      });
      
      // Save the new shift
      await newShift.save();

        // Push the new shift into ShiftArray and Freelancer shifts array
        shiftArray.shifts.push(new mongoose.Types.ObjectId(newShift._id));
        freelancer.shifts.push(newShift._id);
        shiftArray.reserves.push(freelancer._id);
        // Save updates to ShiftArray and Freelancer
        await shiftArray.save();
        await freelancer.save();

        return { success: true, message: "Reserve shift created and assigned to freelancer." };
      }

      const firstShiftId = shiftArray.shifts[0];
      const firstShift = await Shift.findById(firstShiftId);
      if (!firstShift) {
          throw new Error(`Shift with ID ${firstShiftId} not found`);
      }

      firstShift.opdrachtnemer = freelancerObjectId;
      firstShift.status = "aangenomen";
      firstShift.opdrachtgeverNaam = shiftArray.opdrachtgeverNaam;
      freelancer.shifts.push(firstShift._id);
      shiftArray.aangenomen.push(freelancer._id)
      

      freelancer.shifts = freelancer.shifts.filter((s: { shiftArrayId?: { toString: () => any; }; status: string; }) => {
        return !(s.shiftArrayId?.toString() === shiftArray._id.toString() && s.status === 'aangemeld');
    });

      await freelancer.save();
      await firstShift.save();


      await removeFreelancerFromAanmeldingen({ shiftId, freelancerId });


      shiftArray.shifts.shift();
      await shiftArray.save();
      await sendEmailBasedOnStatus(freelancer.emailadres, firstShift, 'aangenomen');
      await checkAndUpdateConflictingShifts({
        freelancerId: freelancerObjectId,
        acceptedShift: firstShift,
      });
      return { success: true, message: "Freelancer successfully accepted for the shift" };
  } catch (error: any) {
      throw new Error(`Failed to accept freelancer for shift: ${error.message}`);
  }
}

async function checkAndUpdateConflictingShifts({
  freelancerId,
  acceptedShift,
}: {
  freelancerId: mongoose.Types.ObjectId;
  acceptedShift: any;
}) {
  const oneHourInMs = 60 * 60 * 1000;

  try {
    // Find all shifts with status 'aangemeld' for this freelancer on the same day as the accepted shift
    const conflictingShifts = await Shift.find({
      opdrachtnemer: freelancerId,
      status: 'aangemeld',
      begindatum: acceptedShift.begindatum, // Same date
    });

    // Convert begintijd and eindtijd of acceptedShift to Date objects
    const acceptedBegintijd = new Date(
      `${acceptedShift.begindatum.toISOString().split('T')[0]}T${acceptedShift.begintijd}`
    );
    const acceptedEindtijd = new Date(
      `${acceptedShift.begindatum.toISOString().split('T')[0]}T${acceptedShift.eindtijd}`
    );

    // Check for overlapping or close shifts
    for (const shift of conflictingShifts) {
      const shiftBegintijd = new Date(
        `${shift.begindatum.toISOString().split('T')[0]}T${shift.begintijd}`
      );
      const shiftEindtijd = new Date(
        `${shift.begindatum.toISOString().split('T')[0]}T${shift.eindtijd}`
      );

      const isOverlapping =
        (shiftBegintijd < acceptedEindtijd && shiftEindtijd > acceptedBegintijd) ||
        (shiftBegintijd.getTime() - acceptedEindtijd.getTime() < oneHourInMs &&
          shiftBegintijd.getTime() > acceptedEindtijd.getTime());

      if (isOverlapping) {
        shift.status = 'afgezegd';
        await shift.save();
      }
    }
  } catch (error: any) {
    console.error(`Failed to update conflicting shifts: ${error.message}`);
    throw new Error('Error updating conflicting shifts');
  }
}


interface AfwijzenFreelancerParams {
    shiftId: string;
    freelancerId: string;
}

export async function afwijzenFreelancer({ shiftId, freelancerId }: AfwijzenFreelancerParams) {
  try {
      // Find the shift array by ID
      const shiftArray = await ShiftArray.findById(shiftId);
      if (!shiftArray) {
          throw new Error(`ShiftArray with ID ${shiftId} not found`);
      }

      // Remove the freelancer from the aanmeldingen array safely
      shiftArray.aanmeldingen = shiftArray.aanmeldingen.filter((id: any) => {
          return id && id.toString() !== freelancerId;
      });
      await shiftArray.save();

      // Find the freelancer
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
          throw new Error(`Freelancer with ID ${freelancerId} not found`);
      }

      const shift = await Shift.findOne({
        shiftArrayId: shiftId,
        opdrachtnemer: freelancerId, // Assuming this is the field for the freelancer in the Shift schema
      });
  
      if (!shift) {
        throw new Error(`Shift with shiftArrayId ${shiftId} and opdrachtnemer ${freelancerId} not found`);
      }
  
      // Update the status of the shift to 'afgewezen'
      shift.status = 'afgewezen';
      await shift.save(); // Save the updated shift

      // Save the updated freelancer
      await freelancer.save();

      return { success: true, message: 'Freelancer rejected successfully' };
  } catch (error: any) {
      throw new Error(`Failed to reject freelancer: ${error.message}`);
  }
};



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
};

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
      let shifts = await ShiftArray.find(query);

      // Filter by range (distance from freelancer's location)
      if (range !== undefined && freelancerLocation) {
          const { lat: freelancerLat, lng: freelancerLng } = freelancerLocation;

          if (freelancerLat !== undefined && freelancerLng !== undefined) {
              // Use `filter` instead of `map` to filter out shifts that do not match the distance criteria
              shifts = await Promise.all(
                  shifts.filter(async shift => {
                      const shiftLocation = await getCoordinatesFromAddress(shift.adres); // You need to implement this function
                      
                      if (shiftLocation && shiftLocation.latitude !== undefined && shiftLocation.longitude !== undefined) {
                          const distance = calculateDistance(
                              freelancerLat, 
                              freelancerLng, 
                              shiftLocation.latitude, 
                              shiftLocation.longitude
                          );
                          return distance <= range;
                      }
                      return false;
                  })
              );
          }
      }

      return shifts;
  } catch (error: any) {
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
export async function getCoordinatesFromAddress(address: string) {
  try {
    const response = await axios.get(`/api/geocoding?address=${address}`);
    if (response.data) {
        const { latitude, longitude } = response.data;
        return {
          latitude,
          longitude
        };
    } else {
        return { latitude: 52.3676, longitude: 4.9041 };
    }
} catch (error) {
    console.error('Error fetching coordinates:', error);
    throw new Error('No coordinates found for the provided address.');
  } // Coordinates for Amsterdam, for example
}

const populateShift = (query: any) => {
  return query
    .populate({ path: 'opdrachtgever', model: Bedrijf, select: 'naam displaynaam' })
    .populate({ path: 'flexpools', model: Flexpool, select: 'titel' })
}

export async function haalShiftMetId(shiftId: string) {
  try {
    await connectToDB();

    const shift = await populateShift(ShiftArray.findById(shiftId)).exec();

    if (!shift) throw new Error('Shift not found');

    return JSON.parse(JSON.stringify(shift));
  } catch (error: any) {
    console.error(error);
    throw new Error('Failed to fetch shift');
  }
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
  limit = 36,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDB()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: shiftId } }] }

    const eventsQuery = ShiftArray.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateShift(eventsQuery)
    const eventsCount = await ShiftArray.countDocuments(conditions)
  
    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    console.log(error)
  }
}



export const haalShiftMetIdCard = async (id: string) => {
  try {
    const shift = await Shift.findById(id)
    return shift;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};

export const getAllCategories = async () =>{
  try{
    await connectToDB();
    const categories = await Category.find();
    return JSON.parse(JSON.stringify(categories));
  } catch (error){
    console.log("No categories found", error)
  }
}


interface ShiftUpdateParams {
  shiftId: string;
}

export async function updateShiftAndReassign({
  shiftId
}: ShiftUpdateParams) {
  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error(`Invalid shift ID: ${shiftId}`);
    }

    const shiftObjectId = new mongoose.Types.ObjectId(shiftId);

    // Step 1: Find the shift by ID
    const shift = await Shift.findById(shiftObjectId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    // Step 2: Combine shift date and time to create a complete Date object
    const shiftStartDateTime = new Date(shift.begindatum);
    const [hours, minutes] = shift.begintijd.split(':').map(Number);
    shiftStartDateTime.setHours(hours, minutes, 0, 0);

    // Step 3: Compare current time with 72 hours before the shift start time
    const currentTime = new Date();
    const hoursBeforeShift = 72;
    const timeDifference = shiftStartDateTime.getTime() - currentTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > hoursBeforeShift) {
      // Case 1: More than 72 hours before the shift
      shift.opdrachtnemer = undefined; // Remove opdrachtnemer
      shift.status = 'beschikbaar';
    } else {
      // Case 2: Less than 72 hours before the shift
      shift.status = 'vervangen';
    }

    // Step 4: Find the corresponding ShiftArray
    const shiftArray = await ShiftArray.findById(shift.shiftArrayId);
    if (!shiftArray) {
      throw new Error(`ShiftArray with ID ${shift.shiftArrayId} not found`);
    }

    // Step 5: Check for shifts with 'reserve' status in the ShiftArray
    const reserveShift = await Shift.findOne({ _id: { $in: shiftArray.shifts }, status: 'reserve' });

    if (reserveShift) {
      // Extract the opdrachtnemer from the reserve shift
      const newOpdrachtnemer = reserveShift.opdrachtnemer;

      // Assign the new opdrachtnemer to the shift being updated
      shift.opdrachtnemer = newOpdrachtnemer;

      // Remove the reserve shift from the new opdrachtnemer's shifts array
      await Freelancer.updateOne(
        { _id: newOpdrachtnemer },
        { $pull: { shifts: reserveShift._id } }
      );

      // Add the updated shift to the new opdrachtnemer's shifts array
      await Freelancer.updateOne(
        { _id: newOpdrachtnemer },
        { $push: { shifts: shift._id } }
      );

      // Remove the new opdrachtnemer from the shiftArray aanmeldingen array
      shiftArray.aanmeldingen = shiftArray.aanmeldingen.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(newOpdrachtnemer)
      );

      // Remove the reserve shift from the ShiftArray shifts array
      shiftArray.shifts = shiftArray.shifts.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(reserveShift._id)
      );

      // Optionally, delete the reserve shift if no longer needed
      await Shift.findByIdAndDelete(reserveShift._id);
    } else {
      // If no reserve shift found, push the updated shift back into the ShiftArray
      shiftArray.shifts.push(new mongoose.Types.ObjectId(shift._id));
    }

    // Step 6: Save the changes
    await shift.save();
    await shiftArray.save();

    return { success: true, message: "Shift successfully updated and reassigned" };
  } catch (error: any) {
    throw new Error(`Failed to update and reassign shift: ${error.message}`);
  }
}

interface FreelancerAfzeggenParams {
  freelancerObjectId: string;
  shiftArrayObjectId: string;
}

export async function freelancerAfzeggen({
  freelancerObjectId,
  shiftArrayObjectId
}: FreelancerAfzeggenParams) {
  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(freelancerObjectId)) {
      throw new Error(`Invalid freelancer ID: ${freelancerObjectId}`);
    }

    if (!mongoose.Types.ObjectId.isValid(shiftArrayObjectId)) {
      throw new Error(`Invalid shiftArray ID: ${shiftArrayObjectId}`);
    }

    const freelancerId = new mongoose.Types.ObjectId(freelancerObjectId);
    const shiftArrayId = new mongoose.Types.ObjectId(shiftArrayObjectId);

    // Step 1: Find the shift in the ShiftArray where the opdrachtnemer is the freelancer
    const shift = await Shift.findOne({
      shiftArrayId: shiftArrayId,
      opdrachtnemer: freelancerId
    });
    const freelancer = await Freelancer.findById(freelancerId)

    if (!shift) {
      throw new Error(`No shift found with shiftArrayId ${shiftArrayObjectId} and opdrachtnemer ${freelancerObjectId}`);
    }

    // Step 2: Combine shift date and time to create a complete Date object
    const shiftStartDateTime = new Date(shift.begindatum);
    const [hours, minutes] = shift.begintijd.split(':').map(Number);
    shiftStartDateTime.setHours(hours, minutes, 0, 0);

    // Step 3: Compare current time with 24 hours before the shift start time
    const currentTime = new Date();
    const hoursBeforeShift = 24;
    const timeDifference = shiftStartDateTime.getTime() - currentTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > hoursBeforeShift) {
      // Case 1: More than 24 hours before the shift
      shift.status = 'afgezegd';
    } else {
      // Case 2: Less than 24 hours before the shift
      shift.status = 'afgerond';
      shift.checkoutbegintijd = shift.begintijd; // Set checkoutbegintijd to begintijd
      const checkoutEndTime = new Date(shiftStartDateTime);
      checkoutEndTime.setHours(checkoutEndTime.getHours() + 4); // Set checkout time to 4 hours later
      shift.checkouteindtijd = `${checkoutEndTime.getHours().toString().padStart(2, '0')}:${checkoutEndTime.getMinutes().toString().padStart(2, '0')}`;
    }

    // Step 4: Save the updated shift
    await shift.save();
    await sendEmailBasedOnStatus(freelancer.emailadres, shift, 'geannuleerd');
    return { success: true, message: "Shift status successfully updated" };
  } catch (error: any) {
    throw new Error(`Failed to update shift status: ${error.message}`);
  }
}

export async function haalAangemeld(freelancerId: Types.ObjectId | string ) {
  try {
    await connectToDB();
    let freelancer;
    if(mongoose.Types.ObjectId.isValid(freelancerId)){
      freelancer = await Freelancer.findById(freelancerId);
    // Case 1: If freelancerId is provided
      if (freelancer) {
        // Find shifts where the freelancer is assigned as 'opdrachtnemer'
        const filteredShifts = await Shift.find({ opdrachtnemer: freelancer._id });

        return filteredShifts;
      } else {
        console.log("Freelancer not found");
        return [];
      }
    }
    if (freelancerId.toString() !== "") {
      freelancer = await Freelancer.findOne({clerkId : freelancerId})
   } else {
    const user = await currentUser();
    if (user) {
      freelancer = await Freelancer.findOne({ clerkId: user.id });
   }
    // Case 2: If freelancerId is not provided, use the logged-in user (Clerk)
      if (freelancer) {
        // Find shifts where the logged-in freelancer is assigned as 'opdrachtnemer'
        const filteredShifts = await Shift.find({ opdrachtnemer: freelancer._id });

        return filteredShifts;
      } else {
        console.log("No freelancer found for the current user");
        return [];
      }
    }

    console.log("No user or freelancer found");
    return [];
  } catch (error: any) {
    throw new Error(`Failed to find shift: ${error.message}`);
  }
}