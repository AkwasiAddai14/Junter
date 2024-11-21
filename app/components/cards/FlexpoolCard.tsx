import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { fetchBedrijfDetails, isBedrijf } from '@/app/lib/actions/bedrijven.actions';
import { IFlexpool } from '@/app/lib/models/flexpool.model';
import Link from 'next/link';
import { encodePath } from '@/app/lib/utils';


type CardProps = {
  flexpool:  IFlexpool 
}

const Card = ({ flexpool }: CardProps) => {
  const { user } = useUser();
  const userId = user?.id as string;
  const [isEenBedrijf, setIsEenBedrijf] = useState<boolean | undefined>(false);
  const [bedrijfDetails, setBedrijfsdetails] = useState<any>(null)

  useEffect(() => {
  const bedrijfCheck = async () => {
    const isEventCreator = await isBedrijf(); // Assuming isBedrijf is a function that returns a boolean
    setIsEenBedrijf(isEventCreator);
    };
        bedrijfCheck()
    }, []);


  useEffect(() => {
    const getBedrijfDetails = async () => {
      if(isEenBedrijf){
        try {
          const details = await fetchBedrijfDetails(userId);
          setBedrijfsdetails(details);
        } catch (error) {
          console.error('Error fetching bedrijf details:', error);
        }
      } 
      setBedrijfsdetails(false);
    };

    getBedrijfDetails();
  }, [userId]);
  const afbeelding = bedrijfDetails ? bedrijfDetails.profielfoto : "https://utfs.io/f/72e72065-b298-4ffd-b1a2-4d12b06230c9-n2dnlw.webp"

  const cleanString = (str: string): string => {
    return str.replace(/[\r\n]+/g, ''); // Remove carriage returns and newlines
  };
  const basePath = isEenBedrijf 
  ? cleanString(`/dashboard/flexpool/bedrijf/${flexpool._id}`) 
  : cleanString(`/dashboard/flexpool/freelancer/${flexpool._id}`);
  const encodedPath = encodePath(basePath);

 


  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      { isEenBedrijf ? (
          <Link 
          href={`/dashboard/view/${encodedPath}`}
          style={{ backgroundImage: `url(${afbeelding})` }}
          className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
        />
      ):   <Link 
      href={`/dashboard/view/${encodedPath}`}
      style={{ backgroundImage: `url(${afbeelding})` }}
      className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
    />}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <div className="flex gap-2">
          <p className="p-semibold-14 w-full py-1 text-grey-500 line-clamp-2">
            {flexpool.freelancers.length} freelancers
          </p>
        </div>
        <div>
        {flexpool.shifts.length === 1 ? (
                   <>
               <p className="p-semibold-14 w-full py-1 text-grey-500 line-clamp-2">
                 {flexpool.shifts.length} shift 
               </p>
             </>
            ) : (
              <p className="p-semibold-14 w-full py-1 text-grey-500 line-clamp-2">
                {flexpool.shifts.length} shifts
              </p>
            )}
          </div>
        <div className="flex-between w-full">
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {flexpool.titel}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Card;
