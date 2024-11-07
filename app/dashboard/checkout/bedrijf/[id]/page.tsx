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
import { accepteerCheckout, haalcheckout, noShowCheckout, weigerCheckout, } from '@/app/lib/actions/checkout.actions';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from 'dayjs';
import ReactStars from "react-rating-stars-component";
import DropdownPauze from '@/app/components/shared/DropdownPauze';
import { useRouter } from 'next/navigation';
import DashNav from '@/app/components/shared/DashNav';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { haalFreelancer } from '@/app/lib/actions/freelancer.actions';
import { StarIcon } from '@heroicons/react/24/outline';
import { toast } from '@/app/components/ui/use-toast';

export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Checkoutgegevens({ params: { id }, searchParams }: SearchParamProps) {
    const router = useRouter()
    const { control } = useForm();
    const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T16:30'));
    const [checkout, setCheckout] = useState<any>(null);
    const [freelancer, setFreelancer] = useState<any>(null);
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

  useEffect(() => {
    const fetchCheckout = async () => {
        try {
            const data = await haalFreelancer(checkout.opdrachtnemer);
            setFreelancer(data);
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
      if(accepteer){
        try {
          const response = await accepteerCheckout(
            {
              shiftId: id, 
              rating: values.rating,
              feedback: values.feedback
            }
          )
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
    } else {
      try{
        const response = await weigerCheckout(
          {
            shiftId: id, 
            rating: values.rating || 5,
            begintijd: values.begintijd || checkout?.begintijd,
            eindtijd: values.eindtijd || checkout?.eindtijd,
            pauze: values.pauze.toString() || checkout?.pauze.toString(),
            feedback: values.feedback || " ",
            opmerking: values.opmerking || " "
          }
        )
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
    router.back();
  }
 console.log(freelancer, checkout);
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
          src={ "https://utfs.io/f/72e72065-b298-4ffd-b1a2-4d12b06230c9-n2dnlw.webp"}
          alt="profielfoto"
          width={64}
          height={64}
        />
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-800">{"freelancer.voornaam"} {"freelancer.achternaam"}</p>
          <p className="text-gray-500">Ratings: {"freelancer.ratingCount"} Shifts voltooid</p>
          <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {freelancer?.rating ?  freelancer?.rating.toFixed(1) : 5}
                <StarIcon aria-hidden="true" className="h-4 w-5 text-gray-400" />
          </dd>
        </div>
      </div>

      {/* Date and Time Information */}
      <div className="my-4">
        <p className="text-sm font-semibold leading-6 text-gray-900">{"checkout.begindatum"}, {"checkout.begintijd"} - {"checkout.eindtijd"}</p>
        <p className="text-gray-500 text-sm mt-1">{"checkout.pauze"} minuten pauze</p>
        <p className="text-gray-500 text-sm mt-1">Uurtarief: €{"checkout.uurtarief"} p/u</p>
      </div>

      <div className="my-4">
        <p className="text-sm font-semibold leading-6 text-gray-900">{/* checkout.begindatum */}, {'checkout.checkoutbegintijd'} - {/* checkout.checkouteindtijd */}</p>
        <p className="text-gray-500 text-sm mt-1">{/* checkout.checkoutpauze */} minuten pauze</p>
        <p className="text-gray-500 text-sm mt-1">Uurtarief: €{/* checkout.uurtarief */} p/u</p>
      </div>

      {/* Conditional Form Fields */}
      {!accepteer && (
        <>
          <div className="flex flex-col gap-5 md:flex-row">
                  <Controller
                    control={form.control}
                    name="begintijd"
                    render={({ field }) => (
                      <div className="w-full">
                        <TimePicker
                          label="Begintijd"
                          value={checkout ? dayjs(checkout.begintijd) : begintijd}
                          onChange={(newValue) => {
                            console.log("Selected Time:", newValue ? newValue.format("HH:mm") : "08:00");
                            const formattedTime = newValue ? newValue.format("HH:mm") : "08:00";
                            setBegintijd(newValue);
                            field.onChange(formattedTime);
                          }}
                        />
                      </div>
                    )}
                  />
    
                  <Controller
                    control={form.control}
                    name="eindtijd"
                    render={({ field }) => (
                      <div className="w-full">
                        <TimePicker
                          label="Eindtijd"
                          value={checkout ? dayjs(checkout.eindtijd) : eindtijd}
                          onChange={(newValue) => {
                            console.log("Selected Time:", newValue ? newValue.format("HH:mm") : "16:00");
                            const formattedTime = newValue ? newValue.format("HH:mm") : "16:00";
                            setEindtijd(newValue);
                            field.onChange(formattedTime);
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
    
                {/* Centered Dropdown for Pauze */}
                <div className="w-full my-12 mx-48 text-center">
                  <FormField
                    control={form.control}
                    name="pauze"
                    render={({ field }) => (
                      <FormItem className="mx-auto">
                        <FormControl>
                          <DropdownPauze onChangeHandler={field.onChange} value={field.value} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                </>
                )}

              {/* Rating, Feedback, and Actions */}
                {/* Centered Rating Field */}
                <div className="justify-center w-full my-8 mx-36 text-center">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem className="w-full mx-auto">
                        <FormControl>
                          <ReactStars count={5} size={56} isHalf={true} activeColor="#ffd700" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
          n6

    <div className="my-4">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder="feedback" {...field} className="textarea rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-4 mt-6">
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
          {form.formState.isSubmitting ? 'Checkout indienen...' : accepteer ? 'Accepteren' : 'Versturen'}
        </Button>
      </div>
  </div>
  </form>
</Form>
    </LocalizationProvider>
    </>
  )
}

       