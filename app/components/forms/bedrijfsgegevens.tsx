'use client';

import { useState, useEffect } from 'react';
import { easeInOut, motion } from 'framer-motion';
import axios from 'axios';
import { z } from 'zod';
import { BedrijfValidation } from '@/app/lib/validations/bedrijf';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { usePathname, useRouter } from 'next/navigation';
import { useOrganizationList } from "@clerk/nextjs";
import { maakBedrijf } from '@/app/lib/actions/bedrijven.actions';
import { useUser } from '@clerk/nextjs';
import { CheckIcon, UserCircleIcon } from 'lucide-react';
import { useUploadThing } from "@/app/lib/uploadthing";
import { FileUploader } from "@/app/components/shared/FileUploader";

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
        displaynaam: string;
        kvknr: string;
        btwnr: string;
        postcode: string;
        huisnummer: string;
        stad: string;
        straat: string;
        telefoonnummer: string;
        emailadres: string;
        iban: string;
        path: string;
    };
}

const BedrijfsForm = ({ bedrijven }: Props) => {
    const { createOrganization } = useOrganizationList();
    const [organizationName, setOrganizationName] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const [kvkNummer, setKvkNummer] = useState('');
    const { isLoaded, user } = useUser();
    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing("media");

    const haalBedrijfsData = async (kvkNummer: string) => {
        try {
            const response = await axios.get(`/api/kvk?kvkNummer=${kvkNummer}`);
            if (response.data) {
                const { companyName, streetName, houseNumber, houseNumberAddition, houseLetter, postalCode, place } = response.data;

                return {
                    companyName,
                    streetName,
                    houseNumber: `${houseNumber}${houseNumberAddition}${houseLetter}`,
                    postalCode,
                    place
                };
            } else {
                throw new Error('No company data found for the provided KVK number.');
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
            throw error;
        }
    };
    const getUserPhoneNumber = (user: any) => {
        if (user?.primaryPhoneNumber) {
          return user.primaryPhoneNumber;
        }
        
        const primaryPhone = user?.phoneNumbers?.find(
          (phoneNumber: any) => phoneNumber.id === user?.primaryPhoneNumberId
        );
      
        return primaryPhone?.primaryPhoneNumber || "";
      };
    const { register, handleSubmit, watch, reset, trigger, setValue, formState: { errors } } = useForm<Inputs>({
        resolver: zodResolver(BedrijfValidation),
        defaultValues: {
            bedrijvenID: bedrijven?.bedrijvenID || user?.id,
            profielfoto: bedrijven?.profielfoto || user?.imageUrl,
            naam: bedrijven?.naam || '',
            kvknr: bedrijven?.kvknr || '',
            btwnr: bedrijven?.btwnr || '',
            postcode: bedrijven?.postcode || '',
            huisnummer: bedrijven?.huisnummer || '',
            stad: bedrijven?.stad || '',
            straat: bedrijven?.straat || '',
            emailadres: bedrijven?.emailadres ||  user?.emailAddresses[0].emailAddress || "",
            telefoonnummer: bedrijven?.telefoonnummer || getUserPhoneNumber(user) || "",
            iban: bedrijven?.iban || '',
            path: bedrijven?.path || '',
        },
    });

    useEffect(() => {
        const fetchDetails = async () => {
            if (kvkNummer.length === 8) {
                try {
                    const details = await haalBedrijfsData(kvkNummer);
                    console.log('Company Details:', details);
                    setValue('displaynaam', details.companyName);
                    setValue('straat', details.streetName);
                    setValue('huisnummer', details.houseNumber);
                    setValue('postcode', details.postalCode);
                    setValue('stad', details.place);
                } catch (error: any) {
                    console.error('Error:', error.message);
                }
            }
        };

        fetchDetails();
    }, [kvkNummer, setValue]);

    const processForm: SubmitHandler<Inputs> = async (data) => {

        let uploadedImageUrl = data.profielfoto;

         if (files.length > 0) {
            const uploadedImages = await startUpload(files);

         if (!uploadedImages) {
             return;
             }

      uploadedImageUrl = uploadedImages[0].url;
    }

        
            console.log("Function invoked")
            console.log(data)
            try {
                const result =  await maakBedrijf({
                    clerkId: user?.id || "bedrijf",
                    naam: data.naam || user?.firstName || user?.fullName ||"",
                    profielfoto: data.profielfoto || user?.imageUrl || "",
                    displaynaam: data.displaynaam,
                    kvknr: data.kvknr,
                    btwnr: data.btwnr,
                    postcode: data.postcode,
                    huisnummer: data.huisnummer,
                    stad: data.stad,
                    straat: data.straat,
                    emailadres: data.emailadres ||  user?.emailAddresses[0].emailAddress || "",
                    telefoonnummer: data.telefoonnummer || getUserPhoneNumber(user) || "",
                    iban: data.iban,
                    path: data.path,
                });
                console.log("Submission Result:", result);
                if (createOrganization) {
                    await createOrganization({ name: data.displaynaam });
                    setOrganizationName(data.displaynaam);
                } else {
                    console.error("createOrganization function is undefined");
                }
                if (pathname === 'profiel/wijzigen') {
                    router.back();
                } else {
                    router.push('../dashboard');
                }
            } catch (error:any) {
                console.error('Error processing form:', error);
                console.log(error);
            }
        
    };

    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const next = async () => {
        const fields = steps[currentStep].fields;
        const output = await trigger(fields as (keyof Inputs)[], { shouldFocus: true });
        console.log("Validation Output: ", output);
        console.log(errors);

        if (!output) return;

        if (currentStep < steps.length - 1) {
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
        <section className="flex flex-col justify-between p-24">
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
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                        <label htmlFor="kvk" className="block text-sm font-medium leading-6 text-gray-900">
                            KVK
                        </label>
                        <div className="mt-2">
                            <input
                                id="kvknr"
                                {...register('kvknr')}
                                value={kvkNummer}
                                onChange={(e) => setKvkNummer(e.target.value)}
                                type="text"
                                autoComplete="textinput"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.kvknr && (
                                <p className="text-red-500 text-sm">{errors.kvknr.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Naam contactpersoon / beheerder
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                {...register('naam')}
                                type="text"
                                autoComplete="name"
                                placeholder=''
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.naam && (
                                <p className="text-red-500 text-sm">{errors.naam.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                            Postcode
                        </label>
                        <div className="mt-2">
                            <input
                                id="postal-code"
                                {...register('postcode')}
                                type="text"
                                autoComplete="postal-code"
                                placeholder=''
                                className="block px-3 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={watch('postcode')}
                                onChange={(e) => setValue('postcode', e.target.value)}
                            />
                            {errors.postcode && (
                                <p className="text-red-500 text-sm">{errors.postcode.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="huisnummer" className="block text-sm font-medium leading-6 text-gray-900">
                            Huisnummer
                        </label>
                        <div className="mt-2">
                            <input
                                id="huisnummer"
                                {...register('huisnummer')}
                                type="text"
                                autoComplete="textinput"
                                placeholder=''
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={watch('huisnummer')}
                                onChange={(e) => setValue('huisnummer', e.target.value)}
                            />
                            {errors.huisnummer && (
                                <p className="text-red-500 text-sm">{errors.huisnummer.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="straat" className="block text-sm font-medium leading-6 text-gray-900">
                            Straatnaam
                        </label>
                        <div className="mt-2">
                            <input
                                id="straat"
                                {...register('straat')}
                                type="text"
                                autoComplete="textinput"
                                placeholder=''
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={watch('straat')}
                                onChange={(e) => setValue('straat', e.target.value)}
                            />
                            {errors.straat && (
                                <p className="text-red-500 text-sm">{errors.straat.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                            Stad
                        </label>
                        <div className="mt-2">
                            <input
                                id="city"
                                {...register('stad')}
                                type="text"
                                autoComplete="stad"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={watch('stad')}
                                onChange={(e) => setValue('stad', e.target.value)}
                            />
                            {errors.stad && (
                                <p className="text-red-500 text-sm">{errors.stad.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                            Emailadres
                        </label>
                        <div className="mt-2">
                            <input
                                id="emailadres"
                                {...register('emailadres')}
                                type="text"
                                autoComplete="emailadres"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.emailadres && (
                                <p className="text-red-500 text-sm">{errors.emailadres.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                            Telefoonnummer
                        </label>
                        <div className="mt-2">
                            <input
                                id="telefoonnummer"
                                {...register('telefoonnummer')}
                                type="text"
                                autoComplete="telefoonnummer"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.telefoonnummer && (
                                <p className="text-red-500 text-sm">{errors.telefoonnummer.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="iban" className="block text-sm font-medium leading-6 text-gray-900">
                            BTW-ID
                        </label>
                        <p className="text-sm text-slate-400">(optioneel)</p>
                        <div className="mt-2">
                            <input
                                id="btwnr"
                                {...register('btwnr')}
                                type="text"
                                autoComplete="btwid"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {errors.iban && (
                                <p className="text-red-500 text-sm">{errors.iban.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="iban" className="block text-sm font-medium leading-6 text-gray-900">
                            IBAN
                        </label>
                        <p className="text-sm text-slate-400">(optioneel)</p>
                        <div className="mt-2">
                            <input
                                id="iban"
                                {...register('iban')}
                                type="text"
                                autoComplete="iban"
                                className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                 <div className="col-span-full sm:col-span-4">
                                        <label htmlFor="displaynaam" className="block text-sm font-medium leading-6 text-gray-900">
                                            Displaynaam
                                        </label>
                                        <input
                                            id="displaynaam"
                                            {...register('displaynaam')}
                                            type="text"
                                            autoComplete="displaynaam"
                                            className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                        {errors.displaynaam && (
                                            <p className="text-red-500 text-sm">{errors.displaynaam.message}</p>
                                        )}
                                    </div>

                                         <div className="mt-10 space-y-8 col-span-full pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                                            <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-4 sm:py-6">
                                              <label htmlFor="profielfoto" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                                               Profielfoto
                                              </label>
                                              <div className="mt-2 sm:col-span-2 sm:mt-0">
                                              <FileUploader
                                                  onFieldChange={(files) => setValue('profielfoto', files, { shouldValidate: true })}
                                                  imageUrl={watch('profielfoto') || ''}
                                                  setFiles={setFiles}
                                                />
                                                {errors.profielfoto && <p className="mt-2 text-sm text-red-600">{errors.profielfoto.message}</p>}
                                              </div>
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
                                                rows={14}
                                                className="block px-3 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                <h2 className="mt-7 text-base font-semibold leading-7 text-gray-900">Welkom bij Junter!</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                Je bent klaar! Klik op 'Voltooien' om het proces af te ronden.
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
