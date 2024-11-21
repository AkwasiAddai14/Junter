"use client"

import Link from 'next/link';
import React, { useState } from 'react';
import { ShiftType } from '@/app/lib/models/shift.model';
import { useToast } from '@/app/components/ui/use-toast';
import { accepteerCheckout } from '@/app/lib/actions/checkout.actions';
import { useRouter } from 'next/navigation';


type CardProps = {
  shift: ShiftType;
};

const Card = ({ shift }: CardProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);


  const backgroundImageUrl = shift.freelancerProfielFoto;
  const opdrachtNemerNaam = `${shift.freelancerVoornaam} ${shift.freelancerAchternaam}`;


  const handleCheckoutAcceptance = async (shiftId:string) => {
    try {
      const response = await accepteerCheckout(
        {
          shiftId: shiftId, 
          rating:  5, // Use default value if `undefined`
          feedback:  " ",
          laat: false,
        }
      )
      if (response.success) {
        toast({
          variant: 'succes',
          description: "Checkout verstuurd! 👍"
        });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          description: "Actie is niet toegestaan! ❌"
        });
      }
    } catch (error) {
      console.error('Failed to submit checkout:', error);
  } 
}
  

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      
      <Link 
    href={`/dashboard/checkout/bedrijf/${shift._id}`}
    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
      />
          <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{opdrachtNemerNaam}</p>
        
      <div className="flex min-h-[230px] flex-col gap-3 py-5 px-3 md:gap-4">
        {/* <div className="flex gap-2">
          <span className="p-semibold-14 w-min rounded-full line-clamp-1 bg-green-100 px-4 py-1 text-green-60">
            €{shift.uurtarief}
          </span>
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {shift.functie}
          </p>
        </div> */}
         <p className="p-medium-16 p-medium-18 text-grey-500">
            {shift.titel}
          </p> 
        <div className="flex-between w-full">
        <Link href={`/dashboard/shift/bedrijf/${shift.shiftArrayId}`}>
          <p className="p-medium-16 p-medium-18 text-grey-500">
          {new Date(shift.begindatum).toLocaleDateString('nl-NL')}
          </p>
          </Link>
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-500">
          {shift.begintijd} - {shift.eindtijd}
          </p> 
        </div>
        
        
        <div className="flex-between w-full">
          Gewerkte uren:
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-500">
          </p> 
        </div>

        <div className="flex-between w-full">
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-300">
          {shift.checkoutbegintijd} - {shift.checkouteindtijd}
          </p> 
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-300">
          {shift.checkoutpauze} minuten pauze
          </p> 
        </div>

        <div className="flex-between w-full">
                        <button onClick={() => router.push(`/dashboard/checkout/bedrijf/${shift._id}`)} className="inline-flex ml-2 items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-green-600/20">
                          Weigeren
                        </button>
        <button onClick={() => handleCheckoutAcceptance(shift._id)}
                       className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Accepteren
                        </button>
        </div>
      </div>
    </div>
  );
};

export default Card;

