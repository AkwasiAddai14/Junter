import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { DeleteConfirmation } from '@/app/components/shared/DeleteConfirmation';
import { fetchBedrijfDetails } from '@/app/lib/actions/bedrijven.actions';
import { IFlexpool } from '@/app/lib/models/flexpool.model';


type CardProps = {
  flexpool:  IFlexpool 
}

const Card = ({ flexpool }: CardProps) => {
  const { user } = useUser();
  const userId = user?.id as string;
  const [bedrijfDetails, setBedrijfsdetails] = useState<any>(null)

  useEffect(() => {
    const getBedrijfDetails = async () => {
      try {
        const details = await fetchBedrijfDetails(userId);
        setBedrijfsdetails(details);
      } catch (error) {
        console.error('Error fetching bedrijf details:', error);
      }
    };

    getBedrijfDetails();
  }, [userId]);
  const isEventCreator = userId === bedrijfDetails.clerkId;

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <a href=""
        style={{backgroundImage: `url(${bedrijfDetails.afbeelding})`}}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
     />
      
      {isEventCreator && (
          <DeleteConfirmation shiftId={flexpool._id as string} /> //**** */
      )}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        <div className="flex gap-2">
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {flexpool.freelancers.length} freelancers
          </p>
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {flexpool.shifts.length} shift
          </p>
        </div>
        <div className="flex-between w-full">
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {bedrijfDetails.displaynaam}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Card;
