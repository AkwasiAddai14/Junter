"use client"

import { haalFactuur, haalFactuurShifts } from "@/app/lib/actions/factuur.actions";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import logo from '@/app/assets/images/178884748_padded_logo.png'; 
import { useUser } from "@clerk/nextjs";

interface FreelancerDetails {
  iban: string;
  btwid: string;
  huisnummer: string;
  straat: string;
  stad: string;
  voornaam: string;
  achternaam: string;
  emailadres: string;
  profielfoto: string;
}

export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function factuurBedrijf({ params: { id }, searchParams }: SearchParamProps) {
  const [factuur, setFactuur] = useState<any | null>(null);;
  const [shifts, setShifts] = useState<any[]>([]);
  const router = useRouter();
  const [isBedrijf, setIsBedrijf] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
      if (!isLoaded) return;
  
      if (!isSignedIn) {
        router.push("./sign-in");
        console.log("Niet ingelogd");
        alert("Niet ingelogd!");
        return;
      }
  
      const userType = user?.organizationMemberships.length ?? 0;
      setIsBedrijf(userType >= 1);
    }, [isLoaded, isSignedIn, router, user]);
  
    if(!isBedrijf){
      router.push('/dashboard');
    }

  useEffect(() => {
    const fetchData = async () => {
      try{
        const factuur = await haalFactuur(id);
        if(factuur){
          setFactuur(factuur)
        }
        else{
          console.log("Factuur niet gevonden.");
          setFactuur(null)
        }

      } catch (error: any){
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try{

        const shifts = await haalFactuurShifts(id);
        if(shifts){
          setShifts(shifts)
          console.log(factuur, shifts);
        }
        else{
          console.log("shifts niet gevonden.");
        }
      } catch (error: any){
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  function calculateWorkedHours(begintijd: string, eindtijd: string, pauze: number = 0): number {
    // Parse the begintijd and eindtijd strings into Date objects
    const startTime = new Date(`1970-01-01T${begintijd}:00`);
    const endTime = new Date(`1970-01-01T${eindtijd}:00`);

    // Calculate the difference in milliseconds between startTime and endTime
    const timeDiffMilliseconds = endTime.getTime() - startTime.getTime();

    if (timeDiffMilliseconds < 0) {
        throw new Error('End time cannot be before start time.');
    }

    // Convert the time difference from milliseconds to hours
    const totalHours = timeDiffMilliseconds / (1000 * 60 * 60); // ms to hours

    // Subtract the break time (pauze) from the total hours
    const workedHours = totalHours - pauze / 60;

    // Return the result rounded to two decimal places
    return Math.max(0, Math.round(workedHours * 100) / 100); // Ensure no negative result
}

    // Function to calculate the subtotal for each shift
    const calculateShiftSubtotal = (uren: number, uurtarief: number): number => {
      return uren * (uurtarief + 2.50);
    };
  
    // Function to calculate the subtotal for the entire invoice

    const factuurShifts = shifts.map((shift) => ({
        opdrachtnemer: shift.opdrachtnemer,
        _id: shift._id,
        titel: shift.titel,
        afbeelding: shift.afbeelding,
        datum: shift.begindatum,
        uurtarief: shift.uurtarief + 2.50,
        checkoutbegintijd: shift.checkoutbegintijd,
        checkouteindtijd: shift.checkouteindtijd,
        checkoutpauze: shift.checkoutpauze,
        uren: calculateWorkedHours(shift.checkoutbegintijd, shift.checkouteindtijd, parseInt(shift.checkoutpauze)),
        subtotaal: calculateShiftSubtotal(calculateWorkedHours(shift.checkoutbegintijd, shift.checkouteindtijd, parseInt(shift.checkoutpauze)), shift.uurtarief),
        btw: (calculateShiftSubtotal(calculateWorkedHours(shift.checkoutbegintijd, shift.checkouteindtijd, parseInt(shift.checkoutpauze)) , shift.uurtarief) * 0.21).toFixed(2),
        freelancerVoornaam: shift.freelancerVoornaam,
        freelancerAchternaam: shift.freelancerAchternaam,
        freelancerProfielFoto: shift.freelancerProfielFoto,
    }));

    const totaalSubtotaal = factuurShifts.reduce((acc, shift) => {
      return acc + shift.subtotaal;
  }, 0);
  
    // Tax and total calculations
    const belasting = totaalSubtotaal * 0.21; // 21% tax
    const totaalbedrag = totaalSubtotaal + belasting;

    function isFreelancerDetails(opdrachtnemer: any): opdrachtnemer is FreelancerDetails {
      return (opdrachtnemer && (opdrachtnemer as FreelancerDetails));
    }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Junter</span>
            <Image className="h-32 w-auto" src={logo} alt="Junter logo" /> {/* Use Image component for optimized images */}
          </a>
        </div>
          <h1 className="mt-10 text-base font-semibold leading-6 text-gray-900">Invoice</h1>
          <p className="mt-2 text-sm text-gray-700">
            Factuur voor week {factuur?.week ? factuur.week : 52}
          </p>
        </div>
        <div className="flex flex-row justify-between gap-4 mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
            type="button"
            className="block rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={() => router.back()}
          >
            Terug
          </button>
          <button
            type="button"
            className="block rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Download
          </button>
        </div>
      </div>
      <div className="-mx-4 mt-8 flow-root sm:mx-0">
        <table className="min-w-full">
          <colgroup>
            <col className="w-full sm:w-1/2" />
            <col className="sm:w-1/6" />
            <col className="sm:w-1/6" />
            <col className="sm:w-1/6" />
          </colgroup>
          <thead className="border-b border-gray-300 text-gray-900">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                Shift
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
              >
               Gewerkte uren
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Tarief
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                subtotaal
              </th>
            </tr>
          </thead>
          <tbody>
            {factuurShifts.map((shift) => (
              <tr key={shift._id} className="border-b border-gray-200">
                <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="h-11 w-11 flex-shrink-0">
                  
                      <img alt="Profielfoto" src={shift.freelancerProfielFoto} className="h-11 w-11 rounded-full" />
                 
                  </div>
                  
                      <div className="font-medium text-gray-900">{shift.freelancerVoornaam} {shift.freelancerAchternaam}</div>
            
                  <div className="mt-1 truncate text-gray-500">{shift.datum.toDateString()} | {shift.titel}</div>
                </td>
                <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">{shift.uren}</td>
                <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">€{shift.uurtarief}</td>
                <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                </td>
                <p className="mt-4 font-medium text-gray-900">€{shift.subtotaal}</p>
                  <p className="mt-1 truncate text-gray-500">+ btw €{shift.btw}</p>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th
                scope="row"
                colSpan={3}
                className="hidden pl-4 pr-3 pt-6 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
              >
                Subtotaal
          
              </th>
              <th scope="row" className="pl-4 pr-3 pt-6 text-left text-sm font-normal text-gray-500 sm:hidden">
                Subtotaal
              </th>
              <td className="pl-3 pr-4 pt-6 text-right text-sm text-gray-500 sm:pr-0">{totaalSubtotaal}</td>
            </tr>
            <tr>
              <th
                scope="row"
                colSpan={3}
                className="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
              >
                BTW
              </th>
              <th scope="row" className="pl-4 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden">
                BTW
              </th>
              <td className="pl-3 pr-4 pt-4 text-right text-sm text-gray-500 sm:pr-0">{belasting}</td>
            </tr>
            <tr>
              <th
                scope="row"
                colSpan={3}
                className="hidden pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 sm:table-cell sm:pl-0"
              >
                Totaalbedrag
              </th>
              <th scope="row" className="pl-4 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 sm:hidden">
                Totaalbedrag
              </th>
              <td className="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">{totaalbedrag}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
