"use client"


import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form";
import { Controller, useForm } from 'react-hook-form';
import { CheckoutValidation } from "@/app/lib/validations/checkout";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod';
import { Textarea } from '../ui/textarea';
import { vulCheckout } from '@/app/lib/actions/checkout.actions';
import { haalShiftMetIdCard } from '@/app/lib/actions/shift.actions';
import { TimePicker } from '@mui/x-date-pickers/TimePicker/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import ReactStars from "react-rating-stars-component";
import DropdownPauze from '../shared/DropdownPauze';
import { ShiftType } from '@/app/lib/models/shift.model';



export default function CheckoutCard({isVisible, onClose, shift} : {isVisible: boolean, onClose: any, shift: ShiftType}) {
    if (!isVisible) return null;
    const { control } = useForm();
    const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T08:00:AM'));
    const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T04:30:PM'));


  const DefaultValues = {
   beginttijd: "",
   eindtijd: "",
   pauze: "",
   rating: 5,
   opmerking: "",
   feedback: "",
  };

    const form = useForm<z.infer<typeof CheckoutValidation>>({
      resolver: zodResolver(CheckoutValidation),
      defaultValues: DefaultValues,
    })



    async function onSubmit(values: z.infer<typeof CheckoutValidation>) {
        try {
            await vulCheckout({
                shiftId: shift._id,
                rating: values?.rating || 5,
                begintijd: values?.begintijd || shift?.begintijd,
                eindtijd: values?.eindtijd || shift?.eindtijd,
                pauze: values?.pauze || shift?.pauze,
                feedback: values?.feedback || "",
                opmerking: values.opmerking || ""
            });
        } catch (error) {
            console.error('Failed to submit checkout:', error);
        }
    }

    if (!shift) {
        return <div>Loading...</div>;
    }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="fixed inset-0 mt-14 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
            <div className="lg:col-start-3 lg:row-end-1 max-w-lg w-full"> 
                <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
                    <dl className="flex flex-wrap">
                        <div className="flex-none justify-center items-center self-end px-6 pt-4">
                            <Image
                                className="object-cover rounded-lg"
                                src={shift?.afbeelding || ''}
                                alt="profielfoto"
                                width={32}
                                height={32}
                            />
                        </div>
                    </dl>
                    <dl className="flex flex-wrap border-b  border-gray-900/5 px-6 pb-6">
          <div className="mt-6 flex w-full flex-auto gap-x-4  border-t border-gray-900/5 px-6 pt-6">
              <p className="text-sm font-semibold leading-6 text-gray-900"> {shift.opdrachtgeverNaam|| 'Opdrachtgever naam'}, {shift?.functie || 'Functie'}</p>
            <dd className="text-sm leading-6 text-gray-500">{shift.adres || 'Stad'}</dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">{shift?.begindatum ? new Date(shift.begindatum).toLocaleDateString() : 'Datum'}, {shift?.begintijd ? new Date(shift.begintijd).toLocaleTimeString() : 'Begintijd'} - {shift?.eindtijd ? new Date(shift.eindtijd).toLocaleTimeString() : 'Eindtijd'}
        </span>
            <dd className="text-sm leading-6 text-gray-500">
              <p className="text-sm leading-6 text-gray-500">{shift?.pauze || 0} minuten</p>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <p className="text-sm font-semibold leading-6 text-gray-900">€{shift?.uurtarief || '14.00'}</p>
            <dd className="text-sm leading-6 text-gray-500">p/u</dd>
          </div>
        </dl>
                    <div className="px-6 py-4 space-y-4">
                    <FormField
                            control={form.control}
                            name="pauze"
                            render={({ field }) => (
                              <FormItem className="w-full">
                               <FormControl>
                               <DropdownPauze onChangeHandler={field.onChange} value={field.value} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                         />
                    </div>
                    <div className="flex flex-col gap-5 md:flex-row">
        <Controller
            control={control}
            name="begintijd"
            render={({ field }) => (
              <div className="w-full">
                <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                  <Image
                    src="/assets/icons/calendar.svg"
                    alt="calendar"
                    width={24}
                    height={24}
                    className="filter-grey"
                  />
                  <p className="ml-3 whitespace-nowrap text-grey-600">Begintijd:</p>
                  <TimePicker
                  label="Begintijd"
                  value={begintijd}
                  onChange={(newValue) => setBegintijd(newValue)}
                  />
                </div>
              </div>
            )}
          />
        
        <Controller
            control={control}
            name="eindtijd"
            render={({ field }) => (
              <div className="w-full">
                <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                  <Image
                    src="/assets/icons/calendar.svg"
                    alt="calendar"
                    width={24}
                    height={24}
                    className="filter-grey"
                  />
                  <p className="ml-3 whitespace-nowrap text-grey-600">Eindtijd:</p>
                  <TimePicker
                  label="Eindtijd"
                  value={eindtijd}
                  onChange={(newValue) => setEindtijd(newValue)}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                  <ReactStars
                        count={5}
                        size={24}
                        isHalf={true}
                        emptyIcon={<i className="far fa-star"></i>}
                        halfIcon={<i className="fa fa-star-half-alt"></i>}
                        fullIcon={<i className="fa fa-star"></i>}
                        activeColor="#ffd700"
                        {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="border-t border-gray-900/5 px-6 py-6 flex justify-center items-center">
            <Button className="bg-red-500 text-white border-2 border-red-500 hover:text-black" onClick={() => onClose()}>
                Niet gewerkt
            </Button>
            </div>
          <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <Textarea placeholder="feedback" {...field} className="textarea rounded-2xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
                    <div className="border-t border-gray-900/5 px-6 py-6 flex justify-between">
                        <Button className="bg-white text-black border-2 border-black hover:text-white" onClick={() => onClose()}>
                            Annuleren
                        </Button>
                        <Button 
                            type="submit"
                            size="lg"
                            disabled={form.formState.isSubmitting}
                            className="bg-sky-500"
                        >
                            {form.formState.isSubmitting ? 'Checkout indienen...' : 'Indienen'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Form>

  )
}
       