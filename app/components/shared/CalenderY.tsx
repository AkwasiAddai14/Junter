"use client"

import { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, startOfDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const generateYearCalendar = (year: number) => {
  const months = [];
  const today = startOfDay(new Date());

  for (let month = 0; month < 12; month++) {
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(start);
    let startDayOfWeek = getDay(start); // Get the day of the week for the 1st day of the month

    // Adjust startDayOfWeek to make the week start on Monday
    startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; // Shift Sunday (0) to end of week

    const days = eachDayOfInterval({ start, end }).map(date => {
      const isToday = date.getTime() === today.getTime(); // Compare timestamps for accurate date matching
      return {
        date: format(date, 'yyyy-MM-dd'),
        isCurrentMonth: date.getMonth() === month,
        isToday,
      };
    });

    months.push({
      name: format(start, 'MMMM'),
      days,
      startDayOfWeek, // Pass this to handle empty spaces
    });
  }
  return months;
};

export default function Example() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState(generateYearCalendar(year));

  useEffect(() => {
    setMonths(generateYearCalendar(year));
  }, [year]);

  const handlePreviousYear = () => {
    setYear(prevYear => prevYear - 1);
  };

  const handleNextYear = () => {
    setYear(prevYear => prevYear + 1);
  };

  return (
    <div>
      <div className="bg-white md:w-auto lg:pl-96 lg:w-auto">
        <div className="flex items-center justify-between p-4">
          <button onClick={handlePreviousYear}>
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{year}</h2>
          <button onClick={handleNextYear}>
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-16 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4">
          {months.map((month) => (
            <section key={month.name} className="text-center">
              <h2 className="text-sm font-semibold text-gray-900">{month.name}</h2>
              <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>
              <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                {/* Add empty cells before the start of the month */}
                {Array.from({ length: month.startDayOfWeek }).map((_, index) => (
                  <div key={index} className="bg-gray-50 text-gray-400 py-1.5" />
                ))}

                {month.days.map((day, dayIdx) => (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={`Day ${day.date}`}
                    className={classNames(
                      day.isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400',
                      dayIdx === 0 && 'rounded-tl-lg',
                      dayIdx === 6 && 'rounded-tr-lg',
                      dayIdx === month.days.length - 7 && 'rounded-bl-lg',
                      dayIdx === month.days.length - 1 && 'rounded-br-lg',
                      'py-1.5 hover:bg-gray-100 focus:z-10',
                    )}
                  >
                    <time
                      dateTime={day.date}
                      className={classNames(
                        day.isToday && 'bg-indigo-600 font-semibold text-white',
                        'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                      )}
                    >
                      {day.date.split('-').pop()?.replace(/^0/, '') || ''}
                    </time>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}


