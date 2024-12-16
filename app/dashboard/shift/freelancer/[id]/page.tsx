"use client"

import AanmeldButton from '@/app/components/shared/AanmeldButton';
import Collection from '@/app/components/shared/Collection';
import { haalShiftMetId, haalGerelateerdShiftsMetCategorie, checkAlreadyApplied } from '@/app/lib/actions/shift.actions'
import Image from 'next/image';
import calendar from '@/app/assets/images/logos/calendar.svg';
import location from '@/app/assets/images/logos/location-grey.svg'
import { UserIcon } from '@heroicons/react/20/solid';
import DashNav from '@/app/components/shared/DashNav';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key, useState, useEffect } from 'react';
import { AuthorisatieCheck } from '@/app/dashboard/AuthorisatieCheck';
import { useUser } from "@clerk/nextjs"
import { haalFreelancer, haalFreelancerVoorAdres } from '@/app/lib/actions/freelancer.actions';




export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const shiftDetails = ({ params: { id }, searchParams }: SearchParamProps) => {
  const [hasApplied, setHasApplied] = useState(false);
  const { isLoaded, user } = useUser();
  const [freelancerId, setFreelancerId] = useState<string>("");
  const [profielfoto, setProfilePhoto] = useState<string>("");
  const [shift, setShift] = useState<any>(null);
  const [relatedEvents, setRelatedEvents] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && user) {
      setProfilePhoto(user?.imageUrl)
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const getFreelancerId = async () => {
      try {
        const opdrachtnemer = await haalFreelancerVoorAdres(user!.id);
        if (opdrachtnemer) {
          setFreelancerId(opdrachtnemer._id.toString());
        } else{
          console.log("geen freelancerId gevonden.")
        }
      } catch (error) {
        console.error("Error fetching freelancer by Clerk ID:", error);
      }
    };
  
    if (user && !freelancerId) {  // Only fetch if user exists and freelancerId is not already set
      getFreelancerId();
    }
  })

  useEffect(()=>{
    const fetchApplied = async () => {
      const applied = await checkAlreadyApplied({ freelancerObjectId: freelancerId,
        shiftArrayObjectId: id,})
      setHasApplied(applied);
    }
    fetchApplied();
  }, [freelancerId])
  
  
  const isGeAuthorizeerd = async (id:string) => {
    const toegang = await AuthorisatieCheck(id, 1);
    if(!toegang){
      return <h1>403 - Forbidden</h1>
    }
  }
  
  isGeAuthorizeerd(id);
  
  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const shiftData = await haalShiftMetId(id);
        setShift(shiftData);

        const relatedData = await haalGerelateerdShiftsMetCategorie({
          categoryId: shiftData.functie,
          shiftId: shiftData.id,
          page: searchParams.page as string,
        });
        setRelatedEvents(relatedData);

        if (freelancerId) {
          const applied = await checkAlreadyApplied({
            freelancerObjectId: freelancerId,
            shiftArrayObjectId: id,
          });
          setHasApplied(applied);
        }
      } catch (error) {
        console.error("Error fetching shift details:", error);
      }
    };

    fetchShiftDetails();
  }, [id, freelancerId, searchParams.page]);
  
 
  return (
    <>
    <DashNav/>
    <section className="flex flex-col justify-center bg-primary-50 bg-dotted-pattern bg-contain">
      <div className="lg:grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl sm:flex xs:flex flex-col">
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
              <Image src={calendar} alt="calendar" width={32} height={32} className='sm:hidden'/>
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
              {/* <p className="p-medium-16 lg:p-regular-20"> {shift.stad}</p> */}
            </div>


            <div className='flex-between w-full '>
            <div className="p-regular-20 flex items-center gap-3">
              <UserIcon className='w-8 h-8'/>
              <p className="p-medium-16 lg:p-regular-20">{shift.plekken} plekken</p>
            </div>
            <div className="p-regular-20 flex items-center gap-3">
              <p className="p-medium-16 lg:p-regular-20">{shift.aanmeldingen.length} aanmeldingen</p>
            </div>
            <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500">{shift.inFlexpool ? '✅ Flexpool' : 'niet in flexpool'}</p>
            </div>
           
            {shift.status === "beschikbaar" && shift.beschikbaar && !hasApplied && (
              <AanmeldButton shift={shift} />
              )}
              
          
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

      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12 xs:gap-20">
      <h2 className="h2-bold">Gerelateerde shifts</h2>
      <Collection 
          data={relatedEvents?.data}
          emptyTitle="Geen relevante shifts gevonden"
          emptyStateSubtext="Kom later nog eens terug"
          collectionType="All_Events"
          limit={36}
          page={1}
          totalPages={relatedEvents?.totalPages}
        />
    </section>
    </>
  )
}

export default shiftDetails;