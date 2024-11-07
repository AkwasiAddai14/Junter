"use client"

import { accepteerFreelancer } from "@/app/lib/actions/shift.actions";
import { afwijzenFreelancer } from "@/app/lib/actions/shift.actions";
import { haalAangenomen, haalAanmeldingen, haalReserves } from "@/app/lib/actions/shiftArray.actions";
import { Fragment, useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, addDays, isToday, differenceInMinutes, parseISO, parse } from 'date-fns';
import { useToast } from '@/app/components/ui/use-toast';
import { haalFreelancerFlexpool } from "@/app/lib/actions/freelancer.actions";
import FreelancerProfielModal from "./freelancerProfielModal"
import Image from 'next/image';

type shiftIdParams = {
  shiftId: string;
};

type FreelancerType = {
  _id: string;
  voornaam: string;
  tussenvoegsel?: string;
  achternaam: string;
  geboortedatum: string;
  telefoonnummer: string;
  emailadres: string;
  bsn: string;
  korregeling: boolean;
  btwid?: string;
  iban: string;
  postcode: string;
  huisnummer: string;
  straat?: string;
  stad?: string;
  onboarded: boolean;
  profielfoto: string;
  ratingCount: number;
  rating: number;
  opkomst: number;
  punctualiteit: number;
  werkervaring: Array<{ bedrijf: string; functie: string; duur: string }>;
  vaardigheden: Array<{ vaardigheid: string }>;
  opleidingen: Array<{ naam: string; school: string; niveau?: string }>;
  shifts: Array<{ shiftId: string; status: string }>;
  flexpools: Array<string>;
  facturen: Array<string>;
};

export const AangenomenSectie = ({ shiftId }: shiftIdParams) => {
  const [freelancers, setFreelancers] = useState<FreelancerType[]>([]);
  const [reserven, setReserven] = useState<FreelancerType[]>([]);
  const [showProfiel, setShowProfiel] = useState(false);
  const [id, setId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const aangenomen = await haalAangenomen(shiftId);
        setFreelancers(aangenomen);
        const reserves = await haalReserves(shiftId);
        setReserven(reserves);
        console.log()
      } catch (error) {
        console.error("Error fetching aangenomen:", error);
      }
    };

    fetchFreelancers();
  }, [shiftId]);

  const parseShiftTime = (date: Date): Date => {
    // Format the date to 'yyyy-MM-dd'
    const datePart = format(date, 'MM-dd-yyyy');
    // Combine the date part with the time

    const parsedDate = parse(datePart, 'MM-dd-yyyy', new Date());

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${datePart}`);
    }
 
    return parsedDate;
  };

  const calculateAge = (dateOfBirth: string | number | Date) => {
    // If dateOfBirth is a string in the format dd/MM/yyyy, parse it
    if (typeof dateOfBirth === 'string') {
      const [day, month, year] = dateOfBirth.split('/').map(Number);
      dateOfBirth = new Date(year, month - 1, day);
    }
  
    const diff = Date.now() - new Date(dateOfBirth).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  const Opdrachtnemers = freelancers.map((freelancer) => ({
    freelancerId: freelancer._id,
    naam: `${freelancer.voornaam} ${freelancer.tussenvoegsel ? freelancer.tussenvoegsel + ' ' : ''}${freelancer.achternaam}`,
    profielfoto: freelancer.profielfoto,
    stad: freelancer.stad,
    leeftijd: calculateAge(parseShiftTime(new Date(freelancer.geboortedatum))),
    rating: freelancer.rating,
    klussen: freelancer.ratingCount,
    opkomst: freelancer.opkomst,
    punctualiteit: freelancer.punctualiteit,
  }));

  const reserves = reserven.map((reserve) => ({
    freelancerId: reserve._id,
    naam: `${reserve.voornaam} ${reserve.tussenvoegsel ? reserve.tussenvoegsel + ' ' : ''}${reserve.achternaam}`,
    profielfoto: reserve.profielfoto,
    stad: reserve.stad,
    leeftijd: calculateAge(parseShiftTime(new Date(reserve.geboortedatum))),
    rating: reserve.rating,
    klussen: reserve.ratingCount,
    opkomst: reserve.opkomst,
    punctualiteit: reserve.punctualiteit,
  }));
  const handleFreelancerAcceptance = async (freelancerId: string) => {
    try {
      const response = await accepteerFreelancer({ shiftId, freelancerId });
  
      if (response.success) {
        const acceptedFreelancer = await haalFreelancerFlexpool(freelancerId); // Fetch freelancer details if not present in the response
        setFreelancers((prevFreelancers) => [...prevFreelancers, acceptedFreelancer]);
        toast({
          variant: 'succes',
          description: "Freelancer geaccpeteerd voor de shift! 👍"
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: "De freelancer is helaas niet geaccpeteerd voor de shift! ❌"
      });
    }
  };

  const handleFreelanceRejection = async (freelancerId: string) => {
    try {
      const response = await afwijzenFreelancer({ shiftId, freelancerId });
  
      if (response.success) {
        setFreelancers((prevFreelancers) => 
          prevFreelancers.filter(freelancer => freelancer._id !== freelancerId)
        );
        toast({
          variant: 'succes',
          description: "Freelancer afgewezen voor de shift! 👍"
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: "Actie is niet toegestaan! ❌"
      });
    }
  };


  function setOpen(arg0: boolean, id :string): void {
    setShowProfiel(arg0);
    setId(id);
  }

    return (
      <Fragment>
      <div className="px-4 mt-12 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Aaangenomen freelancers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Een lijst van alle aangenomen freelancers.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Opdrachtnemer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Werkervaring
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Opkomst
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Punctualiteit
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Opdrachtnemers.map((opdrachtnemer) => (
                    <tr key={opdrachtnemer.naam}>
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-11 w-11 flex-shrink-0">
                            <Image alt="freelancer profielfoto" src={opdrachtnemer.profielfoto} height={16} width={16} onClick={() => setOpen(true, opdrachtnemer.freelancerId)} className="h-11 w-11 rounded-full" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{opdrachtnemer.naam}</div>
                            <div className="mt-1 text-gray-500">{opdrachtnemer.stad}, {opdrachtnemer.leeftijd}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <div className="text-gray-900">{opdrachtnemer.rating.toFixed(2)} sterren</div>
                        <div className="mt-1 text-gray-500">{opdrachtnemer.klussen} klussen</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{opdrachtnemer.opkomst} %</td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{opdrachtnemer.punctualiteit} %</td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button  onClick={() => setOpen(true, opdrachtnemer.freelancerId)} className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                          Bekijken<span className="sr-only">, {opdrachtnemer.naam}</span>
                        </button>
                        <button onClick={() => handleFreelanceRejection(opdrachtnemer.freelancerId)} className="inline-flex ml-2 items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-green-600/20">
                          Afzeggen<span className="sr-only">, {opdrachtnemer.naam}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Reserve freelancers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Een lijst van alle freelancers die op de reservelijst staan.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Opdrachtnemer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Werkervaring
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Opkomst
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Punctualiteit
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reserves.map((reserve) => (
                    <tr key={reserve.naam}>
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-11 w-11 flex-shrink-0">
                            <Image alt="freelancer profielfoto" src={reserve.profielfoto} height={16} width={16} onClick={() => setOpen(true, reserve.freelancerId)} className="h-11 w-11 rounded-full" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{reserve.naam}</div>
                            <div className="mt-1 text-gray-500">{reserve.stad}, {reserve.leeftijd}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <div className="text-gray-900">{reserve.rating.toFixed(2)} sterren</div>
                        <div className="mt-1 text-gray-500">{reserve.klussen} klussen</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{reserve.opkomst} %</td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{reserve.punctualiteit} %</td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                          Reserve<span className="sr-only">, {reserve.naam}</span>
                        </div>
                        <button onClick={() => handleFreelanceRejection(reserve.freelancerId)} className="inline-flex ml-2 items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-green-600/20">
                          Afzeggen<span className="sr-only">, {reserve.naam}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FreelancerProfielModal
       isVisible={showProfiel} 
       onClose={() => setShowProfiel(false)}
        id={id}
        />
      </Fragment>
    )
  }
  