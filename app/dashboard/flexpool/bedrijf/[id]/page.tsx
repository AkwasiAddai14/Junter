"use client"

import { useEffect, useState } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XCircleIcon } from '@heroicons/react/20/solid';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import ShiftCard from '@/app/components/cards/ShiftCard';
import { StarIcon, ClockIcon, Image } from 'lucide-react';
import { haalFlexpool, voegAanFlexpool, verwijderUitFlexpool } from '@/app/lib/actions/flexpool.actions';
import { haalAlleFreelancers } from '@/app/lib/actions/freelancer.actions';
import DashNav from '@/app/components/shared/DashNav';
import { Button } from '@/app/components/ui/button';
import mongoose from 'mongoose';
import { BriefcaseIcon } from '@heroicons/react/24/outline';


export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

interface Freelancer {
  _id: string;
  voornaam: string;
  achternaam: string;
  profielfoto: string;
  stad: string;
  ratingCount: number;
  rating: number;
}

export default function FlexpoolPage({ params: { id }, searchParams }: SearchParamProps) {
  const [query, setQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Freelancer | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [collegas, setCollegas] = useState<any[]>([]);

  const voegFreelancerToe = () => {
    if (!selectedPerson) return; // Guard clause to prevent errors

    voegAanFlexpool({
      flexpoolId: id as unknown as mongoose.Types.ObjectId,
      freelancerId: selectedPerson._id as unknown as mongoose.Types.ObjectId,
    }).then((updatedFlexpool) => {
      setCollegas(updatedFlexpool.freelancers);
    }).catch(error => {
      console.error("Error adding freelancer:", error);
    });
  };

  const verwijderFreelancer = async (collega: { _id: unknown; }) => {
    try {
      await verwijderUitFlexpool({
        flexpoolId: id as unknown as mongoose.Types.ObjectId,
        freelancerId: collega._id as unknown as mongoose.Types.ObjectId,
      });
  
      // Optimistically update the state to remove the freelancer
      setCollegas((prevState) => prevState.filter((item) => item._id !== collega._id));
    } catch (error) {
      console.error('Error removing freelancer:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const flexpool = await haalFlexpool(id);
        console.log(flexpool)
        const opdrachtnemers = await haalAlleFreelancers();
        console.log(opdrachtnemers)
  
        if (flexpool) {
          // Only update the state if the data has actually changed
          if (flexpool.shifts.length !== shifts.length) {
            setShifts(flexpool.shifts || []);
          }
          if (opdrachtnemers) {
            setFreelancers(opdrachtnemers || []);
          }
          if(flexpool.freelancers.length !== collegas.length){
            setCollegas(flexpool.freelancers || [])
          }
        } else {
          console.log("No shifts and no freelancers found.");
          setShifts([]);
          setFreelancers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [id]);

  const filteredPeople = freelancers.filter(opdrachtnemers => {
    const naam = `${opdrachtnemers.voornaam.toLowerCase()} ${opdrachtnemers.achternaam.toLowerCase()}`;
    return naam.includes(query.toLowerCase());
  });

  console.log(shifts, freelancers)

  return (
    <>
    <DashNav/>
    <div className="mt-10 pl-14 flex items-center justify-start">
      <Combobox
        as="div"
        value={selectedPerson}
        onChange={(person) => {
          setQuery('');
          setSelectedPerson(person);
        }}
      >
        <Label className="block text-sm font-medium leading-6 text-gray-900">freelancer uitnodigen</Label>
        <div className="relative mt-2">
          <ComboboxInput
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
            displayValue={(opdrachtnemer: any) => opdrachtnemer ? `${opdrachtnemer.voornaam} ${opdrachtnemer.achternaam}` : ''}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          {filteredPeople.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredPeople.map((person) => (
                <ComboboxOption
                  key={person.achternaam}
                  value={person}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                >
                  <div className="flex items-center">
                    <img src={person.profielfoto} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                    <span className="ml-3 truncate group-data-[selected]:font-semibold">{person.voornaam} {person.achternaam}</span>
                  </div>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
      <button className="rounded-md bg-sky-500 text-white ml-10 mt-7 px-4 py-2"
        onClick={voegFreelancerToe}
        disabled={!selectedPerson}
      >
        Uitnodigen
      </button>
      </div>


      <div className="w-full my-12">
      <h2 className="text-center text-2xl font-bold my-7">Freelancers</h2>
      <ul role="list" className="pl-14 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {collegas.map((collega) => (
          <li
            key={collega._id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <img 
              src={collega.profielfoto} 
              alt="profielfoto"
              className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" 
              />
              <h3 className="mt-6 text-sm font-semibold text-gray-900">{collega.voornaam} {collega.achternaam}</h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dt className="sr-only">Title</dt>
                <dd className="text-md text-gray-500">{collega.stad}</dd>
                <dd className="mt-3">
                <span className="inline-flex  mr-10 items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                {collega.ratingCount} shifts
                </span>
                  <span className="inline-flex items-center justify-between rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                     {collega.rating} <StarIcon height={14} width={14} />
                  </span>
                </dd>
                <div className="flex justify-between font-medium items-center mt-4">
                  <div className='flex items-center'>
                <BriefcaseIcon height={18} width={18} />
                <dd className="ml-1 text-sm text-gray-900">{collega.opkomst}% Opkomst</dd>
                </div>
                <div className='flex items-center'>
                <ClockIcon height={18} width={18} />
                <dd className="ml-1 text-sm text-gray-900">{collega.punctualiteit}% Op tijd </dd>
                </div>
                </div>
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                <button
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent text-sm font-semibold px-2 py-4 text-gray-900"
                  onClick={() => verwijderFreelancer(collega)}
                >
                  <XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-600" />
                  Verwijder
                </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </div>

      <div className="w-full h-full overflow-hidden  px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
      <h2 className="text-center text-2xl font-bold my-7">Shifts</h2>
        {shifts.length > 0 ? (
          <ScrollArea>
            <div className="grid grid-cols-3 gap-4">
              {shifts.slice(0, shifts.length).map((shiftItem, index) => (
                <ShiftCard key={index} shift={shiftItem} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="lg:pl-96 h-full overflow-hidden">Geen shifts in de flexpool</div>
        )}
      </div>
    </>
  );
}
