'use client'

import * as React from "react"
import ShiftCard from '../cards/ShiftCard'
import { Slider } from "@/app/components/ui/slider"  
import { Calendar } from '@/app/components/ui/calendar'
import { Button } from '@/app/components/ui/button'
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { useUser } from "@clerk/nextjs"
import { haalShifts } from "@/app/lib/actions/shiftArray.actions"
import { useEffect, useState } from "react"
import {  haalFactuur } from "@/app/lib/actions/factuur.actions"
import { haalFlexpool } from "@/app/lib/actions/flexpool.actions"
import { haalCheckouts } from "@/app/lib/actions/checkout.actions"
import { Dialog, Menu, MenuButton, MenuItems, } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  FolderIcon,
  UsersIcon,
  XMarkIcon,
  CurrencyEuroIcon,
  HomeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Fragment } from "react"
import UitlogModal from "./UitlogModal"
import ProfielModal from "./ProfielModal"
import logo from '@/app/assets/images/178884748_padded_logo.png';
import Image from 'next/image'; 


const navigation = [
  { name: 'Shifts', value: 'Shifts', icon: HomeIcon },
  { name: 'Aanmeldingen', value: 'Aanmeldingen', icon: CalendarIcon },
  { name: 'Geaccepteerde shifts', value: 'Geaccepteerde shifts', icon: FolderIcon },
  { name: 'Checkouts', value: 'Checkouts', icon: ClockIcon },
  { name: 'Facturen', value: 'Facturen', icon: CurrencyEuroIcon },
  { name: 'Flexpools', value: 'Flexpools', icon: UsersIcon },
];


const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoaded, user } = useUser();
  const [position, setPosition] = React.useState("Shifts");
  const [shift, setShift] = useState<any[]>([])
  const [factuur, setFactuur] = useState<any[]>([])
  const [checkout, setCheckout] = useState<any[]>([])
  const [flexpool, setFlexpool] = useState<any[]>([])
  const [isFreelancer, setIsFreelancer] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState<string | null>(null); 
  const [showProfiel, setShowProfiel] = useState(false);
  const [showLogOut, setShowLogOut] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [uurtarief, setUurtarief] = useState<[number, number]>([0, 100]);
  const [afstand, setAfstand] = useState<[number, number]>([0, 100]);
  const [filteredShifts, setFilteredShifts] = useState<any[]>([]);



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

useEffect(() => {
  applyFilters();
}, [dateRange, uurtarief, afstand, shift]);

const applyFilters = () => {
  const filtered = shift.filter((shiftItem) => {
    const isDateInRange = dateRange.from && dateRange.to 
      ? new Date(shiftItem.date) >= dateRange.from && new Date(shiftItem.date) <= dateRange.to
      : true;
    const isTariefInRange = shiftItem.uurtarief >= uurtarief[0] && shiftItem.uurtarief <= uurtarief[1];
    const isAfstandInRange = shiftItem.afstand >= afstand[0] && shiftItem.afstand <= afstand[1];
    return isDateInRange && isTariefInRange && isAfstandInRange;
  });

  setFilteredShifts(filtered);
  /* setShift(filteredShifts) */
};

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
                <Image className="h-32 w-auto" src={logo} alt="Junter logo" /> {/* Use Image component for optimized images */}
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => setPosition(item.value)}
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
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex grow flex-col items-center space-y-1 pt-5">
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

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="relative flex flex-1">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                />
                <input
                  id="search-field"
                  name="search"
                  type="search"
                  placeholder="Zoeken naar opdrachtgever..."
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                />
              </form>
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
                      src={profilePhoto}
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
                            if (item.name === 'Sign out') {
                              setShowLogOut(true);
                            }
                            if (item.name === 'Your profile'){
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

          <main className="xl:pl-96">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{/* Main area */}
            {position === 'Shifts' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {shift.slice(0, 9).map((shiftItem, index) => (
                      <ShiftCard key={index} shift={shiftItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
              {position === 'Aanmeldingen' && (
                <ScrollArea>
                  <div className="grid grid-cols-3 gap-4">
                    {shift.slice(0, 9).map((shiftItem, index) => (
                      <ShiftCard key={index} shift={shiftItem} />
                    ))}
                  </div>
                </ScrollArea>
              )}
              {position === 'Geaccepteerde shifts' && (
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
            </div>


            <aside className="fixed bottom-0 left-20 top-16 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
          {/* Secondary column (hidden on smaller screens) */}
          <div>
         <div>
          <Calendar
            className="pr-20"
            selected={dateRange}
            onSelect={(range: React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>) => setDateRange(range)}
          />
         </div>
         <div>
          <p className="mt-20">
            Tarief
          </p>
          <Slider
            defaultValue={[0, 100]}
            step={5}
            className="mt-5"
            onChange={(value) => setUurtarief(value)}
          />
         </div>
         <p className="mt-20">
            Afstand
         </p>
         <Slider
           defaultValue={[0, 100]}
           step={5}
           className="mt-5"
           onChange={(value) => setAfstand(value)}
         />
         <div>
          <div className="justify-between">
          <Button className="mt-20 bg-white text-black border-2 border-black mr-10" onClick={() => { setDateRange({ from: undefined, to: undefined }); setUurtarief([0, 100]); setAfstand([0, 100]); applyFilters(); /* setShift(shift) */}} >
            Reset
          </Button>
          <Button className="mt-20 bg-sky-500" onClick={applyFilters} >
            Zoek
          </Button>
          </div>
         </div>
         </div>
        </aside>
      </div>
    </>
    <UitlogModal isVisible={showLogOut} onClose={() => setShowLogOut(false)}/>
    <ProfielModal isVisible={showProfiel} onClose={() => setShowProfiel(false)}/>
    </Fragment>
  )
}
