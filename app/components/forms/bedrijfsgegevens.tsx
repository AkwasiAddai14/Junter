'use client';

import { useState, useEffect } from 'react';
import { easeInOut, motion } from 'framer-motion';
import axios from 'axios';
import { z } from 'zod';
import { BedrijfValidation } from '@/app/lib/validations/bedrijf';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { usePathname, useRouter } from 'next/navigation';
import { maakBedrijf } from '@/app/lib/actions/bedrijven.actions';

import { PhotoIcon, UserCircleIcon, CheckIcon } from '@heroicons/react/24/solid';

type Inputs = z.infer<typeof BedrijfValidation>;

const steps = [
    {
        id: '1',
        name: 'Gegevens',
        fields: ['voornaam', 'tussenvoegsel', 'achternaam', 'kvk']
    },
    {
        id: ' 2',
        name: 'Profiel',
        fields: ['displaynaam', 'profielfoto', 'bio']
    },
    {
        id: '3',
        name: 'Compleet'
    }
];

interface Props {
    bedrijven: {
        bedrijvenID: string;
        profielfoto: string;
        naam: string;
        kvknr: string;
        btwnr: string;
        postcode: string;
        huisnummer: string;
        telefoonnummer: string;
        emailadres: string;
        iban: string;
        path: string;
    };
}

const BedrijfsForm = ({ bedrijven }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [kvknr, setKvknr] = useState('');

    const fetchAddressData = async (postcode: string, huisnummer: string) => {
        try {
            const apiKey = process.env.POSTCODE_API_KEY; // Replace 'YOUR_API_KEY' with your actual API key
            const url = `https://api.postcodeapi.nu/v3/lookup/${postcode}/${huisnummer}`;

            const response = await axios.get(url, {
                headers: {
                    'X-Api-Key': apiKey,
                },
            });

            const { street, city } = response.data;
            setStreet(street);
            setCity(city);
        } catch (error) {
            console.error('Error fetching address data:', error);
        }
    };

    const {
        register,
        handleSubmit,
        watch,
        reset,
        trigger,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(BedrijfValidation),
        defaultValues: {
            bedrijvenID: bedrijven?.bedrijvenID || '',
            profielfoto: bedrijven?.profielfoto || '',
            naam: bedrijven?.naam || '',
            kvknr: bedrijven?.kvknr || '',
            btwnr: bedrijven?.btwnr || '',
            postcode: bedrijven?.postcode || '',
            huisnummer: bedrijven?.huisnummer || '',
            emailadres: bedrijven?.emailadres || '',
            telefoonnummer: bedrijven?.telefoonnummer || '',
            iban: bedrijven?.iban || '',
            path: bedrijven?.path || '',
        },
    });

    const processForm: SubmitHandler<Inputs> = async (data) => {
        /* await fetchAddressData(data.postcode, data.huisnummer); */

        maakBedrijf({
            clerkId: data.bedrijvenID,
            naam: data.naam,
            profielfoto: data.profielfoto,
            kvknr: data.kvknr,
            btwnr: data.btwnr,
            postcode: data.postcode,
            huisnummer: data.huisnummer,
            emailadres: data.emailadres,
            telefoonnummer: data.telefoonnummer,
            iban: data.iban,
            path: data.path,
        });

        if (pathname === 'profiel/wijzigen') {
            router.back();
        } else {
            router.push('/dashboard');
        }
    };

    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const next = async () => {
        const fields = steps[currentStep].fields;
        const output = await trigger(fields as (keyof Inputs)[], { shouldFocus: true });

        if (!output) return;

        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                await handleSubmit(processForm)();
            }
            setPreviousStep(currentStep);
            setCurrentStep((step) => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep((step) => step - 1);
        }
    };

    return (
        <section className="absolute inset-0 flex flex-col justify-between p-24">
            <nav aria-label="Progress">
                <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className="relative md:flex md:flex-1">
                            {currentStep > stepIdx ? (
                                <span className="flex items-center px-6 py-4 text-sm font-medium">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 group-hover:bg-sky-800">
                                        <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                                </span>
                            ) : currentStep === stepIdx ? (
                                <div className="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-sky-600">
                                        <span className="text-sky-600">{step.id}</span>
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-sky-600">{step.name}</span>
                                </div>
                            ) : (
                                <span className="flex items-center px-6 py-4 text-sm font-medium">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                        <span className="text-gray-500 group-hover:text-gray-900">{step.id}</span>
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</span>
                                </span>
                            )}
                            {stepIdx !== steps.length - 1 && (
                                 <div className="absolute top-0 right-0 hidden h-full w-5 md:block" aria-hidden="true">
                                    <svg className="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
                                        <path
                                            d="M0 -2L20 40L0 82"
                                            vectorEffect="non-scaling-stroke"
                                            stroke="currentcolor"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <form onSubmit={handleSubmit(processForm)} className=" mt-8 items-center rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                {currentStep === 0 && (
                    <motion.div
                        initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, ease: easeInOut }}
                    >
                        <div className="px-8 space-y-12 sm:space-y-16">
                            <div className="border-b border-gray-900/10 pb-12">
                                <h2 className="text-base font-semibold mt-10 leading-7 text-gray-900">Bedrijfgegevens</h2>
                                {/* <p className="mt-1 text-sm leading-6 text-gray-600">
                                    Dit wordt het visitekaartje naar de opdrachtnemers toe
                                </p> */}

                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="kvk" className="block text-sm font-medium leading-6 text-gray-900">
                                            KVK / Bedrijfsnaam
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="kvknr"
                                                {...register('kvknr')}
                                                type="text"
                                                autoComplete="textinput"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.kvknr && (
                                                <p className="text-red-500 text-sm">{errors.kvknr.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                           Naam contactpersoon / beheerder
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="name"
                                                {...register('naam')}
                                                type="text"
                                                autoComplete="name"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.naam && (
                                                <p className="text-red-500 text-sm">{errors.naam.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 sm:col-start-1">
                                        <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                                            Postcode
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="postal-code"
                                                {...register('postcode')}
                                                type="text"
                                                autoComplete="postal-code"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.postcode && (
                                                <p className="text-red-500 text-sm">{errors.postcode.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="huisnummer" className="block text-sm font-medium leading-6 text-gray-900">
                                            Huisnummer
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="huisnummer"
                                                {...register('huisnummer')}
                                                type="text"
                                                autoComplete="textinput"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.huisnummer && (
                                                <p className="text-red-500 text-sm">{errors.huisnummer.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="straat" className="block text-sm font-medium leading-6 text-gray-900">
                                            Straatnaam
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="straat"
                                                {...register('straat')}
                                                type="text"
                                                autoComplete="textinput"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.straat && (
                                                <p className="text-red-500 text-sm">{errors.straat.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4 sm:col-start-1">
                                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                                            Stad
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="city"
                                                {...register('stad')}
                                                type="text"
                                                autoComplete="address-level2"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.stad && (
                                                <p className="text-red-500 text-sm">{errors.stad.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="iban" className="block text-sm font-medium leading-6 text-gray-900">
                                            IBAN
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="iban"
                                                {...register('iban')}
                                                type="text"
                                                autoComplete="iban"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.iban && (
                                                <p className="text-red-500 text-sm">{errors.iban.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 1 && (
                    <motion.div
                        initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, ease: easeInOut }}
                    >
                        <div className="px-8 space-y-12 sm:space-y-16">
                            <div className="border-b border-gray-900/10 pb-12">
                                <h2 className="text-base font-semibold  mt-10 leading-7 text-gray-900">Bedrijfgegevens</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    Vul hier de gegevens in voor het visitekaartje van het bedrijf.
                                </p>

                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="displaynaam" className="block text-sm font-medium leading-6 text-gray-900">
                                            Displaynaam
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="displaynaam"
                                                {...register('displaynaam')}
                                                type="text"
                                                autoComplete="displaynaam"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.displaynaam && (
                                                <p className="text-red-500 text-sm">{errors.displaynaam.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="profielfoto" className="block text-sm font-medium leading-6 text-gray-900">
                                            Omslagfoto
                                        </label>
                                        <div className="mt-2 flex items-center">
                                            <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                                <UserCircleIcon className="h-full w-full text-gray-300" />
                                            </span>
                                            <input
                                                id="profielfoto"
                                                {...register('profielfoto')}
                                                type="file"
                                                className="ml-4 rounded-md bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            />
                                            {errors.profielfoto && (
                                                <p className="text-red-500 text-sm">{errors.profielfoto.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">
                                            Bio
                                        </label>
                                        <p className="mt-3 text-sm leading-6 text-gray-600">
                                                Wat mogen de opdrachtnemers weten over het bedrijf?
                                            </p>
                                        <div className="mt-2">
                                            <textarea
                                                id="bio"
                                                {...register('bio')}
                                                rows={3}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            ></textarea>
                                            {errors.bio && (
                                                <p className="text-red-500 text-sm">{errors.bio.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, ease: easeInOut }}
                    >
                        <div className="px-8 space-y-12 sm:space-y-16">
                            <div className="border-b border-gray-900/10 pb-12">
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    We'll always let you know about important changes, but you pick what else you want to hear about.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mt-8 pb-10 pr-10 flex justify-end space-x-4">
                {currentStep > 0 && (
                    <button
                        type="button"
                        onClick={prev}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        Vorige
                    </button>
                )}
                {currentStep < 2 ? (
                    <button
                        type="button"
                        onClick={next}
                        className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Volgende
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Voltooien
                    </button>
                )}
            </div>
        </form>
        </section>
    );
}

export default BedrijfsForm;
