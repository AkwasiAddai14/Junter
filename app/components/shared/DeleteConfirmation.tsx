'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog'
import del from "/Users/georgeaddai/Desktop/thejunter/app/assets/images/logos/delete.svg"

import { haalShiftMetId, verwijderShiftArray } from '@/app/lib/actions/shift.actions'

export const DeleteConfirmation = ({ shiftId }: { shiftId: string }) => {
  const pathname = usePathname()
  let [isPending, startTransition] = useTransition()
  const [shift, setShift] = useState<any>(null);

  useEffect(() => {
    const fetchShift = async () => {
      const fetchedShift = await haalShiftMetId(shiftId);
      setShift(fetchedShift);
    };

    fetchShift();
  }, [shiftId]);

  if (!shift) {
    return <p>Loading...</p>; // or a loading indicator
  }

  const shiftArrayId = shift._id;

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Image src={del} alt="edit" width={20} height={20} />
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Weet u zeker dat u de shift wilt verwijderen ?</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-grey-600">
            Deze actie zal de shift definitief verwijderen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuleer</AlertDialogCancel>

          {shiftArrayId ? (
            <AlertDialogAction
              onClick={() =>
                startTransition(async () => {
                  await verwijderShiftArray({ shiftArrayId, forceDelete: true, path: pathname || "/dashboard" })
                })
              }>
              {isPending ? 'Verwijderen...' : 'verwijderen'}
            </AlertDialogAction>
          ) : (
            <p>Invalid Shift ID</p>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
