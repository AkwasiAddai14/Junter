import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { DeleteConfirmation } from '@/app/components/shared/DeleteConfirmation';
import { formatDateTimeF } from '@/app/lib/utils';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';

type CardProps = {
  shift: IShiftArray;
};

const Card = ({ shift }: CardProps) => {
  const { user } = useUser();
  const userId = user?.id as string;
  const isEventCreator = userId === shift.opdrachtgever?._id?.toString();

  const backgroundImageUrl = shift.afbeelding;
  const opdrachtgeverName = shift.opdrachtgeverNaam || 'Junter';
  const opdrachtgeverStad = shift.adres || 'Amsterdam';
  const flexpoolTitle = shift.flexpools && shift.flexpools.length > 0 ? "In flexpool" : 'Niet in flexpool';


  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <Link 
        href={`/shift/${shift._id}`}
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
      />
      {isEventCreator && (
        <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
          <Link href={`/events/${shift._id}/update`}>
            <Image src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>
          <DeleteConfirmation shiftId={shift._id as string} />
        </div>
      )}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <div className="flex gap-2">
          <span className="p-semibold-14 w-min rounded-full line-clamp-1 bg-green-100 px-4 py-1 text-green-60">
            € {shift.uurtarief}
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
          {shift.begintijd} : {shift.eindtijd}
          </p>
        </div>
       
        <Link href={`/shift/${shift._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-1 flex-1 text-black">{shift.titel}</p>
        </Link>

        <div className="flex-between w-full">
          <p className="line-clamp-2 p-medium-14 md:p-medium-16 text-grey-600">
            {opdrachtgeverName} 
          </p> 
          <p className="line-clamp-2 p-medium-14 md:p-medium-16 text-grey-600">
          {opdrachtgeverStad}
          </p>
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {shift.aanmeldingen.length} aanmeldingen
          </p>
        </div>
        <div className="flex-between w-full">
        <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {flexpoolTitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;

