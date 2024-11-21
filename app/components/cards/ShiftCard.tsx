"use client"

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import  del  from "@/app/assets/images/logos/delete.svg"
import { isBedrijf } from '@/app/lib/actions/bedrijven.actions';
import { ShiftType } from '@/app/lib/models/shift.model';
import { useToast } from '@/app/components/ui/use-toast';
import { annuleerAanmeldingen } from '@/app/lib/actions/shift.actions';


type CardProps = {
  shift: ShiftType;
};

const Card = ({ shift }: CardProps) => {
  const { toast } = useToast();
  const [isEenBedrijf, setIsEenBedrijf] = useState<boolean | null>(null);


  const bedrijfCheck = async () => {
 
    const isEventCreator = await isBedrijf() // Assuming isBedrijf is a function that returns a boolean
    if(isEventCreator){
    setIsEenBedrijf(isEventCreator); // Set the state with the boolean result
    } else {
      setIsEenBedrijf(false)
  }
    
};

bedrijfCheck();

  const backgroundImageUrl = shift.afbeelding;
  const opdrachtgeverName = shift.opdrachtgeverNaam || 'Junter';
  const flexpoolTitle = shift.inFlexpool ? "✅ flexpool" : '❎ flexpool';
  const opdrachtnemerId = typeof shift.opdrachtnemer === 'string' ? shift.opdrachtnemer : shift.opdrachtnemer?.toString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aangenomen':
      case 'afgerond':
        case 'checkout geaccepteerd':
        return 'bg-green-500'; // Green background for 'aangenomen' and 'afgerond'
      case 'voltooi checkout':
        return 'bg-yellow-400';
        case 'checkout ingevuld':
        return 'bg-sky-500'; // Yellow background for 'voltooi checkout'
        case 'afgewezen':
          case 'afgezegd':
            case 'no show':
              case 'Checkout geweigerd':
            return 'bg-red-500'
      default:
        return 'bg-blue-400'; // Default background if no status matches
    }
  };

  const shiftArrayId = shift.shiftArrayId;

  const handleFreelanceRejection = async (freelancerId: string) => {
    try {
      const response = await annuleerAanmeldingen({ shiftArrayId, freelancerId });
  
      if (response.success) {
        toast({
          variant: 'succes',
          description: "afgemeld voor de shift! "
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: "Actie is niet toegestaan! "
      });
    }
  };
  let linkHref;

  if (isEenBedrijf) {
    linkHref = `/dashboard/shift/bedrijf/${shift.shiftArrayId}`;
  } else if (shift.status === 'voltooi checkout' || shift.status === 'Checkout geweigerd') {
    linkHref = `/dashboard/checkout/freelancer/${shift._id}`;
  } else {
    linkHref = `/dashboard/shift/freelancer/${shift.shiftArrayId}`;
  }
  

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      
      <Link 
    href={linkHref}
    style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
      />


      {!isEenBedrijf && (shift.status === "aangenomen" || shift.status === "aangemeld" || shift.status === 'reserve') && (
        <button onClick={() => opdrachtnemerId && handleFreelanceRejection(opdrachtnemerId)} className="absolute items-stretch right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
            <Image src={del} alt="delete" width={20} height={20} />
        </button>
      )}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <div className="flex gap-2">
          <span className="p-semibold-14 w-min rounded-full line-clamp-1 bg-green-100 px-4 py-1 text-green-60">
            €{shift.uurtarief}
          </span>
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {shift.functie}
          </p>
        </div>

        <div className="flex-between w-full">
          <p className="p-medium-16 p-medium-18 text-grey-500">
          {new Date(shift.begindatum).toLocaleDateString('nl-NL')}
          </p> 
          <p className="p-medium-16 p-medium-18 text-grey-500">
          {shift.begintijd} - {shift.eindtijd}
          </p>
        </div>
       
        
        { isEenBedrijf  ? (
          <Link href={`/dashboard/shift/bedrijf/${shift.shiftArrayId}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{shift.titel}</p>
        </Link>
      ):   <Link href={`/dashboard/shift/freelancer/${shift.shiftArrayId}`}>
      <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{shift.titel}</p>
    </Link>}
        <div className="flex-between w-full">
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-600">
            {opdrachtgeverName}
          </p> 
        </div>
        <div className="flex-between w-full">
          { shift.status === 'afgerond' && shift.totaalBedrag ? 
            <p className="p-medium-14 md:p-medium-16 text-grey-600">€{shift.totaalBedrag}</p>
            :
            <p className="p-medium-14 md:p-medium-16 text-grey-600">{flexpoolTitle}</p>
          }{/* //<p className="p-medium-14 md:p-medium-16 text-grey-600">{flexpoolTitle}</p> */}
       <div className={`rounded-md px-4 py-2 ${getStatusColor(shift.status)}`}>
        {shift.status === 'voltooi checkout' || shift.status === 'Checkout geweigerd' ? 
        <Link href={`/dashboard/checkout/freelancer/${shift.shiftArrayId}`}>
        <p className="p-medium-14 md:p-medium-16 text-grey-600">
          {shift.status}
          </p>
        </Link> :
        <Link href={linkHref}>
        <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-600">
        {shift.status}
        </p>
        </Link>
        
        }  
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;

