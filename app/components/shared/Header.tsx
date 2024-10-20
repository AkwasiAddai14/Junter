"use client"

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from "next/image";




const navigation = [
  { name: 'Freelancers', href: '../freelancers' },
  { name: 'Bedrijven', href: '../bedrijven' },
  { name: 'Contact', href: '../contact' },
  { name: 'Aanmelden', href: '../sign-up'},
  { name: 'Inloggen', href: '../sign-in' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl">
            <nav className="flex-grow items-align place-items-center justify-evenly lg:justify-start" aria-label="Global"> <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Junter</span>
                <Image
                  alt="Junter Logo"
                  className="h-32 w-auto"
                  src={require('@/app/assets/images/178884748_padded_logo.png')}
                  width={72}
                  height={56}
                  />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="hidden lg:ml-12 lg:flex lg:gap-x-14">
                {navigation.map((item) => (
                  <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
            <div className="px-6 pt-6 lg:max-w-2xl lg:pl-8 lg:pr-0">
          </div>
        </div>
        <Dialog className="lg:hidden"  open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center gap-x-6">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Junter</span>
                <Image
                  className="h-8 w-auto"
                  src={require('@/app/assets/images/178884748_padded_logo.png')}
                  alt=""
                />
              </a>
              <a
              href="../sign-up"
              className="ml-auto rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Aanmelden
            </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                <a
                  href='../junter'
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Junter
                </a>
              </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <div className="hidden sm:mb-10 sm:flex">
                  <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  Ontdek waarom freelancers ons platform verkiezen!
                   Bekijk onze geweldige testimonials en vind je volgende klus vandaag nog!{' '}
                    <a href="../freelancers" className="whitespace-nowrap font-semibold text-sky-600">
                      <span className="absolute inset-0 justify-end" aria-hidden="true" />
                      Lees Meer <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Ontketen je potentieel, vind je volgende opdracht!
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                Ontdek een wereld van mogelijkheden als freelancer op ons platform.
                 Van creatieve projecten tot zakelijke taken, hier vind je jouw volgende succesverhaal. 
                 Word lid en maak je dromen werkelijkheid!"
                </p>
                <div className="mt-10 rounded-lg flex items-center gap-x-6">
                  <a
                    href='../sign-up'
                    className="rounded-lg bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Aanmelden
                  </a>
                  <a href="../freelancers" className="text-sm font-semibold leading-6 text-gray-900">
                    Lees Meer <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
            src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&h=842&q=80"
            alt=""
          />
        </div>
      </div>
    </div>
  )
}
