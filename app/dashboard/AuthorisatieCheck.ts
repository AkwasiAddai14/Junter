"use server";

import mongoose, { Schema, Document, ObjectId, Types }  from "mongoose";
import { connectToDB } from "@/app/lib/mongoose";
import { revalidatePath } from "next/cache";
import Freelancer from "@/app/lib/models/freelancer.model";
import Bedrijf from "@/app/lib/models/bedrijf.model";
import Flexpool from "@/app/lib/models/flexpool.model";
import Shift, { ShiftType } from "@/app/lib/models/shift.model";
import ShiftArray, { IShiftArray } from "@/app/lib/models/shiftArray.model";
import Factuur from '@/app/lib/models/factuur.model';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";


export const AuthorisatieCheck = async (id: string, nummer: number) => {/*  */
  try {
    // Connect to the database
    await connectToDB();
    let freelancer;
    let bedrijf;
    // Get the current user
    const gebruiker = await currentUser();
    if (nummer === 1 || nummer === 3 || nummer === 5 || nummer ===7 ){
         freelancer = await Freelancer.findOne({ clerkId: gebruiker!.id }).exec();
         if(!freelancer){
            /* redirect('/NotFound'); */ // Redirect to NotFound if not a freelancer
            return false;
         }
    } else {
         // Fetch the associated entities for the user
     bedrijf = await Bedrijf.findOne({ clerkId: gebruiker!.id }).exec();
     if(!bedrijf){
        /* redirect('/NotFound'); */ // Redirect to NotFound if not a freelancer
            return false;
     }
    }
   
    

    // Validate based on the input `nummer`
    switch (nummer) {
      case 1: // Freelancer checks
        if (freelancer) {
          return true;
        }
        /* redirect('/NotFound'); */

      case 2: // Bedrijf is opdrachtgever for shift
        if (bedrijf) {
          const shift = await ShiftArray.findById(id).exec();
          if (shift && shift.opdrachtgever === bedrijf._id) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 3: // Freelancer is opdrachtnemer for checkout
        if (freelancer) {
          const checkout = await Shift.findById(id).exec();
          if (checkout && checkout.opdrachtnemer === freelancer._id.toString()) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 4: // Bedrijf is opdrachtgever for checkout
        if (bedrijf) {
          const checkout = await Shift.findById(id).exec();
          if (checkout && checkout.opdrachtgever === bedrijf._id) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 5: // Freelancer is in flexpool
        if (freelancer) {
          const flexpool = await Flexpool.findById(id).exec();
          if (flexpool && flexpool.freelancers.includes(freelancer._id.toString())) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 6: // Bedrijf is opdrachtgever for flexpool
        if (bedrijf) {
          const flexpool = await Flexpool.findById(id).exec();
          if (flexpool && flexpool.bedrijf === bedrijf._id) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 7: // Freelancer is associated with factuur
        if (freelancer) {
          const factuur = await Factuur.findById(id).exec();
          if (factuur && factuur.freelancerId === freelancer._id.toString()) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      case 8: // Bedrijf is opdrachtgever for factuur
        if (bedrijf) {
          const factuur = await Factuur.findById(id).exec();
          if (factuur && factuur.opdrachtgeverId === bedrijf._id) {
            return true;
          }
        }
        /* redirect('/NotFound'); */
        return false;

      default:
        /* redirect('/NotFound'); */ // Invalid `nummer`
        return false;
    }
  } catch (error) {
    console.error('Error during authorisation check:', error);
    return false;
  }
};