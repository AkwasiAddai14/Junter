"use client"


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { ShiftValidation } from "@/app/lib/validations/shift"
import * as z from 'zod'

import { Textarea } from "@/app/components/ui/textarea"
import { FileUploader } from "@/app/components/shared/FileUploader"
import { useEffect, useState } from "react"
import Image from "next/image"
import DatePicker from "react-datepicker";
import { useUploadThing } from '@/app/lib/uploadthing'

import dayjs, { Dayjs } from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox"
import { useRouter } from "next/navigation"
import { maakShift, updateShift } from "@/app/lib/actions/shift.actions"
import Shift, { ShiftType } from "@/app/lib/models/shift.model"
import Bedrijf from '@/app/lib/models/bedrijven.model';
import * as React from 'react';
import Dropdown from "../shared/Dropdown";
import { fetchBedrijfDetails } from "@/app/lib/actions/bedrijven.actions";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon } from '@radix-ui/react-icons';
const [checked, setChecked] = React.useState(true);
import ReactStars from 'react-stars'


type shiftFormProps = {
  userId: string
  type: "maak" | "update"
  shift?: ShiftType,
  shiftId?: string
}

const DefaultValues = {
  opdrachtgever: "",
  opdrachtnemers: "",
  afbeelding: "",
  titel: "",
  functie: "",
  uurtarief: 14,
  begindatum: new Date(),
  einddatum: new Date(),
  adres: "",
  begintijd: "",
  eindtijd: "",
  pauze: "",
  plekken: 1,
  beschrijving: "",
  vaardigheden: "",
  kledingsvoorschriften: "",
  beschikbaar: true,
  geplubliceerd: false,
  inFlexpool: false,
  flexpoolId: "",
  path: "",
};



const ShiftForm = ( { userId, type, shift, shiftId } : shiftFormProps) => {
  const { control } = useForm();
  const [files, setFiles] = useState<File[]>([]);
  const [begintijd, setBegintijd] = useState<Date | null>(dayjs('T15:30').toDate());
  const [eindtijd, setEindtijd] = useState<Date | null>(dayjs('T15:30').toDate());
  const [isInFlexpool, setIsInFlexpool] = useState(false);
  const [bedrijfDetails, setBedrijfDetails] = useState<any>(null);

  useEffect(() => {
    if (type === 'update' && shift) {
      fetchBedrijfDetails(shift.opdrachtgever.toString()).then(details => {
        setBedrijfDetails(details);
      }).catch(error => {
        console.error(error);
      });
    }
  }, [type, shift]);

  const initialValues = shift && type === 'update' 
    ? { 
      ...shift.toObject(),
      opdrachtgever: bedrijfDetails.bedrijvenID ?? "",
      afbeelding: bedrijfDetails.profielfoto ?? "",
      adres: `${bedrijfDetails.stad}, ${bedrijfDetails.straat} ${bedrijfDetails.huisnummer}` ?? "",
    begindatum: new Date(shift.begindatum),
    einddatum: new Date(shift.einddatum), 
    }
    : DefaultValues;
  const router = useRouter();

  const { startUpload } = useUploadThing('media')

  const form = useForm<z.infer<typeof ShiftValidation>>({
    resolver: zodResolver(ShiftValidation),
    defaultValues: initialValues,
  })

  /* useEffect(() => {
    if (shift && shift.inFlexpool) {
      setIsInFlexpool(shift.inFlexpool);
    }
  }, [shift]); */
 
  async function onSubmit(values: z.infer<typeof ShiftValidation>) {
    let uploadedImageUrl = values.afbeelding;

    if(files.length > 0) {
      const uploadedImages = await startUpload(files)

      if(!uploadedImages) {
        return
      }

      uploadedImageUrl = uploadedImages[0].url
    }

    if(type === 'maak') {
      try {
        const newshift = await maakShift(
          {
          opdrachtgever: bedrijfDetails.bedrijvenID,
          titel: values.titel,
          functie: values.functie,
          afbeelding: bedrijfDetails.profielfoto || values.afbeelding,
          uurtarief: values.uurtarief,
          plekken: values.plekken,
          adres: `${bedrijfDetails.stad}, ${bedrijfDetails.straat}, ${bedrijfDetails.huisnummer}` || values.adres,
          begindatum: values.begindatum,
          einddatum: values.einddatum,
          begintijd: values.begintijd,
          eindtijd: values.eindtijd,
          pauze: values.pauze,
          beschrijving: values.beschrijving,
          vaardigheden: values.vaardigheden ? values.vaardigheden.split(',') : [],
          kledingsvoorschriften: values.kledingsvoorschriften ? values.kledingsvoorschriften.split(',') : [],
          opdrachtnemers: [],
          flexpoolId: values.flexpoolId,
          path: '/dashboard'
        }
          )

        if(newshift) {
          form.reset();
          router.push(`/shift/${newshift._id}`)
        }
      } catch (error) {
        console.log(error);
      }
    }

    if(type === 'update') {
      if(!shiftId) {
        router.back()
        return;
      }

      try {
        const updatedshift = await updateShift({
          opdrachtgever: bedrijfDetails.bedrijvenID,
          titel: values.titel,
          functie: values.functie,
          afbeelding: bedrijfDetails.profielfoto || values.afbeelding,
          uurtarief: values.uurtarief,
          plekken: values.plekken,
          adres: `${bedrijfDetails.stad}, ${bedrijfDetails.straat}, ${bedrijfDetails.huisnummer}` || values.adres,
          begindatum: values.begindatum,
          einddatum: values.einddatum,
          begintijd: values.begintijd,
          eindtijd: values.eindtijd,
          pauze: values.pauze,
          beschrijving: values.beschrijving,
          vaardigheden: values.vaardigheden ? values.vaardigheden.split(',') : [],
          kledingsvoorschriften: ['Dress code'],
          opdrachtnemers: [],
          flexpoolId: values.flexpoolId,
          path: '/dashboard'
        })

        if(updatedshift) {
          form.reset();
          router.push(`/shift/${updatedshift._id}`)
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="titel"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="titel van de shift" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functie"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="bijv: Verzorgende IG, Heftruckchaufffeur" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="beschrijving"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <Textarea placeholder="Description" {...field} className="textarea rounded-2xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
              control={form.control}
              name="afbeelding"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <FileUploader 
                      onFieldChange={field.onChange}
                      imageUrl={field.value}
                      setFiles={setFiles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="pauze"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                <Dropdown onChangeHandler={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="adres"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/location-grey.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                      />

                      <Input placeholder="locatie" {...field} className="input-field" />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
              control={form.control}
              name="begindatum"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">Begindatum:</p>
                      <DatePicker 
                        selected={field.value} 
                        onChange={(date: Date | null) => field.onChange(date)} 
                        showTimeSelect
                        timeInputLabel="begintijd:"
                        dateFormat="dd/MM/yyyy hh:mm "
                        wrapperClassName="datePicker"
                      />
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        
          <FormField
              control={form.control}
              name="einddatum"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">Einddatum:</p>
                      <DatePicker 
                        selected={field.value} 
                        onChange={(date: Date | null) => field.onChange(date)} 
                        dateFormat="dd/MM/yyyy"
                        wrapperClassName="datePicker"
                      />
                    </div>

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
                    /* value={field.value ? dayjs(field.value).toDate() : null} */
                    onChange={(newValue: Date | null) => {
                      field.onChange(newValue ? dayjs(newValue).toISOString() : null);
                      setBegintijd(newValue);
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
                    /* value={field.value ? dayjs(field.value).toDate() : null} */
                    onChange={(newValue: Date | null) => {
                      field.onChange(newValue ? dayjs(newValue).toISOString() : null);
                      setEindtijd(newValue);
                    }}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="uurtarief"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <Input type="number" placeholder="uurtarief" {...field} className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </div>

                      </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              /> 
                      <FormField
              control={form.control}
              name="plekken"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <Input type="number" placeholder="Price" {...field} className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />  
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
            </div>  

            <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="vaardigheden"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="bijv: Nederlands, Engels, met 3 borden lopen, dienblad lopen, wijn presenteren, wijn inschenken, bestellingen opnemen" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kledingsvoorschriften"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="bijv: zwarte schoenen, zwarte broek/pantalon, wit overhemd" {...field} className="input-field" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>
        

        <div className="flex flex-col gap-5 md:flex-row"> 
          <FormField
            control={form.control}
            name="inFlexpool"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center">
                    <label htmlFor="Flexpool" className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      shift in de flexpool plaatsen
                    </label>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          field.onChange(checked);
                          setIsInFlexpool(checked);
                        }
                      }}
                      checked={field.value}
                      id="Flexpool"
                      className="mr-2 h-5 w-5 border-2 border-primary-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />  
          {isInFlexpool && (
            <FormField
              control={form.control}
              name="flexpoolId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger className="px-4 py-2 bg-gray-200 rounded">Select Flexpool</DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white shadow-lg">
                          {bedrijfDetails?.flexpools.map((flexpool: any) => (
                            <DropdownMenu.Item
                              key={flexpool._id}
                              onSelect={() => field.onChange(flexpool._id)}
                              className={`${field.value === flexpool._id ? 'bg-gray-200' : ''} px-4 py-2 cursor-pointer`}
                            >
                              {flexpool.name}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>


        <Button 
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? (
            'Submitting...'
          ): `${type} shift `}
          </Button>
      </form>
    </Form>
  )
}

export default ShiftForm;