"use client"

import { ShiftType } from '@/app/lib/models/shift.model'
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { reageerShift } from '@/app/lib/actions/shift.actions'

const AanmeldButton = async ({ shift }: { shift: ShiftType }) => {
  const { user } = useUser();
  const hasShiftFinished = new Date(shift.begindatum) < new Date();
  const shiftArrayId = shift.shiftArrayId;
  const freelancerId = user?.publicMetadata.userId as string;

  const reageer = await reageerShift({shiftArrayId, freelancerId})

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