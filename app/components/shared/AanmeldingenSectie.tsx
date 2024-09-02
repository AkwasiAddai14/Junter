"use client"

import { haalAanmeldingen } from '@/app/lib/actions/shiftArray.actions';
import { accepteerFreelancer, afwijzenFreelancer } from '@/app/lib/actions/shift.actions';
import { useEffect, useState } from "react";
import { format, parse } from 'date-fns';

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

export const AanmeldingenSectie = ({ shiftId }: shiftIdParams) => {
  const [freelancers, setFreelancers] = useState<FreelancerType[]>([]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const aanmeldingen = await haalAanmeldingen(shiftId);
        setFreelancers(aanmeldingen);
      } catch (error) {
        console.error("Error fetching aanmeldingen:", error);
      }
    };

    fetchFreelancers();
  }, [shiftId]);

  const calculateAge = (dateOfBirth: string | number | Date) => {
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
    leeftijd: calculateAge(freelancer.geboortedatum),
    rating: freelancer.rating,
    klussen: freelancer.ratingCount,
    opkomst: freelancer.opkomst,
    punctualiteit: freelancer.punctualiteit,
  }));

  return (
    <div className="px-4 mt-12 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Aanmeldingen</h1>
          <p className="mt-2 text-sm text-gray-700">
            Een lijst van alle aanmeldingen op de shift.
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
                  <tr key={opdrachtnemer.freelancerId}>
                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="flex items-center">
                        <div className="h-11 w-11 flex-shrink-0">
                          <img alt="freelancer profielfoto" src={opdrachtnemer.profielfoto} className="h-11 w-11 rounded-full" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{opdrachtnemer.naam}</div>
                          <div className="mt-1 text-gray-500">{opdrachtnemer.stad}, {opdrachtnemer.leeftijd}</div>
                        </div>
                      </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      <div className="text-gray-900">{opdrachtnemer.rating} sterren</div>
                      <div className="mt-1 text-gray-500">{opdrachtnemer.klussen} klussen</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{opdrachtnemer.opkomst} %</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{opdrachtnemer.punctualiteit} %</td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button 
                        onClick={async () => { 
                          try {
                            await accepteerFreelancer({ shiftId, freelancerId: opdrachtnemer.freelancerId });
                          } catch (error) {
                            console.error("Error accepting freelancer:", error);
                          }
                        }} 
                        className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Accepteren<span className="sr-only">, {opdrachtnemer.naam}</span>
                      </button>
                      <button 
                        onClick={async () => { 
                          try {
                            await afwijzenFreelancer({ shiftId, freelancerId: opdrachtnemer.freelancerId });
                          } catch (error) {
                            console.error("Error rejecting freelancer:", error);
                          }
                        }}
                        className="inline-flex ml-2 items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Afwijzen<span className="sr-only">, {opdrachtnemer.naam}</span>
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
  )
}
