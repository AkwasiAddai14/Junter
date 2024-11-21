"use client"

import { useEffect, useState } from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import ShiftCard from '@/app/components/cards/ShiftArrayCard';
import { haalFlexpool, haalFlexpoolShifts } from '@/app/lib/actions/flexpool.actions';
import DashNav from '@/app/components/shared/DashNav';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { AuthorisatieCheck } from '@/app/dashboard/AuthorisatieCheck';


  export type SearchParamProps = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }
  
  export default function FlexpoolPage({ params: { id }, searchParams }: SearchParamProps) {
    const [shifts, setShifts] = useState<any[]>([]);
    const [flexpoolShifts, setFlexpoolShifts] = useState<any[]>([]);
    const router = useRouter();
    const [isBedrijf, setIsBedrijf] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    const [geauthoriseerd, setGeauthoriseerd] = useState<Boolean>(false);

    const isGeAuthorizeerd = async (id:string) => {
      const toegang = await AuthorisatieCheck(id, 5);
      setGeauthoriseerd(toegang);
    }
  
    isGeAuthorizeerd(id);
  
    if(!geauthoriseerd){
      return <h1>403 - Forbidden</h1>
    }
  
      useEffect(() => {
        if (!isLoaded) return;
    
        if (!isSignedIn) {
          router.push("./sign-in");
          console.log("Niet ingelogd");
          alert("Niet ingelogd!");
          return;
        }
    
        const userType = user?.organizationMemberships.length ?? 0;
        setIsBedrijf(userType >= 1);
      }, [isLoaded, isSignedIn, router, user]);
    
      if(isBedrijf){
        router.push('/dashboard');
      }

    useEffect(() => {
        const fetchData = async () => {
          try {
            const flexpool = await haalFlexpool(id);
            if (flexpool) {
              // Only update the state if the data has actually changed
              if (flexpool.shifts.length !== shifts.length) {
                setFlexpoolShifts(flexpool.shifts || []);
              }
              
            } else {
              console.log("No shifts and no freelancers found.");
              setShifts([]);   
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
      
        fetchData();
      }, [id]);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const shifts = await haalFlexpoolShifts(id);
            if (shifts) {
              // Only update the state if the data has actually changed
              setShifts(shifts)
            } else {
              console.log("No shifts and no freelancers found.");
              setShifts(flexpoolShifts || []);   
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
      
        fetchData();
      }, [id]);

  return (
    <>
    <DashNav/>
    <div className="w-full h-full overflow-hidden  px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
    <h2 className="text-center text-2xl font-bold my-7">Shifts</h2>
      {shifts.length > 0 ? (
        <ScrollArea>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shifts.slice(0, shifts.length).map((shiftItem, index) => (
              // Check if the 'beschikbaar' property is true before rendering the shift
                         shiftItem.beschikbaar ? (
                      <ShiftCard key={index} shift={shiftItem} />
                     ) : null // If not beschikbaar, do not render anything for this shift
                    ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="lg:pl-96 h-full overflow-hidden">Geen shifts in de flexpool</div>
      )}
    </div>
  </>
 ) 
};
