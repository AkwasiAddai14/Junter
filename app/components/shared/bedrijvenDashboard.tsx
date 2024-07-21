'use client'

import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useUser } from "@clerk/nextjs";
import { haalShifts } from "@/app/lib/actions/shiftArray.actions";
import { useEffect, useState } from "react";
import {  haalFactuur } from "@/app/lib/actions/factuur.actions";
import { haalFlexpool } from "@/app/lib/actions/flexpool.actions";
import { haalCheckouts } from "@/app/lib/actions/checkout.actions";
import React from 'react';
import ShiftCard from '../cards/ShiftCard';
import logo from '@/app/assets/images/178884748_padded_logo.png';
import Image from 'next/image';



const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Geplaatste shifts', href: '#', icon: CalendarIcon, current: false },
  { name: 'Checkouts', href: '#', icon: CalendarIcon, current: false },
  { name: 'Facturen', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Flexpools', href: '#', icon: ChartPieIcon, current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


const Dashboard/* : React.FC<DashboardProps> */ = (/* { user } */) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoaded, user } = useUser();
  const [position, setPosition] = React.useState("Shifts");
  const [shift, setShift] = useState<any[]>([])
  const [factuur, setFactuur] = useState<any[]>([])
  const [checkout, setCheckout] = useState<any[]>([])
  const [flexpool, setFlexpool] = useState<any[]>([])
  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      setProfilePhoto(user.imageUrl);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && user) {
      setFullName(user.fullName);
    }
  }, [isLoaded, user]);

  React.useEffect(() => {
    const fetchShift = async () => {
      try {
        const fetchedShift = await haalShifts();
        setShift(fetchedShift);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };

    fetchShift();
  }, []);

  useEffect(() => {
    const fetchFlexpools = async () => {
        try {
            if (user?.id) {
                const fetchedFlexpools = await haalFlexpool(user.id);
                setFlexpool(fetchedFlexpools);
            }
            
        } catch (error) {
          console.error('Error fetching flexpools:', error);
        }
    };

    if (user) {
        fetchFlexpools();
    }
}, [user]);
    

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        if (user?.id) {
          const fetchedCheckout = await haalCheckouts(user.id);
          setCheckout(fetchedCheckout);
      }
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };

    fetchCheckout();
  }, []);

  useEffect(() => {
    const fetchFactuur = async () => {
        try {
            if (checkout && checkout.length > 0) {
                // Voorbeeld: Haal de factuur op voor de eerste checkout in de lijst
                const fetchedFactuur = await haalFactuur(checkout[0].id);
                setFactuur(fetchedFactuur);
            }
        } catch (error) {
            console.error('Error fetching factuur:', error);
        }
    };

    fetchFactuur();
}, [checkout]); // Voeg `checkout` toe aan de dependency array


  return (
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
                      <Image
                        className="h-8 w-auto"
                        src={logo}
                        alt="Junter"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="-mx-2 flex-1 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                              {item.name}
                            </a>
                          </li>
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <Image
              className="h-8 w-auto"
              src={logo}
              alt="Junter"
            />
          </div>
          <nav className="mt-8">
            <ul role="list" className="flex flex-col items-center space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={classNames(
                      item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                </li>
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
            <img
              className="h-8 w-8 rounded-full bg-gray-800"
              src={profilePhoto}
              alt="Profielfoto"
            />
          </a>
        </div>


        {/* Main area */}
        <main className="lg:pl-20">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{/* Main area */}
            {position === 'Dashboard' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {shift.slice(0, 9).map((shiftItem, index) => (
                      <ShiftCard key={index} shift={shiftItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {position === 'Geplaatste shifts' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {shift.slice(0, 9).map((shiftItem, index) => (
                      <ShiftCard key={index} shift={shiftItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
              {position === 'Checkouts' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {checkout.slice(0, 9).map((checkoutItem, index) => (
                      <ShiftCard key={index} shift={checkoutItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
              {position === 'Facturen' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {factuur.slice(0, 9).map((factuurItem, index) => (
                      <ShiftCard key={index} shift={factuurItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
              {position === 'Flexpool' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {flexpool.slice(0, 9).map((flexpoolItem, index) => (
                      <ShiftCard key={index} shift={flexpoolItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
        </main>

        <aside className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
        <div className='buitenste div'> 

        
        <div className='div facturen'>
        <div className='header facturen'>
        <p>Facturen</p>
        </div>
        <div className='body facturen'>
        <ScrollArea>
        
        </ScrollArea>
        </div>
        </div>


        <div className='div twee rubriek'>
        <div className='header tweede rubriek'>
        <p>Checkouts</p>
        </div>
        <div className='body tweede rubriek'>
        <ScrollArea>
        
        </ScrollArea>
        </div>
        </div>


        <div className='div derde rubriek'>
        <div className='header derde rubriek'>
        <p>Flexpools</p>
        <div className='body derde rubriek'>
        <ScrollArea>
    
        </ScrollArea>
        </div>
        </div>
        </div>


        </div>
        </aside>
        </div>
    </>
  )
}

export default Dashboard
