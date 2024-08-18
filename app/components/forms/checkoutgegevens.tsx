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
import { accepteerCheckout, noShowCheckout, } from '@/app/lib/actions/checkout.actions';
import { TimePicker } from '@mui/x-date-pickers/TimePicker/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import ReactStars from "react-rating-stars-component";
import DropdownPauze from '../shared/DropdownPauze';



export default function checkoutgegevens({isVisible, onClose, shiftId} : {isVisible: boolean, onClose: any, shiftId: string}) {
    if (!isVisible) return null;
    const { control } = useForm();
    const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [checkout, setCheckout] = useState<any>(null);
    const [accepteer, setAccepteer] = useState(true);

    useEffect(() => {
      const fetchCheckout = async () => {
          try {
              const data = await checkout({ shiftId });
              setCheckout(data);
          } catch (error) {
              console.error('Failed to fetch checkout data:', error);
          }
      };

      fetchCheckout();
  }, [shiftId]);


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

 

   const handleNoShow = async (shiftId: string) => {
    try{
      await noShowCheckout({shiftId})
    } catch (error) {
      console.error('Failed to submit checkout:', error);
  }
    onClose()
   }
    
    async function onSubmit(values: z.infer<typeof CheckoutValidation>) {
      
      try{
        await accepteerCheckout(
          {
            shiftId, 
            rating: values.rating,
            feedback: values.feedback
          }
        )
      } catch (error) {
        console.error('Failed to submit checkout:', error);
    }
      

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
                                className="object-cover rounded-full"
                                src={checkout.opdrachtnemer.profielfoto}
                                alt="profielfoto"
                                width={32}
                                height={32}
                            />
                        </div>
                    </dl>
                    <dl className="flex flex-wrap border-b  border-gray-900/5 px-6 pb-6">
          <div className="mt-6 flex w-full flex-auto gap-x-4  border-t border-gray-900/5 px-6 pt-6">
              <p className="text-sm font-semibold leading-6 text-gray-900">{checkout.opdrachtnemer.voornaam}, {checkout.opdrachtnemer.achternaam}</p>
            <dd className="text-sm leading-6 text-gray-500">{checkout.opdrachtnemer.ratingCount} </dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">{checkout.datum}, {checkout.begintijd} - {checkout.eindtijd}</span>
            <dd className="text-sm leading-6 text-gray-500">
              <p className="text-sm leading-6 text-gray-500">{checkout.pauze} minuten</p>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <p className="text-sm font-semibold leading-6 text-gray-900">€{checkout.uurtarief}</p>
            <dd className="text-sm leading-6 text-gray-500">p/u</dd>
          </div>
        </dl>
               {!accepteer && (
                 <><div className="px-6 py-4 space-y-4">
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
                    )} />
                </div><div className="flex flex-col gap-5 md:flex-row">
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
                              className="filter-grey" />
                            <p className="ml-3 whitespace-nowrap text-grey-600">Begintijd:</p>
                            <TimePicker
                               label="Begintijd"
                               value={begintijd}
                               onChange={(newValue) => {
                                 console.log("Selected Time:", newValue ? newValue.format("HH:mm") : "08:00");
                                 const formattedTime = newValue ? newValue.format("HH:mm") : "08:00";
                                 setBegintijd(newValue); // Update local state for display
                                 field.onChange(formattedTime); // Update form state
                               }}
                              />
                          </div>
                        </div>
                      )} />

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
                              className="filter-grey" />
                            <p className="ml-3 whitespace-nowrap text-grey-600">Eindtijd:</p>
                            <TimePicker
                               label="Eindtijd"
                               value={eindtijd}
                               onChange={(newValue) => {
                                 console.log("Selected Time:", newValue ? newValue.format("HH:mm") : "08:00");
                                 const formattedTime = newValue ? newValue.format("HH:mm") : "08:00";
                                 setEindtijd(newValue);
                                 field.onChange(formattedTime); // Convert to ISO string
                               }}
                             />
                          </div>
                        </div>
                      )} />
                  </div>
                  </>
               )}    

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

          <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <Textarea placeholder="opmerking" {...field} className="textarea rounded-2xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

                        <Button className="bg-red-500 text-white border-2 border-red-500 hover:text-black" onClick={() => handleNoShow(shiftId)}>
                            No show
                        </Button>

        </div>
                    <div className="border-t border-gray-900/5 px-6 py-6 flex justify-between">
                        <Button className="bg-white text-black border-2 border-black hover:text-white" onClick={() => setAccepteer(false)}>
                            Weigeren
                        </Button>
                        <Button 
                          type="submit"
                          size="lg"
                          disabled={form.formState.isSubmitting}
                          className="bg-sky-500"
                        >
                          {form.formState.isSubmitting 
                            ? 'Checkout indienen...' 
                            : accepteer 
                              ? 'Versturen' 
                              : 'Accepteren'
                          }
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Form>
  )
}
       