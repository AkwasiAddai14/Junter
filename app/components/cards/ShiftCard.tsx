import React from 'react';
import Image from 'next/image';
import { formatDateString } from '@/app/lib/utils'
import { auth } from '@clerk/nextjs/server'

import Link from 'next/link'


interface Shift {
    opdrachtgever: string;
    afbeelding: string;
    titel: string;
    functie: string;
    datum: Date;
    begintijd: string;
    eindtijd: string;
    adres: string;
    afstand: string;
    uurtarief: number;
    plekken: number;
    aanmeldingen: number;
}

interface Props {
    shift?: Shift;
}

const ShiftCard: React.FC<Props> = ({ shift }) => {

    if (!shift) {
        return <div>No shift data available</div>;
    }

    return (
        <div className="shift-card">
            <Image 
                src={shift.afbeelding}
                alt=""
                width={100}
                height={100}
            />
            <h2>{shift.titel}</h2>
            <p>Function: {shift.functie}</p>
            <p>Location: {shift.adres}</p>
            <p>Date: {new Date(shift.datum).toLocaleDateString()}</p>
            <p>Start Time: {shift.begintijd}</p>
            <p>End Time: {shift.eindtijd}</p>
            <p>Tarief: {shift.uurtarief}</p>
        </div>
    );

   /*  return (
        <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
          
          <Link 
            href={`/shifts/${shift._id}`}
            style={{backgroundImage: `url(${shift.imageUrl})`}}
            className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
          />
    
          <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4"> 
            <div className="flex gap-2">
              <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-60">
                 {shift.uurtarief}
              </span>
              <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
                {shift.functie}
              </p>
            </div>
    
            <p className="p-medium-16 p-medium-18 text-grey-500">
              {formatDateTime(shift.begintijd).dateTime} {formatDateTime(shift.eindtijd).dateTime}
            </p>
    
            <Link href={`/events/${event._id}`}>
              <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">{shift.titel}</p>
            </Link>
    
            <div className="flex-between w-full">
              <p className="p-medium-14 md:p-medium-16 text-grey-600">
                {shift.opdrachtgever} 
              </p>
            </div>
          </div>
        </div>
      ) */
};

export default ShiftCard;
