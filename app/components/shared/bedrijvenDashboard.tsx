'use client'

import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  HomeIcon,
  UserGroupIcon,
  XMarkIcon,
  DocumentCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useUser } from "@clerk/nextjs";
import { Fragment, useEffect, useState } from "react";
import React from 'react';
import Image from 'next/image';
import Calender from './Calender';
import UitlogModal from './UitlogModal';
import { fetchBedrijfByClerkId } from "@/app/lib/actions/bedrijven.actions";
import { haalCheckouts } from '@/app/lib/actions/checkout.actions';
import { haalFlexpools } from "@/app/lib/actions/flexpool.actions";
import { haalGeplaatsteShifts, haalShift, haalShifts } from '@/app/lib/actions/shiftArray.actions';
import ShiftCard from '../cards/ShiftCard';
import FlexpoolCard from '../cards/FlexpoolCard';
import { haalFacturen } from '@/app/lib/actions/factuur.actions';
import { IBedrijf } from '@/app/lib/models/bedrijf.model';




const navigation = [
  { name: 'Dashboard', value: 'Dashboard', icon: HomeIcon, current: true },
  { name: 'Geplaatste shifts', value: 'Shifts', icon: CalendarIcon, current: false },
  { name: 'Checkouts', value: 'Checkouts', icon: DocumentCheckIcon, current: false },
  { name: 'Facturen', value: 'Facturen', icon: BanknotesIcon, current: false },
  { name: 'Flexpools', value: 'Flexpools', icon: UserGroupIcon, current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoaded, user } = useUser();
  const [position, setPosition] = useState("Dashboard");
  const [shift, setShift] = useState<any[]>([]);
  const [factuur, setFactuur] = useState<any[]>([])
  const [checkout, setCheckout] = useState<any[]>([])
  const [flexpool, setFlexpool] = useState<any[]>([])
  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState<string | null>(null);
  const [showLogOut, setShowLogOut] = useState(false);
  const [bedrijfiD, setBedrijfiD] = useState<string>("")

  useEffect(() => {
    if (isLoaded && user) {
      setProfilePhoto(user.imageUrl);
      setFullName(user.fullName);
    }
  }, [isLoaded, user]);


  useEffect(() => {
    const getBedrijfId = async () => {
      try {
        const bedrijf = await fetchBedrijfByClerkId(user!.id);
        if (bedrijf && bedrijf._id) {
          setBedrijfiD(bedrijf._id.toString())
        }
      } catch (error) {
        console.error("Error fetching bedrijf by Clerk ID:", error);
      }
    };
  
    if (user && !bedrijfiD) {  // Only fetch if user exists and bedrijfiD is not already set
      getBedrijfId();
    }
  }, [user]); // Remove bedrijfiD from the dependency array

  
  useEffect(() => {
    const fetchShift = async () => {
      try {
        if (bedrijfiD) {
          const fetchedShifts = await haalGeplaatsteShifts({ bedrijfId: bedrijfiD });
          // Sanitize the fetched data before setting state
          const sanitizeObject = (obj: any) => {
            return JSON.parse(JSON.stringify(obj)); // Removes complex properties like functions, etc.
          };
          setShift(fetchedShifts ? fetchedShifts.map(sanitizeObject) : []);
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
        setShift([]); // Prevent triggering a re-fetch
      }
    };
  
    fetchShift();
  }, [bedrijfiD]); // Only run this when `bedrijfiD` changes
  
useEffect(() => {
  const fetchCheckout = async () => {
    try {
      if (bedrijfiD) {
        const fetchedCheckout = await haalCheckouts(bedrijfiD);
        setCheckout(fetchedCheckout); // Set the fetched checkouts to state
        console.log(checkout)
      }
    } catch (error) {
      console.error('Error fetching checkouts:', error);
    }
  };

  fetchCheckout();
}, [bedrijfiD]); // Add user.id to the dependency array  

useEffect(() => {
  const fetchFactuur = async () => {
    try {
      if (checkout.length > 0) {
        const fetchedFactuur = await haalFacturen();
        setFactuur(fetchedFactuur || []);
      }
    } catch (error) {
      console.error('Error fetching facturen:', error);
    }
  };

  fetchFactuur();
}, [checkout]); // Voeg `checkout` toe aan de dependency array  

useEffect(() => {
  const fetchFlexpool = async () => {
    try {
      if (bedrijfiD) {
        const fetchedFlexpools = await haalFlexpools(bedrijfiD);
        setFlexpool(fetchedFlexpools || []); // Set state without triggering re-renders
      }
    } catch (error) {
      console.error('Error fetching flexpools:', error);
    }
  };

  fetchFlexpool();
}, [bedrijfiD]); // Trigger fetch when bedrijfId is updated

console.log(shift, flexpool)

  return (
    <Fragment>
    <>
      <div>
        <Transition show={sidebarOpen}>
          <Dialog className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                    <button 
             onClick={() => 
              setShowLogOut(true)
             } >
            <Image
              alt="Your Company"
              src={profilePhoto}
              className="h-8 w-auto rounded-full"
              width={8}
              height={8}
            />
            </button>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="-mx-2 flex-1 space-y-1">
                        {navigation.map((item) => (
                          <button
                          key={item.name}
                          onClick={() => setPosition(item.value)}
                          className={classNames(
                            position === item.value ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex w-full items-center justify-center gap-x-3 rounded-md p-3 text-sm font-semibold'
                          )}
                        >
                          <item.icon aria-hidden="true" className="h-6 w-6" />
                          <span className="sr-only">{item.name}</span>
                        </button>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-800 lg:pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
          <button 
             onClick={() => 
              setShowLogOut(true)
             } >
            <Image
              alt="Your Company"
              src={profilePhoto}
              className="h-8 w-auto rounded-full"
              width={8}
              height={8}
            />
            </button>
          </div>
          <nav className="mt-8">
            <ul role="list" className="flex flex-col items-center space-y-1">
              {navigation.map((item) => (
                <button
                key={item.name}
                onClick={() => setPosition(item.value)}
                className={classNames(
                  position === item.value ? 'bg-gray-800 text-white px-5' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  'group flex w-full items-center justify-center gap-x-3 rounded-md p-3 text-sm font-semibold'
                )}
              >
                <item.icon aria-hidden="true" className="h-6 w-6" />
                <span className="sr-only">{item.name}</span>
              </button>
              ))}
            </ul>
          </nav>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
          <a href="#">
            <span className="sr-only">{fullName}</span>
            <Image
              className="h-8 w-8 rounded-full bg-gray-800"
              src={profilePhoto}
              alt="Profielfoto"
              width={8}
              height={8}
            />
          </a>
        </div>


        
        {/* Main area */}
         <main className="lg:pl-20 h-full overflow-hidden">

          
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {position === 'Dashboard' && ( <Calender/> )}
            </div>

            <div className="lg:pl-96 ml-6 h-full overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            { position === 'Shifts' ? (
                    shift.length > 0 ? (
                      <ScrollArea>
                        <div className="grid grid-cols-3 gap-4">
                          {shift.slice(0, shift.length).map((shiftItem, index) => (
                            <ShiftCard key={index} shift={shiftItem} />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
      <div className="lg:pl-96 h-full overflow-hidden">Geen shifts beschikbaar</div>
                    )
                  ) : null
                } 

              {position === 'Checkouts' ? 
              checkout.length > 0 ? (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {checkout.slice(0, 9).map((checkoutItem, index) => (
                      <ShiftCard key={index} shift={checkoutItem} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="lg:pl-96 h-full overflow-hidden"> Geen checkouts beschikbaar </div>
              ): null 
              }


              {position === 'Facturen' ? 
              factuur.length > 0 ? (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {factuur.slice(0, 9).map((factuurItem, index) => (
                      <div>Facturen</div> // ****
                    ))}
                  </div>
                </ScrollArea>
               ) : (
                <div className="lg:pl-96 h-full overflow-hidden"> Geen facturen beschikbaar </div>
              ): null 
              }


              {position === 'Flexpools' ?
              flexpool.length > 0 ? (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {flexpool.slice(0, 9).map((flexpoolItem, index) => (
                      <FlexpoolCard key={index} flexpool={flexpoolItem} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="lg:pl-96 h-full overflow-hidden"> Geen flexpools beschikbaar </div>
              ): null 
              }
              </div>
        </main>


        {sidebarOpen || (
        <aside className="fixed inset-y-0 left-20 hidden lg:block lg:w-96 overflow-hidden border-r border-gray-200 px-4 py-6  lg:px-8">
        <div className="h-full py-2 px-2 items-stretch rounded-lg border-2 border-b flex flex-col">
          <div className="h-1/3 border-2 rounded-lg flex flex-col">
            <div className="w-full border-b-2 h-10">
              <p className="italic font-mono text-lg font-semibold text-center mt-2">Shifts</p>
            </div>
            <div className="flex-grow overflow-hidden">
              <ScrollArea>
                {shift.map((shiftItem, index) => (
                  <li key={index} className="col-span-1 flex rounded-md shadow-sm">
                    
                    <div className="flex flex-1 items-center justify-between truncate border-b border-gray-200 bg-white">
                      <div className="flex-1 truncate px-4 py-2 text-sm">
                        <a href="#" className="font-medium text-gray-900 hover:text-gray-600">
                          {shiftItem.titel}
                        </a>
                        <p className="text-gray-500">{new Date(shiftItem.begindatum).toLocaleDateString('nl-NL')}</p>
                        <p className="text-gray-500">{shiftItem.aanmeldingen?.length} Aanmeldingen</p>
                      </div>
                    </div>
      
                    <div className="flex w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <Image
                      src={shiftItem.afbeelding}
                      width={6}
                      height={6}
                      alt={shiftItem.titel}
                      />
                    </div> 
      
                  </li>
                ))}
              </ScrollArea>
            </div>
          </div>
      
          <div className="h-1/3 border-2 rounded-lg flex flex-col mt-2">
            <div className="w-full border-b-2 h-10">
              <p className="mt-2 italic font-mono text-lg font-semibold text-center">Checkouts</p>
            </div>
            <div className="flex-grow overflow-hidden">
              <ScrollArea>
                {checkout.map((checkoutItem, index) => (
                  <li key={index} className="col-span-1 flex rounded-md shadow-sm">
                    <div className="flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
                      {checkoutItem?.datum ? new Date(checkoutItem.datum).toLocaleDateString() : 'Datum'}, {checkoutItem?.begintijd ? new Date(checkoutItem.begintijd).toLocaleTimeString() : 'Begintijd'} - {checkoutItem?.eindtijd ? new Date(checkoutItem.eindtijd).toLocaleTimeString() : 'Eindtijd'}
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                      <p className="text-gray-500">{checkoutItem?.opdrachtnemer?.voornaam} {checkoutItem?.opdrachtnemer?.achternaam}</p>
                    </div>
                  </li>
                ))}
              </ScrollArea>
            </div>
          </div>
      
          <div className="h-1/3 border-2 rounded-lg flex flex-col mt-2">
            <div className="w-full border-b-2 h-10">
              <p className="mt-2 italic font-mono text-lg font-semibold text-center">Flexpools</p>
            </div>
            <div className="flex-grow overflow-hidden">
              <ScrollArea>
                {flexpool.map((flexpoolItem, index) => (
                  <li key={index} className="col-span-1 flex rounded-md shadow-sm">
                    <div className="flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
                      {flexpoolItem.freelancers?.length} freelancer
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                      <p className="text-gray-500">{flexpoolItem.shifts?.length} shifts</p>
                    </div>
                  </li>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
      </aside>
      )}

    </div>
  </>
    <UitlogModal isVisible={showLogOut} onClose={() => setShowLogOut(false)}/>
    </Fragment>
  )
}


export default Dashboard
