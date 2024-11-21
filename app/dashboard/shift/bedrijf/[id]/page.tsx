"use client"

import { AanmeldingenSectie } from '@/app/components/shared/AanmeldingenSectie';
import { AangenomenSectie } from '@/app/components/shared/Aangenomen';
import { haalShiftMetId } from '@/app/lib/actions/shift.actions'
import Image from 'next/image';
import calendar from '@/app/assets/images/logos/calendar.svg';
import location from '@/app/assets/images/logos/location-grey.svg'
import { UserIcon } from '@heroicons/react/20/solid';
import DashNav from '@/app/components/shared/DashNav';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from 'react';
import { AuthorisatieCheck } from '@/app/dashboard/AuthorisatieCheck';
import React, { useState, useEffect } from 'react';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';
import { FlattenMaps } from 'mongoose';
import { useRouter } from 'next/navigation';



export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
let shift: FlattenMaps<IShiftArray> & Required<{ _id: FlattenMaps<unknown>; }>;
const shiftDetails = ({ params: { id }, searchParams, }: SearchParamProps) => {
  const [toegang, setToegang] = useState<boolean | null>(null);
  const router = useRouter()

  useEffect(() => {
    const checkAuthorization = async () => {
      const toegangResult = await AuthorisatieCheck(id, 2);
      shift = await haalShiftMetId(id);
      setToegang(toegangResult);
    };

    checkAuthorization();
  }, [id]);

  if (toegang === null) {
    // Show a loading indicator while checking authorization
    return <h1>Loading...</h1>;
  }

  if (!toegang) {
    // Show 403 Forbidden if not authorized
    router.push('/NotFound');
  }

  // Render the regular page if authorized
  

  return (
    <>
    <DashNav/>
    <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
        <Image 
          src={shift.afbeelding}
          alt="hero image"
          width={1000}
          height={1000}
          className="h-full min-h-[300px] object-cover object-center"
        />
        <div className="flex w-full flex-col gap-8 p-5 md:p-10">
          <div className="flex flex-col gap-6">
            <h2 className='h2-bold'>{shift.titel}</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-between w-full flex gap-3">
                <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500 line-clamp-1">
                  {shift.opdrachtgeverNaam}
                </p>
                <p className="p-bold-20 rounded-full items-center bg-green-500/10 px-5 py-2 text-green-700">
                €{shift.uurtarief}
                </p>
                <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                  {shift.functie}
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className='flex gap-2 md:gap-3'>
              <Image src={calendar} alt="calendar" width={32} height={32} />
              <div className="flex-between w-full p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
                <p>
                {new Date(shift.begindatum).toLocaleDateString('nl-NL')}
                </p>
                <p>
                  {shift.begintijd} -  {' '}
                  {shift.eindtijd}
                </p>
              </div>
            </div>

            <div className="p-regular-20 flex items-center gap-3">
            <Image src={location} alt="location" width={32} height={32} />
              <p className="p-medium-16 lg:p-regular-20"> {shift.adres}</p>
            </div>


            <div className='flex-between w-full '>
            <div className="p-regular-20 flex items-center gap-3">
              <UserIcon className='w-8 h-8'/>
              <p className="p-medium-16 lg:p-regular-20">{shift.plekken} plekken</p>
            </div>
            <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500">{shift.inFlexpool ? '✅ Flexpool' : 'niet in flexpool'}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="">
              <h3>Vaardigheden</h3>
            <ul className="rounded-md bg-blue-300 px-3 py-3 gap-y-2">
              {shift.vaardigheden?.map((vaardigheid: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, index: Key | null | undefined) => (
                 <li key={index}>• {vaardigheid}</li>
                  ))}
            </ul>
            </div>


            <div className="">
            <h3>Kledingsvoorschriften</h3>
              <ul className="rounded-md bg-orange-300 px-3 py-3 gap-y-2">
                  {shift.kledingsvoorschriften?.map((kleding: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, index: Key | null | undefined) => (
                    <li key={index}>• {kleding}</li>
                  ))}
              </ul>
            </div>


          </div>
          <div className="flex flex-col gap-2">
            <p className="p-bold-20 text-grey-600">Over de shift</p>
            <p className="p-medium-16 lg:p-regular-18 line-clamp-9">
              {shift.beschrijving} 
            </p>
          </div>
        </div>
      </div>
    </section>

    <AangenomenSectie shiftId={shift._id as string}/>
    <AanmeldingenSectie shiftId={shift._id as string}/>

    </>
  )
}

export default shiftDetails;