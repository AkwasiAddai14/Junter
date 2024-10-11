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
import { vulCheckout } from '@/app/lib/actions/checkout.actions';
import { TimePicker } from '@mui/x-date-pickers/TimePicker/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import ReactStars from "react-rating-stars-component";
import DropdownPauze from '@/app/components/shared/DropdownPauze';
import { useRouter } from 'next/navigation'
import DashNav from '@/app/components/shared/DashNav';
import { haalShiftMetIdCard } from '@/app/lib/actions/shift.actions';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from '@/app/components/ui/use-toast';


export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CheckoutCard({ params: { id }, searchParams }: SearchParamProps) {
    const router = useRouter();
    const { control } = useForm();
    const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T08:00'));
    const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T16:30'));
    const [checkout, setCheckout] = useState<any>(null);


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

    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                const data = await haalShiftMetIdCard(id);
                setCheckout(data);
            } catch (error) {
                console.error('Failed to fetch checkout data:', error);
            }
        };

        fetchCheckout();
    }, [id]);

    async function onSubmit(values: z.infer<typeof CheckoutValidation>) {
        try {
          const response = await vulCheckout({
                shiftId : id,
                rating: values.rating || 5,
                begintijd: values.begintijd || checkout?.begintijd,
                eindtijd: values.eindtijd || checkout?.eindtijd,
                pauze: values.pauze || checkout?.pauze,
                feedback: values.feedback || "",
                opmerking: values.opmerking || ""
            });
            if (response.success) {
              toast({
                variant: 'succes',
                description: "Checkout verstuurd! 👍"
              });
              router.back();
            } else {
              toast({
                variant: 'destructive',
                description: "Actie is niet toegestaan! ❌"
              });
            }
        } catch (error) {
            console.error('Failed to submit checkout:', error);
        }
    }

    if (!checkout) {
        return <div>Loading...</div>;
    }

  return (
    <>
     <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
    <DashNav />
    <Form {...form}>
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="fixed inset-0 mt-14 bg-black bg-opacity-25 backdrop-blur-lg flex justify-center items-center overflow-hidden w-auto px-4 md:px-0"
  >
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
      {/* Image & Title Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <Image
          className="object-cover rounded-lg w-16 h-16"
          src={checkout?.afbeelding || ''}
          alt="afbeelding"
          width={64}
          height={64}
        />
        <div>
          <p className="text-lg font-semibold text-gray-800">{checkout?.opdrachtgeverNaam || 'Opdrachtgever naam'}, {checkout?.shift?.functie || 'Functie'}</p>
          <p className="text-gray-500">{checkout?.opdrachtgever?.stad || 'Stad'}</p>
        </div>
      </div>

      {/* Date & Time Information */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>{checkout?.begindatum ? new Date(checkout.begindatum).toLocaleDateString() : 'Datum'}, {checkout?.begintijd || 'Begintijd'} - {checkout?.eindtijd || 'Eindtijd'}</span>
          <span>{checkout?.pauze || 0} minuten pauze</span>
        </div>
        <div className="text-gray-500 text-sm mt-1">
          <p>Uurtarief: €{checkout?.uurtarief || '14.00'} p/u</p>
        </div>
      </div>

      {/* Dropdown for Pauze */}
      <div className="mt-4">
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
              <div className="flex items-center h-12 rounded-full bg-gray-100 px-4 py-2">
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendar"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <TimePicker label="Begintijd" value={begintijd} onChange={(newValue) => setBegintijd(newValue)} />
              </div>
            </div>
          )}
        />
        <Controller
          control={control}
          name="eindtijd"
          render={({ field }) => (
            <div className="w-full">
              <div className="flex items-center h-12 rounded-full bg-gray-100 px-4 py-2">
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendar"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <TimePicker label="Eindtijd" value={eindtijd} onChange={(newValue) => setEindtijd(newValue)} />
              </div>
            </div>
          )}
        />
      </div>

      {/* Rating and Comments */}
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
      </div>
      <div className="my-4">
        <FormField
          control={form.control}
          name="opmerking"
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

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <Button className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100" onClick={() => router.back()}>
          Annuleren
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {form.formState.isSubmitting ? 'Checkout indienen...' : 'Indienen'}
        </Button>
      </div>
    </div>
  </form>
</Form>
    </LocalizationProvider>
    </>
  )
}
       