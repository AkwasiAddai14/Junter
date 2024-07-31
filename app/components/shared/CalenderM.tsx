"use client"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import React from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, parse } from 'date-fns'

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const CalenderM = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [shifts, setShifts] = useState<any[]>([])

  const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
  const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })

  const days = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="lg:flex lg:pl-96 md:w-auto lg:w-auto lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={format(currentMonth, 'yyyy-MM')}>{format(currentMonth, 'MMMM yyyy')}</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
              onClick={handlePrevMonth}
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
              onClick={handleNextMonth}
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
          <div className="bg-white py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
        </div>
        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
            {days.map((day) => (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={classNames(
                  isSameMonth(day, currentMonth) ? 'bg-white' : 'bg-gray-50 text-gray-500',
                  'relative px-3 py-2'
                )}
              >
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={
                    isSameDay(day, new Date())
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 font-semibold text-white'
                      : undefined
                  }
                >
                  {format(day, 'd')}
                </time>
                {/* Add your event handling logic here */}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
            {days.map((day) => (
              <button
                key={format(day, 'yyyy-MM-dd')}
                type="button"
                className={classNames(
                  isSameMonth(day, currentMonth) ? 'bg-white' : 'bg-gray-50',
                  (isSameDay(day, selectedDate ?? new Date()) || isSameDay(day, new Date())) && 'font-semibold',
                  isSameDay(day, selectedDate ?? new Date()) && 'text-white',
                  !isSameDay(day, selectedDate ?? new Date()) && isSameDay(day, new Date()) && 'text-sky-600',
                  !isSameDay(day, selectedDate ?? new Date()) && isSameMonth(day, currentMonth) && !isSameDay(day, new Date()) && 'text-gray-900',
                  !isSameDay(day, selectedDate ?? new Date()) && !isSameMonth(day, currentMonth) && !isSameDay(day, new Date()) && 'text-gray-500',
                  'flex h-36 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10'
                )}
                onClick={() => handleDateClick(day)}
              >
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={classNames(
                    isSameDay(day, selectedDate ?? new Date()) && 'flex h-6 w-6 items-center justify-center rounded-full',
                    isSameDay(day, selectedDate ?? new Date()) && isSameDay(day, new Date()) && 'bg-sky-600',
                    isSameDay(day, selectedDate ?? new Date()) && !isSameDay(day, new Date()) && 'bg-gray-900',
                    'ml-auto'
                  )}
                >
                  {format(day, 'd')}
                </time>
                <span className="sr-only">{/* {day.events.length} events */}</span>
                {/* Add your event handling logic here */}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalenderM
