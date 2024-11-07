"use client"

import { useEffect, useState } from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import ShiftCard from '@/app/components/cards/ShiftArrayCard';
import { haalFlexpool } from '@/app/lib/actions/flexpool.actions';
import DashNav from '@/app/components/shared/DashNav';
import React from 'react'


  export type SearchParamProps = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }
  
  export default function FlexpoolPage({ params: { id }, searchParams }: SearchParamProps) {
    const [shifts, setShifts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const flexpool = await haalFlexpool(id);
            if (flexpool) {
              // Only update the state if the data has actually changed
              if (flexpool.shifts.length !== shifts.length) {
                setShifts(flexpool.shifts || []);
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
