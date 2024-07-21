import { CalendarDaysIcon, CreditCardIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { Button } from '../ui/button';

export default function ProfielModal({isVisible, onClose} : {isVisible: boolean, onClose: any}) {
    const [open, setOpen] = useState(true);
    const [fullName, setFullName] = useState(true);
    const [stad, setStad] = useState(true);
    const [leeftijd, setLeeftijd] = useState(true);
    const [rating, setRating] = useState(true);
    const [kvknr, setKvknr] = useState(true);
    const [btwid, setBtwid] = useState(true);
    const [iban, setIban] = useState("");
    const [percentageAanwezig, setPercentageAanwezig] = useState(100);
    const [percentageOptijd, setPercentageOptijd] = useState(100);
    const [bio, setBio] = useState("");
    const [shiftsCount, setShiftCount] = useState("");
    if (!isVisible) return null;
  return (
    <div className='fixed inset-0 bg-black
    bg-opacity-25 backdrop-blur-sm flex justify-center items-center'>
    <div className="lg:col-start-3 lg:row-end-1">
      <h2 className="sr-only">Profiel</h2>
      <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="text-sm font-semibold leading-6 text-gray-900">{fullName}</dt>
            <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">{stad}, {leeftijd}</dd>
          </div>
          <div className="flex-none self-end px-6 pt-4">
            <dt className="sr-only">rating</dt>
            <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {rating}
            </dd>
          </div>
          <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
            <dt className="flex-none">
              <span className="sr-only">KVK-nummer: </span>
              <UserCircleIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm font-medium leading-6 text-gray-900">{kvknr}</dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">BTW-id: </span>
              <CalendarDaysIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              <time dateTime="2023-01-31">{btwid}</time>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">iban: </span>
              <CreditCardIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">{iban}</dd>
          </div>
        </dl>
        <dl className="flex flex-wrap">

          <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
            <dt className="flex-none">
              <span className="sr-only">{shiftsCount}</span>
              <UserCircleIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm font-medium leading-6 text-gray-900">Shifts</dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">{percentageAanwezig}</span>
              <CalendarDaysIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              <time dateTime="2023-01-31">Aanwezig</time>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">{percentageOptijd}</span>
              <CreditCardIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">Op tijd</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
        <div className="text-black">
         {bio}
          </div>
        </div>
        </div> 
        <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
        <div className="justify-between">
          <Button className="mt-20 bg-white text-black border-2 border-black mr-10"
          onClick={() => onClose()}
          >
            Annueleren
          </Button>
          <Button className="mt-20 bg-sky-500" >
            Opslaan
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
