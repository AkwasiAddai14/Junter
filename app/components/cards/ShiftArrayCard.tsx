"use client"


import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { DeleteConfirmation } from '@/app/components/shared/DeleteConfirmation';
import { ApplyConfirmation } from '../shared/ApplyConfirmation';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';
import  edit  from "@/app/assets/images/logos/edit.svg"
import { isBedrijf } from '@/app/lib/actions/bedrijven.actions';

type CardProps = {
  shift: IShiftArray;
};

const Card = ({ shift }: CardProps) => {

  const [isEenBedrijf, setIsEenBedrijf] = useState<boolean | undefined>(false);;

  const bedrijfCheck = async () => {
  try {
    const isEventCreator = await isBedrijf() // Assuming isBedrijf is a function that returns a boolean
    setIsEenBedrijf(isEventCreator); // Set the state with the boolean result
  } catch (error) {
    console.error("Error checking if user is a bedrijf:", error);
  }
};

bedrijfCheck()


  const backgroundImageUrl = shift.afbeelding;
  const opdrachtgeverName = shift.opdrachtgeverNaam || 'Junter';
  const opdrachtgeverStad = shift.adres || 'Amsterdam';
  const flexpoolTitle = shift.inFlexpool ? "✅ flexpool" : '❎ flexpool';


  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      { isEenBedrijf ? (
          <Link 
          href={`/dashboard/shift/bedrijf/${shift._id}`}
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
        />
      ):   <Link 
      href={`/dashboard/shift/freelancer/${shift._id}`}
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
    />}
      {isEenBedrijf ? (
        <div className="absolute items-stretch right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
          <Link href={`/dashboard/shift/bedrijf/${shift._id}/update`}>
            <Image src={edit} alt="edit" width={20} height={20} />
          </Link>
          <DeleteConfirmation shiftId={shift._id as string} />
        </div>
      ) :
      (
        <div className="absolute items-stretch right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
          <ApplyConfirmation shiftId={shift._id as string} />
        </div>
      )}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <div className="flex gap-2">
          <span className="p-semibold-14 w-min rounded-full line-clamp-1 bg-green-100 px-4 py-1 text-green-60">
            €{shift.uurtarief}
          </span>
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {shift.functie}
          </p>
          <p className="text-sm md:p-medium-16 text-grey-600 line-clamp-1">
           {shift.aanmeldingen?.length || 0} / {shift.plekken} 
          </p>
        </div>


        {
        shift.beschikbaar && (
             <div className="flex-between w-full">
                <p className="p-medium-16 p-medium-18 text-grey-500">
                  {new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(shift.begindatum))}
                </p>
                <p className="p-medium-16 p-medium-18 text-grey-500">
                  {shift.begintijd} - {shift.eindtijd}
                </p>
            </div>
                  )
                }
        
        
        { isEenBedrijf ? (
          <Link href={`/dashboard/shift/bedrijf/${shift._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{shift.titel}</p>
        </Link>
      ):   <Link href={`/dashboard/shift/freelancer/${shift._id}`}>
      <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{shift.titel}</p>
    </Link>}
        <div className="flex-between w-full"></div>
        <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-600">
          {opdrachtgeverStad}
          </p> 
          
        <div className="flex-between w-full">
          <p className="line-clamp-1 p-medium-14 md:p-medium-16 text-grey-600">
            {opdrachtgeverName}
          </p> 
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {flexpoolTitle}
        </p>
        </div>
      </div>
    </div>
  );
};

export default Card;

