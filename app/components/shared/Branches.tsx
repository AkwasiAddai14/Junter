"use client"

import Image from 'next/image';
import foodDelivery from '@/app/assets/images/logos/A food delivery driver biking through the city.jpg';
import forkliftDriver from '@/app/assets/images/logos/ A forklift driver working in a big warehouse.jpg';
import clothingStore from '@/app/assets/images/logos/ Enthusiastic people working in a clothing store from a distance.jpg';
import footballStadium from '@/app/assets/images/A food station in the hallway of a football stadium during a sports event.jpg';
export default function Example() {
  return (
      <main>
      <div className="bg-white">
      <div className="h-14 bg-white"></div>
      <div className="mt-32 overflow-visible sm:mt-40">
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
              <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Ontdek de veelzijdigheid van ons platform voor freelancers.</h2>
                <p className="mt-6 text-xl leading-8 text-gray-600">
                Of je nu een passie hebt voor de gastvrijheid van de horeca, 
                de precisie van logistiek en transport, 
                of de zorgzaamheid van de zorg & welzijn sector, 
                ons platform biedt een divers scala aan mogelijkheden.
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end hidden sm:block sm:w-0 sm:flex-auto">
                  <Image
                    src={forkliftDriver}
                    alt=""
                    className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
                <div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[37rem] lg:items-start lg:justify-end lg:gap-x-8">
                  <div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
                    <Image
                      src={clothingStore}
                      alt=""
                      className="aspect-[4/3] w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                  <div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
                    <Image
                      src={footballStadium}
                      alt=""
                      className="aspect-[7/5] w-[37rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                  <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
                    <Image
                      src={foodDelivery}
                      alt=""
                      className="aspect-[4/3] w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
  )
}