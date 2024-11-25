"use client"

import * as React from "react";
import ShiftCard from '../cards/ShiftArrayCard';
import Card from '../cards/ShiftCard';
import FactuurCard from '../cards/FactuurCard'; 
import { Button } from '@/app/components/ui/button'
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { useUser } from "@clerk/nextjs"
import { haalShift, fetchBedrijfShiftsByClerkId } from "@/app/lib/actions/shiftArray.actions"
import { useEffect, useRef, useState } from "react"
import { haalFlexpoolFreelancer } from "@/app/lib/actions/flexpool.actions"
import {  Bars3Icon, BellIcon, CalendarIcon, FolderIcon, UsersIcon, XMarkIcon, CurrencyEuroIcon, HomeIcon, ClockIcon} from '@heroicons/react/24/outline'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from "react"
import UitlogModal from "./UitlogModal"
import ProfielModal from "./ProfielModal"
import logo from '@/app/assets/images/178884748_padded_logo.png';
import Image from 'next/image'; 
import { Calendar } from "../ui/calendar"
import { Dialog, Menu, MenuButton, MenuItems, } from '@headlessui/react'
import { haalFreelancer, haalFreelancerVoorAdres } from "@/app/lib/actions/freelancer.actions"
import FlexpoolCard from "../cards/FlexpoolCard"
import mongoose from "mongoose"
import { haalCheckouts, haalCheckoutsMetClerkId } from "@/app/lib/actions/checkout.actions"
import { createFacturenForAllFreelancers, haalFacturenFreelancer } from "@/app/lib/actions/factuur.actions"
import { haalAlleBedrijven } from "@/app/lib/actions/bedrijven.actions"
import { filterShift, haalAangemeld, getCoordinatesFromAddress } from "@/app/lib/actions/shift.actions"
import { IShiftArray } from "@/app/lib/models/shiftArray.model"
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { ShiftType } from "@/app/lib/models/shift.model";

const MAX = 100;
const MIN = 0;
const euromarks = [
  {
    value: MIN,
    label: '',
  },
  {
    value: MAX,
    label: '',
  },
];

const distancemarks = [
  {
    value: MIN,
    label: '',
  },
  {
    value: MAX,
    label: '',
  },
];

const navigation = [
  { name: 'Shifts', value: 'Shifts', icon: HomeIcon },
  { name: 'Aanmeldingen', value: 'Aanmeldingen', icon: CalendarIcon },
  { name: 'Geaccepteerde shifts', value: 'Geaccepteerde shifts', icon: FolderIcon },
  { name: 'Checkouts', value: 'Checkouts', icon: ClockIcon },
  { name: 'Facturen', value: 'Facturen', icon: CurrencyEuroIcon },
  { name: 'Flexpools', value: 'Flexpools', icon: UsersIcon },
];


const userNavigation = [
  { name: 'Profiel', href: '#' },
  { name: 'Uitloggen', href: '#' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface bedrijf {
    clerkId: string,
    profielfoto: string,
    naam: string,
    displaynaam: string,
    kvknr: string,
    btwnr: string,
    postcode: string,
    huisnummer: string,
    stad: string,
    straat: string,
    emailadres: string,
    telefoonnummer: string,
    iban: string,
    path: string
}


export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoaded, user } = useUser();
  const [position, setPosition] = React.useState("Shifts");
  const [shift, setShift] = useState<any[]>([])
  const [factuur, setFactuur] = useState<any[]>([])
  const [checkout, setCheckout] = useState<any[]>([])
  const [flexpool, setFlexpool] = useState<any[]>([])
  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState<string | null>(null); 
  const [showProfiel, setShowProfiel] = useState(false);
  const [showLogOut, setShowLogOut] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [tarief, setTarief] = useState<number>(14);
  const [afstand, setAfstand] = useState<number>(5);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);
  const [businessShifts, setBusinessShifts] = useState<any[]>([]);
  const [freelancerId, setFreelancerId] = useState<string>("")
  const [query, setQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<bedrijf | null>(null);
  const [businesses, setBusinesses] = useState<bedrijf[]>([]);
  const [aangemeld, setAangemeld] = useState<any[]>([]);
  const [geaccepteerd, setGeaccepteerd] = useState<any[]>([]);
  const [adres, setAdres] = useState<any>(null);
  const [freelancer, setFreelancer] = useState<any>(null);
  const [euroVal, setEuroVal] = React.useState<number>(MIN);
  const handleUurtariefChange = (_: Event, newValue: number | number[]) => {
    setEuroVal(newValue as number);
    setTarief(euroVal);
  };
  const [distanceVal, setDistanceVal] = React.useState<number>(MIN);
  const handleAfstandChange = (_: Event, newValue: number | number[]) => {
    setDistanceVal(newValue as number);
    setAfstand(distanceVal)
  };
  
  
  useEffect(() => {
    if (isLoaded && user) {
      setFullName(user.fullName);
      setProfilePhoto(user.imageUrl);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const getFreelancerId = async () => {
      try {
        const freelancer = await haalFreelancer(user!.id);
        const opdrachtnemer = await haalFreelancerVoorAdres(user!.id);
        if (freelancer) {
          setFreelancerId(opdrachtnemer._id.toString());
          const freelancerAdres = await getCoordinatesFromAddress(`${opdrachtnemer.huisnummer}+${opdrachtnemer.straat}+${opdrachtnemer.stad}+the+netherlands`);
          setAdres(freelancerAdres)
          setFreelancer(freelancer);
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
  }, [freelancerId]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await haalShift(freelancerId as unknown as mongoose.Types.ObjectId);

        if (response) {
          // Sort the shifts by date
          
          const sortedShifts = response.sort((a: any, b: any) => {
            return new Date(a.begindatum).getTime() - new Date(b.begindatum).getTime(); // Ascending order
          });
          console.log(sortedShifts)
          setShift(sortedShifts); // Set the sorted shifts
        } else {
          setShift([]); // Handle case where response is empty or null
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchShifts();
  }, [freelancerId]);


    useEffect(() => {
    const fetchAangemeldeShifts = async () => {
      try {
            const response = await haalAangemeld(freelancerId as unknown as mongoose.Types.ObjectId);
            if (response) {
              // Filter and separate shifts based on their status
              const geaccepteerdShifts = response.filter((shift: { status: string; }) => shift.status === 'aangenomen');
              const aangemeldShifts = response.filter((shift: { status: string; }) => shift.status !== 'aangenomen');
              // Set the state with the filtered shifts
              setGeaccepteerd(geaccepteerdShifts);
              setAangemeld(aangemeldShifts);
            } else {
              // If no response or not an array, default to empty arrays
              setGeaccepteerd([]);
              setAangemeld([]);
            }
        
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchAangemeldeShifts();  // Call the fetchShifts function
  }, [freelancerId]); 
  
  useEffect(() => {
    const fetchFactuur = async () => {
      try {
        const response = await haalFacturenFreelancer(freelancerId);
        setFactuur(response || []);
      } catch (error) {
        console.error('Error fetching factuur:', error);
      }
    };
    
    fetchFactuur();
  }, [freelancerId]); 
   
  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        if(freelancerId !== ""){
          const response = await haalCheckouts(freelancerId);
          setCheckout(response);
        } else {
          if(user && user.id){
            const response = await haalCheckoutsMetClerkId(user.id);
            setCheckout(response ?? []);
          }
        }
      } catch (error) {
        console.error('Error fetching checkouts:', error);
      }
    };
    fetchCheckout();
  }, [freelancerId]);

  
    useEffect(() => {
      const fetchFlexpool = async () => {
        try {        
          const flexpools = await haalFlexpoolFreelancer(freelancerId || user?.id as string);
          setFlexpool(flexpools || []);
        } catch (error){
          console.log('Error fetching flexpools:', error);
          setFlexpool([]);
          }
      }
        fetchFlexpool();
      }, [freelancerId]);

          useEffect(() => {
            if (selectedBusiness) {  // Only fetch shifts if bedrijfId is available
              const fetchShifts = async () => {
                try {
                  const shifts = await fetchBedrijfShiftsByClerkId(selectedBusiness.clerkId);
                  setBusinessShifts(shifts || []);  // Ensure shifts is always an array
                  setPosition('Bedrijf');
                } catch (error) {
                  console.error('Error fetching shifts:', error);
                  setBusinessShifts([]);  // Handle error by setting an empty array
                }
              };
              fetchShifts();
            }
          }, [selectedBusiness]);
  
  
          useEffect(() => {
    const applyFilters = async () => {
      try {
        let data: Date | Date[] | undefined = undefined;
            if (dateRange.from && dateRange.to) {
              data = [dateRange.from, dateRange.to]; // Pass an array if both dates are defined
            } else if (dateRange.from) {
            data = dateRange.from; // Pass the 'from' date if only 'from' is defined
        }
        const shifts = await filterShift({ tarief, range: afstand, dates: data, freelancerLocation: adres, id: user!.id });
        setFilteredShifts(shifts);  // This should now work correctly
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    applyFilters();
  }, [tarief, afstand, shift, dateRange]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const opdrachtgevers = await haalAlleBedrijven();
        setBusinesses(opdrachtgevers);  // This should now work correctly
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  
  const filteredBusinesses = businesses.filter((opdrachtgevers: { displaynaam: any }) => {
    const naam = `${opdrachtgevers.displaynaam}`;
    return naam.includes(query.toLowerCase());
  });
 
const bedrijfsnaam = "Junter";

const MenuSluiten = (value: string) => {
  setPosition(value);
  setSidebarOpen(false);
}

  
  return (
    <Fragment>
    <>
      <div>
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" />
          <div className="fixed inset-0 flex">
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900 pb-2">
              <div className="absolute right-0 flex items-center pt-5">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto">
                <div className="flex h-16 shrink-0 items-center justify-center">
                <Image 
                className="h-8 w-auto rounded-full"
                width={8}
                height={8} 
                src={logo} 
                alt="Junter logo" /> {/* Use Image component for optimized images */}
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="-mx-2  ml-4 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => MenuSluiten(item.value)}
                          className={classNames(
                            position === item.value ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold'
                            )}
                            >
                          <item.icon aria-hidden="true" className="h-6 w-6" />
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <Image
              alt="Junter"
              src={logo}
              className="h-8 w-auto rounded-full"
              width={8}
              height={8}
              />
          </div>
          <nav className="flex grow flex-col items-center space-y-1 pt-5">
            {navigation.map((item) => (
              <button
              key={item.name}
              onClick={() => MenuSluiten(item.value)}
              className={classNames(
                position === item.value ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                'group flex w-full items-center justify-center gap-x-3 rounded-md p-3 text-sm font-semibold'
                )}
                >
                <item.icon aria-hidden="true" className="h-6 w-6" />
                <span className="sr-only">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:pl-20">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

            <div className="flex flex-1 justify-between gap-x-4 self-stretch lg:gap-x-6">
            <Combobox
        as="div"
        value={selectedBusiness}
        onChange={(business) => {
          setQuery('');
          setSelectedBusiness(business);
        }}
      >
        <div className="relative mt-3">
          <ComboboxInput
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
            displayValue={(opdrachtgever: any) => opdrachtgever ? `${opdrachtgever.displaynaam}` : ''}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          {filteredBusinesses.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredBusinesses.map((business) => (
                <>
                <ComboboxOption
                  key={business.displaynaam}
                  value={business}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-sky-600 data-[focus]:text-white"
                >
                  <div className="flex items-center">
                    <img src={business.profielfoto} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                    <span className="ml-3 truncate group-data-[selected]:font-semibold">{business.displaynaam}</span>
                  </div>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-sky-600 group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
                <ComboboxOption
                key={"Alle shifts"}
                value={bedrijfsnaam}
                onClick={() => setPosition('Shifts')}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-sky-600 data-[focus]:text-white"
                >
                  <div className="flex items-center">
                    <Image src={logo} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                    <span className="ml-3 truncate group-data-[selected]:font-semibold">Alle shifts</span>
                  </div>
                  </ComboboxOption>
                  </>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
      
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="h-6 w-6" />
                </button>

                {/* Separator */}
                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={freelancer?.profielfoto || profilePhoto}
                      className="h-8 w-8 rounded-full bg-gray-50"
                      />
                    <span className="hidden lg:flex lg:items-center">
                      <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                        {fullName} 
                      </span>
                      <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                    {userNavigation.map((item) => (
                      
                      <Menu.Item key={item.name}>
                      {({ active }) => (
                        <a
                        href={item.href}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                          )}
                          onClick={() => {
                            if (item.name === 'Uitloggen') {
                              setShowLogOut(true);
                            }
                            if (item.name === 'Profiel'){
                              setShowProfiel(true)
                            }
                          }}
                          >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <main className={`${['Geaccepteerde shifts','Aanmeldingen', 'Checkouts', 'Facturen', 'Flexpools'].includes(position) ? 'xl:pl-0' : 'xl:pl-96'}`}>
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{/* Main area */}

                {position === 'Shifts' ?

            shift.length > 0 ? (
              <ScrollArea>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shift.slice(0, shift.length).map((shiftItem, index) => (
                <ShiftCard key={index} shift={shiftItem} />
                ))}
                </div>
                </ScrollArea>
              ) : ( 
                <div>Geen shifts beschikbaar</div>
                               )
                             : null

                }


              {position === 'Filter' ?
            filteredShifts.length > 0 ? (
              <ScrollArea>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredShifts.slice(0, filteredShifts.length).map((shiftItem, index) => (
                <ShiftCard key={index} shift={shiftItem} />
                ))}
                </div>
                </ScrollArea>
              ) : ( 
                <div>Geen shifts beschikbaar</div>
                               )
                             : null
                }

              {position === 'Bedrijf' ?
            businessShifts.length > 0 ? (
              <ScrollArea>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {businessShifts.slice(0, businessShifts.length).map((shiftItem, index) => (
                <ShiftCard key={index} shift={shiftItem} />
                ))}
                </div>
                </ScrollArea>
              ) : ( 
                <div>Geen shifts beschikbaar</div>
                               )
                             : null
                            }
                         
                         {position === 'Aanmeldingen' ?
            aangemeld.length > 0 ? (
              <ScrollArea>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {aangemeld.slice(0, aangemeld.length).map((shiftItem, index) => (
                <Card key={index} shift={shiftItem} />
                ))}
                </div>
                </ScrollArea>
              ) : ( 
                <div>Geen shifts beschikbaar</div>
                               )
                             : null
                            }

                {position === 'Geaccepteerde shifts' ?
            geaccepteerd.length > 0 ? (
              <ScrollArea>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {geaccepteerd.slice(0, geaccepteerd.length).map((shiftItem, index) => (
                <Card key={index} shift={shiftItem} />
                ))}
                </div>
                </ScrollArea>
              ) : ( 
                <div>Geen shifts beschikbaar</div>
                               )
                             : null
                            }


               {position === 'Checkouts' ?
              checkout.length > 0 ?  (
                <ScrollArea>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {checkout.slice(0, checkout.length).map((checkoutItem, index) => (
                  <Card key={index} shift={checkoutItem} />
                  ))}
                  </div>
                  </ScrollArea>
                ) : ( 
                <div>Geen checkouts gevonden</div>
                               )
                             : null
                            }
                          
               {position === 'Facturen' ?
              factuur.length > 0 ? (
                <ScrollArea>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {factuur.slice(0, factuur.length).map((factuurItem, index) => (
                  <FactuurCard key={index} factuur={factuurItem} />
                  ))}
                  </div>
                  </ScrollArea>
                ) : ( 
                <div>
                 Geen facturen gevonden
                </div> 
                               )
                             : null
                            } 
               {position === 'Flexpools' ?
              flexpool.length > 0 ? (
                <ScrollArea>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {flexpool.slice(0, flexpool.length).map((flexpoolItem, index) => (
                  <FlexpoolCard key={index} flexpool={flexpoolItem} />
                  ))}
                  </div>
                  </ScrollArea>
                ) : ( 
                <div>Geen flexpools gevonden</div>
                               )
                             : null
                            } 
            </div>
          </main>
            </div>


            {!['Geaccepteerde shifts', 'Aanmeldingen', 'Checkouts', 'Facturen', 'Flexpools'].includes(position) && (
  <aside className="fixed bottom-0 left-20 top-16 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
    {/* Secondary column (hidden on smaller screens) */}
    <div>
      <div>
        <Calendar
          mode="range"
          selectedRange={dateRange}
          onDateRangeChange={(range: React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>) => setDateRange(range)}
        />
      </div>
      <div>
        <p className="mt-20">Tarief</p>
        <Box sx={{ width: 250 }}>
          <Slider
            marks={euromarks}
            step={10}
            value={euroVal}
            valueLabelDisplay="auto"
            min={MIN}
            max={MAX}
            onChange={handleUurtariefChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              onClick={() => setEuroVal(MIN)}
              sx={{ cursor: 'pointer' }}
            >
              €{MIN} min
            </Typography>
            <Typography
              variant="body2"
              onClick={() => setEuroVal(MAX)}
              sx={{ cursor: 'pointer' }}
            >
              €{MAX}
            </Typography>
          </Box>
        </Box>
      </div>
      <p className="mt-20">Afstand</p>
      <Box sx={{ width: 250 }}>
        <Slider
          marks={distancemarks}
          step={10}
          value={distanceVal}
          valueLabelDisplay="auto"
          min={MIN}
          max={MAX}
          onChange={handleAfstandChange}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body2"
            onClick={() => setDistanceVal(MIN)}
            sx={{ cursor: 'pointer' }}
          >
            {MIN} km
          </Typography>
          <Typography
            variant="body2"
            onClick={() => setDistanceVal(MAX)}
            sx={{ cursor: 'pointer' }}
          >
            {MAX} km
          </Typography>
        </Box>
      </Box>
      <div className="justify-between">
        <Button className="mt-20 bg-white text-black border-2 border-black mr-10" onClick={() => setPosition("Shifts")}>
          Reset
        </Button>
        <Button className="mt-20 bg-sky-500" onClick={() => setPosition('Filter')}>
          Zoek
        </Button>
      </div>
    </div>
  </aside>
)}

      </div>
    </>
    <UitlogModal isVisible={showLogOut} onClose={() => setShowLogOut(false)}/>
    <ProfielModal isVisible={showProfiel} onClose={() => setShowProfiel(false)}/>
    </Fragment>
  )
}
