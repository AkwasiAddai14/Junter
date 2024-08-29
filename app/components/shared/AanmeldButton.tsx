"use client"

import { ShiftType } from '@/app/lib/models/shift.model'
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { reageerShift } from '@/app/lib/actions/shift.actions'
import { IShiftArray } from '@/app/lib/models/shiftArray.model'
import { haalFreelancer } from '@/app/lib/actions/freelancer.actions'

const AanmeldButton = async ({ shift }: { shift: IShiftArray }) => {
  const { user } = useUser();
  const hasShiftFinished = new Date(shift.begindatum) < new Date();
  const shiftArrayId = shift._id as string;
  const [freelancerId, setFreelancerId] = useState<string>("");

  useEffect(() => {
    const getFreelancerId = async () => {
      try {
        const freelancer = await haalFreelancer(user!.id);
        if (freelancer && freelancer._id) {
          setFreelancerId(freelancer._id.toString());
        }
      } catch (error) {
        console.error("Error fetching freelancer by Clerk ID:", error);
      }
    };
  
    if (user && !freelancerId) {  // Only fetch if user exists and freelancerId is not already set
      getFreelancerId();
    }
  }, [user]);
  const reageer = await reageerShift({shiftArrayId, clerkId: user!.id})

  return (
    <div className="flex items-center gap-3">
      {hasShiftFinished ? (
        <p className="p-2 text-red-400">Sorry, je kan je niet meer aanmelden voor de shift.</p>
      ): (
        <>
          <SignedOut>
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">
                Meld je eerst aan
              </Link>
            </Button>
          </SignedOut>

          <SignedIn>
          <Button 
          asChild 
          className="button rounded-full" size="lg"
          onClick={() => reageer}
          >
              Aanmelden
            </Button>
          </SignedIn>
        </>
      )}
    </div>
  )
}

export default AanmeldButton;