"use client"


import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form";
import { Controller, useForm } from 'react-hook-form';
import { CheckoutValidation } from "@/app/lib/validations/checkout";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod';
import { Textarea } from '@/app/components/ui/textarea';
import { accepteerCheckout, haalcheckout, noShowCheckout, } from '@/app/lib/actions/checkout.actions';
import { TimePicker } from '@mui/x-date-pickers/TimePicker/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import ReactStars from "react-rating-stars-component";
import DropdownPauze from '@/app/components/shared/DropdownPauze';
import { useRouter } from 'next/navigation';
import DashNav from '@/app/components/shared/DashNav';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Checkoutgegevens({ params: { id }, searchParams }: SearchParamProps) {
    const router = useRouter()
    const { control } = useForm();
    const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [checkout, setCheckout] = useState<any>(null);
    const [accepteer, setAccepteer] = useState(true);

    useEffect(() => {
      const fetchCheckout = async () => {
          try {
              const data = await haalcheckout({shiftId: id});
              setCheckout(data);
          } catch (error) {
              console.error('Failed to fetch checkout data:', error);
          }
      };

      fetchCheckout();
  }, [id]);


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
    router.back()
   }
    
    async function onSubmit(values: z.infer<typeof CheckoutValidation>) {
      
      try{
        await accepteerCheckout(
          {
            shiftId: id, 
            rating: values.rating,
            feedback: values.feedback
          }
        )
      } catch (error) {
        console.error('Failed to submit checkout:', error);
    }
    router.back();
  }

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
    <DashNav />
    <Form {...form}>
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="fixed inset-0 mt-14 bg-black bg-opacity-25 backdrop-blur-lg flex justify-center items-center w-auto p-4 md:p-0"
  >
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <Image
          className="object-cover rounded-full"
          src={checkout.opdrachtnemer.profielfoto}
          alt="profielfoto"
          width={64}
          height={64}
        />
        <div>
          <p className="text-lg font-semibold text-gray-800">{checkout.opdrachtnemer.voornaam} {checkout.opdrachtnemer.achternaam}</p>
          <p className="text-gray-500">Ratings: {checkout.opdrachtnemer.ratingCount}</p>
        </div>
      </div>

      {/* Date and Time Information */}
      <div className="my-4">
        <p className="text-sm font-semibold leading-6 text-gray-900">{checkout.datum}, {checkout.begintijd} - {checkout.eindtijd}</p>
        <p className="text-gray-500 text-sm mt-1">{checkout.pauze} minuten pauze</p>
        <p className="text-gray-500 text-sm mt-1">Uurtarief: €{checkout.uurtarief} p/u</p>
      </div>

      {/* Conditional Form Fields */}
      {!accepteer && (
        <>
          <div className="my-4">
            <FormField
              control={form.control}
              name="pauze"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DropdownPauze onChangeHandler={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Time Pickers */}
          <div className="flex gap-4 my-4">
            <Controller
              control={control}
              name="begintijd"
              render={({ field }) => (
                <div className="w-full">
                  <div className="flex items-center h-[54px] w-full overflow-hidden rounded-full bg-gray-100 px-4 py-2">
                    <Image src="/assets/icons/calendar.svg" alt="calendar" width={24} height={24} className="mr-2" />
                    <TimePicker
                      label="Begintijd"
                      value={begintijd}
                      onChange={(newValue) => {
                        const formattedTime = newValue ? newValue.format("HH:mm") : "08:00";
                        setBegintijd(newValue); // Update local state for display
                        field.onChange(formattedTime); // Update form state
                      }}
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
                  <div className="flex items-center h-[54px] w-full overflow-hidden rounded-full bg-gray-100 px-4 py-2">
                    <Image src="/assets/icons/calendar.svg" alt="calendar" width={24} height={24} className="mr-2" />
                    <TimePicker
                      label="Eindtijd"
                      value={eindtijd}
                      onChange={(newValue) => {
                        const formattedTime = newValue ? newValue.format("HH:mm") : "08:00";
                        setEindtijd(newValue);
                        field.onChange(formattedTime); // Update form state
                      }}
                    />
                  </div>
                </div>
              )}
            />
          </div>
        </>
      )}

      {/* Rating, Feedback, and Actions */}
      <div className="my-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <ReactStars count={5} size={24} isHalf={true} activeColor="#ffd700" {...field} />
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
              <FormControl>
                <Textarea placeholder="Opmerking" {...field} className="textarea rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Button className="bg-red-500 text-white border-2 border-red-500 hover:text-black" onClick={() => handleNoShow(id)}>
          No show
        </Button>

        <Button className="bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100" onClick={() => setAccepteer(false)}>
          Weigeren
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {form.formState.isSubmitting ? 'Checkout indienen...' : accepteer ? 'Versturen' : 'Accepteren'}
        </Button>
      </div>
    </div>
  </form>
</Form>
    </LocalizationProvider>
    </>
  )
}
       