"use client"

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Switch } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Contact() {
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phoneNumber: '',
    message: '',
  });

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!agreed) {
      alert('You must agree to the privacy policy before submitting.');
      return;
    }

    if(formData.firstName === '' || formData.message === ''){
      alert('you must atleast fill in your firstname and a message.');
      return;
    }

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Email sent successfully');
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          phoneNumber: '',
          message: '',
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to send email: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again later.');
    }
  };
  
  {/* <div className="absolute inset-x-0 top-[-20rem] -z-50 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]" aria-hidden="true">
<div
className="relative left-1/2 -z-50 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0EA5E9] to-[#dbeafe] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
style={{
clipPath:
'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
}}
/>
</div> */}

  return (
    <div className="isolate bg-white py-12 sm:py-24 px-4 lg:px-8">
  <div className="mx-auto max-w-lg sm:max-w-2xl text-center">
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Neem contact op</h2>
    <p className="mt-2 text-base sm:text-lg leading-8 text-gray-600">
      Neem vandaag contact op via de onderstaande kanalen en krijg binnen 48 uur bericht
    </p>
  </div>

  <form onSubmit={handleSubmit} className="mx-auto mt-10 sm:mt-16 max-w-lg sm:max-w-xl">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
      <div>
        <label htmlFor="first-name" className="block text-sm font-semibold text-gray-900">
          Voornaam
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="firstName"
            id="first-name"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="last-name" className="block text-sm font-semibold text-gray-900">
          Achternaam
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="lastName"
            id="last-name"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="company" className="block text-sm font-semibold text-gray-900">
          Bedrijf
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="company"
            id="company"
            autoComplete="organization"
            value={formData.company}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
          Emailaddres
        </label>
        <div className="mt-2">
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="phone-number" className="block text-sm font-semibold text-gray-900">
          Telefoonnummer
        </label>
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 flex items-center">
            <select
              id="country"
              name="country"
              value="NL"
              className="h-full bg-transparent pl-4 pr-9 text-gray-400 focus:ring-2 focus:ring-sky-600 sm:text-sm"
            >
              <option>NL</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-3 top-0 h-full w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="tel"
            name="phoneNumber"
            id="phone-number"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 pl-20 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="block text-sm font-semibold text-gray-900">
          Bericht
        </label>
        <div className="mt-2">
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm"
          />
        </div>
      </div>
      <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
        <div className="flex h-6 items-center">
          <Switch
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className={classNames(
              agreed ? 'bg-sky-600' : 'bg-gray-200',
              'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-gray-300 transition-colors duration-200 ease-in-out'
            )}
          >
            <span className="sr-only">Agree to policies</span>
            <span
              aria-hidden="true"
              className={classNames(
                agreed ? 'translate-x-3.5' : 'translate-x-0',
                'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-300 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
        </div>
        <Switch.Label className="text-sm text-gray-600">
          Door dit te selecteren gaat u akkoord met ons{' '}
          <a href="../pb" className="font-semibold text-sky-600">
            privacybeleid
          </a>
          .
        </Switch.Label>
      </Switch.Group>
    </div>
    <div className="mt-8">
      <button
        type="submit"
        className="block w-full rounded-md bg-sky-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline focus:outline-2 focus:outline-sky-600"
      >
        Verstuur bericht
      </button>
    </div>
  </form>
</div>

  )
}

