"use client"

import React from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Image from 'next/image';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';

interface ScrollAreaBarProps {
  shift: IShiftArray[]; // Specify the type of shifts
}

const ScrollAreaBar: React.FC<ScrollAreaBarProps> = ({ shift }) => {
  return (
    <ScrollArea className="h-full overflow-auto">
            {Array.isArray(shift) && shift.length > 0 ? (
  shift.map((shiftItem, index) => (
    <li key={index} className="col-span-1 flex rounded-md shadow-sm">
                    
    <div className="flex flex-1 items-center justify-between truncate border-b border-gray-200 bg-white">
      <div className="flex-1 truncate px-4 py-2 text-sm">
        <a href={`/dashboard/shift/bedrijf/${shiftItem._id}`} className="font-medium text-gray-900 hover:text-gray-600">
          {shiftItem.titel}
        </a>
        <p className="text-gray-500">{new Date(shiftItem.begindatum).toLocaleDateString('nl-NL')}</p>
        <p className="text-gray-500">{shiftItem.aanmeldingen?.length} Aanmeldingen</p>
      </div>
    </div>
    <div className='mt-10 h-16 w-16 items-center justify-center overflow-hidden'>
      <Image
      src={shiftItem.afbeelding || "https://utfs.io/f/72e72065-b298-4ffd-b1a2-4d12b06230c9-n2dnlw.webp"}
      width={32}
      height={32}
      alt={shiftItem.opdrachtgeverNaam || "shift"}
      className="object-contain rounded-full" 
      />
    </div>
  </li>
  ))
) : (
  <p>No shifts available</p> // Optional: Display a message if there are no shifts
)}
              </ScrollArea>
  )
}

export default ScrollAreaBar