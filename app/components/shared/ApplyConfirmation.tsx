'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import apply from "@/app/assets/images/logos/edit.svg"
import spinner from "@/app/assets/images/logos/spinner.svg"
import { haalShiftMetId, reageerShift } from '@/app/lib/actions/shift.actions'
import { useToast } from '@/app/components/ui/use-toast';
import { useUser } from '@clerk/nextjs'


export const ApplyConfirmation = ({ shiftId }: { shiftId: string }) => {
  let [isPending, startTransition] = useTransition()
  const [shift, setShift] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useUser();
 
  
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
  const freelancerId = user!.id

  const handleAanmelden = async () => {
    try {
      const reageer = await reageerShift({shiftArrayId, freelancerId});
  
      if (reageer.success) {
        toast({
          variant: 'succes',
          description: "Aangemeld voor de shift! 👍"
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: "Actie is niet toegestaan! ❌"
      });
      console.log(error)
    }
  };

  return (
    <button
    className="rounded-md"
          onClick={() => startTransition(async () => {
            await handleAanmelden()}
            )}
            >
                {
                isPending ? 
                <Image src={spinner} alt="edit" width={20} height={20} />
                 : 
                <Image src={apply} alt="edit" width={20} height={20} />
                }
    </button>
  )
}