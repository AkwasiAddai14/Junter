"use client"

import { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { haalGeplaatsteShifts } from '@/app/lib/actions/shiftArray.actions';
import { format, startOfWeek, endOfWeek, addDays, isToday, differenceInMinutes, parseISO, parse } from 'date-fns';
import React from 'react';
import { fetchBedrijfByClerkId } from '@/app/lib/actions/bedrijven.actions';
import { IShiftArray } from '@/app/lib/models/shiftArray.model';
import { useUser } from '@clerk/nextjs';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


const getColumnStart = (date: Date): number => {
  const day = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  return day === 0 ? 7 : day; // Map Sunday to column 7, otherwise use the day index (Monday = 1, etc.)
};

const getRowStart = (date: Date): number => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 2 + (minutes >= 30 ? 2 : 1); // Each row represents 30 minutes
};

const getRowSpan = (startTime: Date, endTime: Date): number => {
  const duration = differenceInMinutes(endTime, startTime);
  return Math.ceil(duration / 30); // Calculate the number of rows the shift should span
};


const parseShiftTime = (date: Date, timeString: string): Date => {
  // Format the date to 'yyyy-MM-dd'
  const datePart = format(date, 'yyyy-MM-dd');
  // Combine the date part with the time
  const dateTimeString = `${datePart} ${timeString}`;
  // Parse the combined string as a Date object
  const parsedDate = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());

  // Check if the date is valid
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${dateTimeString}`);
  }

  return parsedDate;
};

const CalenderW = () => {
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const { isLoaded, user } = useUser();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [shifts, setShifts] = useState<IShiftArray[]>([]);
  const [bedrijfiD, setBedrijfiD] = useState<string>("");

  useEffect(() => {
    if (isLoaded && user) {
      const getBedrijfId = async () => {
        try {
          const bedrijf = await fetchBedrijfByClerkId(user!.id);
          if (bedrijf && bedrijf._id) {
            setBedrijfiD(bedrijf._id.toString());
          }
        } catch (error) {
          console.error("Error fetching bedrijf by Clerk ID:", error);
        }
      };
    
      if (user && !bedrijfiD) {  // Only fetch if user exists and bedrijfiD is not already set
        getBedrijfId();
      }
    }
  }, [isLoaded, user]);

  

  useEffect(() => {
    if (bedrijfiD) {  // Only fetch shifts if bedrijfId is available
      const fetchShifts = async () => {
        try {
          const shifts = await haalGeplaatsteShifts({ bedrijfId: bedrijfiD });
          setShifts(shifts || []);  // Ensure shifts is always an array
        } catch (error) {
          console.error('Error fetching shifts:', error);
          setShifts([]);  // Handle error by setting an empty array
        }
      };
  
      fetchShifts();
    }
  }, [bedrijfiD]); 

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  }

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  }

  useEffect(() => {
    const currentMinute = new Date().getHours() * 60;
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight - containerNav.current.offsetHeight - containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  return (
    <div className="flex lg:pl-96 lg:w-auto md:pl-0 sm:pl-0 h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={format(currentWeek, 'yyyy-MM-dd')}>{format(currentWeek, 'MMMM yyyy')}</time>
        </h1>
        <div className="flex items-center">
        <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
          <button
            type="button"
            className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            onClick={handlePrevWeek}
          >
            <span className="sr-only">Previous week</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </button>
          <button
            type="button"
            className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            onClick={handleNextWeek}
          >
            <span className="sr-only">Next week</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          </div>
        </div>
      </header>
      <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
        <div style={{ width: '165%' }} className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
          <div ref={containerNav} className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
            <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
              {days.map((day, index) => (
                <button type="button" key={index} className="flex flex-col items-center pb-3 pt-2">
                  {format(day, 'E')} <span className={classNames('mt-1 flex h-8 w-8 items-center justify-center font-semibold', isToday(day) ? 'bg-indigo-600 text-white rounded-full' : 'text-gray-900')}>{format(day, 'd')}</span>
                </button>
              ))}
            </div>
            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
              <div className="col-end-1 w-14" />
              {days.map((day, index) => (
                <div key={index} className="flex items-center justify-center py-3">
                  <span>
                    {format(day, 'EEE')} <span className="items-center justify-center font-semibold text-gray-900">{format(day, 'd')}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100" style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}>
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                {Array.from({ length: 24 }).map((_, index) => (
                  <Fragment key={index}>
                    <div>
                      <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                        {index % 12 === 0 ? 12 : index % 12}{index < 12 ? 'AM' : 'PM'}
                      </div>
                    </div>
                    <div />
                  </Fragment>
                ))}
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="col-start-1 row-span-full" />
                ))}
                <div className="col-start-8 row-span-full w-8" />
              </div>

               {/* Events */}
               <ol
  className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
  style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
>
  {shifts.map((shift) => {
    const startTime = parseShiftTime(shift.begindatum, shift.begintijd);
    const endTime = parseShiftTime(shift.begindatum, shift.eindtijd);

    return (
      <li
        key={shift.id}
        className="relative mt-px flex"
        style={{
          gridColumn: `${getColumnStart(startTime)} / span 1`,
          gridRow: `${getRowStart(startTime)} / span ${getRowSpan(startTime, endTime)}`,
        }}
      >
        <a
          href={`/dashboard/shift/bedrijf/${shift._id}`}
          className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-white border-blue-50 p-2 text-xs leading-5 hover:bg-opacity-75`}
        >
          <p className="order-1 font-semibold text-orange-700">{shift.titel}</p>
          <p className="text-sky-500 group-hover:text-blue-700">
            <time dateTime={startTime.toISOString()}>{format(startTime, 'hh:mm')}</time>
          </p>
        </a>
      </li>
    );
  })}
</ol>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalenderW
