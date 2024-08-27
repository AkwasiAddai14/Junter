'use client'

import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/20/solid'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { haalFlexpool } from '@/app/lib/actions/flexpool.actions'
import { haalAlleFreelancers } from '@/app/lib/actions/freelancer.actions'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import ShiftCard from '@/app/components/cards/ShiftCard'
import { StarIcon } from 'lucide-react'

export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function FlexpoolPage({ params: { id }, searchParams }: SearchParamProps) {
    const [query, setQuery] = useState('')
    const [selectedPerson, setSelectedPerson] = useState(null)
    const [shift, setShifts] = useState<any[]>([]);
    const [freelancers, setFreelancers] = useState <any[]>([]);
    const flexpool = await haalFlexpool(id);
    const opdrachtnemers = await haalAlleFreelancers();
  
    useEffect(() => {
      if (flexpool) {
        setShifts(flexpool.shifts || []);
        setFreelancers(flexpool.freelancers || []);
      } else {
        console.log("No shifts and no freelancers found.");
        setShifts([]);
        setFreelancers([]);
      }
    }, [flexpool]);
    
    const filteredPeople = opdrachtnemers.filter((opdrachtnemer) => {
      let naam = `${opdrachtnemer.voornaam.toLowerCase().includes(query.toLowerCase())} ${opdrachtnemer.achternaam.toLowerCase().includes(query.toLowerCase())}`;
      return naam;
  });

  interface Freelancer {
    voornaam: string;
    tussenvoegsel?: string; // Optional
    achternaam: string;
    // other properties...
  }

  return (
    <>
    <Combobox
      as="div"
      value={selectedPerson}
      onChange={(person) => {
        setQuery('')
        setSelectedPerson(person)
      }}
    >
      <Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Label>
      <div className="relative mt-2">
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setQuery('')}
          displayValue={(opdrachtnemer: Freelancer) => `${opdrachtnemer.voornaam} ${opdrachtnemer.achternaam}`}
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
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {freelancers.map((freelancer) => (
        <li
          key={freelancer.emailadres}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
        >
          <div className="flex flex-1 flex-col p-8">
            <img alt="" src={freelancer.afbeelding} className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" />
            <h3 className="mt-6 text-sm font-medium text-gray-900">{freelancer.naam}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">Title</dt>
              <dd className="text-sm text-gray-500">{freelancer.stad}</dd>
              <dd className="mt-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {freelancer.shifts.length} shifts, {freelancer.rating} <StarIcon height={8} width={8}/>
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <a
                  href={`mailto:${freelancer.emailadres}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <EnvelopeIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
            <div className="w-full h-full overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {shift.length > 0 ?  (
                            shift.length > 0 ? (
                              <ScrollArea>
                                <div className="grid grid-cols-3 gap-4">
                                  {shift.slice(0, shift.length).map((shiftItem, index) => (
                                    <ShiftCard key={index} shift={shiftItem} />
                                  ))}
                                </div>
                              </ScrollArea>
                            ) : (
              <div className="lg:pl-96 h-full overflow-hidden">Geen shifts in de flexpool</div>
                            )
                          ) : null
                        } 
            </div>
            </>
      )
    }
