"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/app/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { ShiftValidation } from "@/app/lib/validations/shift";
import * as z from "zod";
import { Textarea } from "@/app/components/ui/textarea";
import { FileUploader } from "@/app/components/shared/FileUploader";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useUploadThing } from "@/app/lib/uploadthing";
import dayjs, { Dayjs } from "dayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { maakShift, updateShift } from "@/app/lib/actions/shift.actions";
import Shift, { ShiftType } from "@/app/lib/models/shift.model";
import * as React from "react";
import Dropdown from "../shared/Dropdown";
import DropdownPauze from "../shared/DropdownPauze";
import { fetchBedrijfByClerkId, fetchBedrijfDetails } from "@/app/lib/actions/bedrijven.actions";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/nl';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { IFlexpool } from "@/app/lib/models/flexpool.model";
import { haalFlexpools } from "@/app/lib/actions/flexpool.actions";


type ShiftFormProps = {
  userId: string;
  type: "maak" | "update";
  shift?: ShiftType;
  shiftId?: string;
};

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
  begintijd: "08:00",  // Ensure initial state is passed as default
  eindtijd: "16:30",
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
  shiftArrayId: "",
  checkoutbegintijd:"",
    checkouteindtijd: "",
    checkoutpauze:"",
    feedback:"",
    opmerking:"",
    ratingFreelancer: "",
    ratingBedrijf: "",
};

const ShiftForm = ({ userId, type, shift, shiftId }: ShiftFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [begintijd, setBegintijd] = useState<Dayjs | null>(dayjs('2022-04-17T08:00'));
  const [eindtijd, setEindtijd] = useState<Dayjs | null>(dayjs('2022-04-17T16:30'));
  const [flexpools, setFlexpools] = useState<IFlexpool[]>([]);
  const [isInFlexpool, setIsInFlexpool] = useState(false);
  const [bedrijfDetails, setBedrijfDetails] = useState<any>(null);
  const router = useRouter();
  const { startUpload } = useUploadThing("media");
  
  
  useEffect(() => {
    fetchBedrijfDetails(userId)
      .then((details) => {
        setBedrijfDetails(details);
        console.log("Bedrijf retrieved.");
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userId, type, shift]);

  useEffect(() => {
    const getFlexpools = async () => {
      if (bedrijfDetails && bedrijfDetails._id) {
        try {
          const fetchedFlexpools = await haalFlexpools(bedrijfDetails._id);
          setFlexpools(fetchedFlexpools);
        } catch (error) {
          console.error("Error fetching flexpools:", error);
        }
      }
    };

    getFlexpools();
  }, [bedrijfDetails]);

  

  const initialValues =
    shift && type === "update"
      ? {
          ...shift.toObject(),
          opdrachtgever: bedrijfDetails?._id ?? "",
          afbeelding: bedrijfDetails?.profielfoto ?? "",
          adres: `${bedrijfDetails?.stad}, ${bedrijfDetails?.straat} ${bedrijfDetails?.huisnummer}` ?? "",
          begindatum: new Date(shift.begindatum),
          einddatum: new Date(shift.einddatum),
        }
      : DefaultValues;

  const form = useForm<z.infer<typeof ShiftValidation>>({
    resolver: zodResolver(ShiftValidation),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof ShiftValidation>) {
    let uploadedImageUrl = values.afbeelding;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (!uploadedImages) {
        return;
      }

      uploadedImageUrl = uploadedImages[0].url;
    }
    console.log(values, userId)
    if (type === "maak") {
      try {
        const newShift = await maakShift({
          opdrachtgever: bedrijfDetails._id,
          titel: values.titel,
          functie: values.functie,
          afbeelding: values.afbeelding,
          uurtarief: Number(values.uurtarief),
          plekken: Number(values.plekken), // Convert to number
          adres:  `${bedrijfDetails.straat} ${bedrijfDetails.huisnummer}, ${bedrijfDetails.stad}` || values.adres,
          begindatum: values.begindatum,
          einddatum: values.einddatum,
          begintijd: values.begintijd,
          eindtijd: values.eindtijd,
          pauze: values.pauze,
          beschrijving: values.beschrijving,
          vaardigheden: values.vaardigheden ? values.vaardigheden.split(", ") : [],
          kledingsvoorschriften: values.kledingsvoorschriften ? values.kledingsvoorschriften.split(", ") : [],
          opdrachtnemers: [],
          flexpoolId: values.flexpoolId,
          path: "/dashboard",
          status: "beschikbaar",
          checkoutbegintijd:  "00:00",  // Provide a default time if not available
          checkouteindtijd:  "00:00",  
          checkoutpauze: "",
          feedback: "",
          opmerking: "",
          shiftArrayId: "0000",
          ratingFreelancer: 5,
          ratingBedrijf: 5,
        });

        if (newShift) {
          form.reset();
          router.back();
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === "update") {
      if (!shiftId) {
        router.back();
        return;
      }

      try {
        const updatedShift = await updateShift({
          opdrachtgever: bedrijfDetails._id,
          titel: values.titel,
          functie: values.functie,
          afbeelding: bedrijfDetails.profielfoto || values.afbeelding,
          uurtarief: values.uurtarief,
          plekken: Number(values.plekken), // Convert to number
          adres: `${bedrijfDetails.stad}, ${bedrijfDetails.straat}, ${bedrijfDetails.huisnummer}` || values.adres,
          begindatum: values.begindatum,
          einddatum: values.einddatum,
          begintijd: values.begintijd,
          eindtijd: values.eindtijd,
          pauze: values.pauze,
          beschrijving: values.beschrijving,
          vaardigheden: values.vaardigheden ? values.vaardigheden.split(",") : [],
          kledingsvoorschriften: ["Dress code"],
          opdrachtnemers: [],
          flexpoolId: values.flexpoolId,
          path: "/dashboard",
          status: "beschikbaar",
          checkoutbegintijd: "",
          checkouteindtijd: "",
          checkoutpauze: "",
          feedback: "",
          opmerking: "",
          shiftArrayId: "0000",
          ratingFreelancer: 5,
          ratingBedrijf: 5,
        });

        if (updatedShift) {
          form.reset();
          router.push(`/shift/${updatedShift._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const adres = bedrijfDetails
  ? `${bedrijfDetails.straat || ""} ${bedrijfDetails.huisnummer || ""}, ${bedrijfDetails.stad || ""}`
  : "locatie";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="titel"
            render={({ field }) => (
              <FormItem className="w-full">
                 <FormLabel className="justify-end font-semibold">Titel</FormLabel>
                <FormControl>
                  <Input placeholder="enthousiaste horecatoppers gezocht" {...field} className="input-field" />
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
                <FormLabel>Categorie</FormLabel>
                <FormControl>
                  <Input placeholder="Bediening" {...field} className="input-field" />
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
                  <Textarea placeholder="beschrijving" {...field} className="textarea rounded-2xl" />
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
                  <FileUploader onFieldChange={field.onChange} imageUrl={field.value} setFiles={setFiles} />
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
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                  </svg>
                    <Input placeholder={adres ? adres : "locatie" } {...field} className="input-field" />
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
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                  </svg>
                    <p className="whitespace-nowrap text-grey-600">Begindatum:</p>
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

          <FormField
            control={form.control}
            name="einddatum"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                  </svg>

                    <p className="whitespace-nowrap text-grey-600">Einddatum:</p>
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
  control={form.control}
  name="begintijd"
  render={({ field }) => (
    <div className="w-full">
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
  )}
/>

          <Controller
            control={form.control}
            name="eindtijd"
            render={({ field }) => (
              <div className="w-full">
                <div className="">
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
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="pauze"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Pauze</FormLabel>
                <FormControl>
                <div className="flex-center  h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-3">
                <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
               </svg>
               <DropdownPauze onChangeHandler={field.onChange} value={field.value} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="uurtarief"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>uurtarief</FormLabel>
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-3">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.902 7.098a3.75 3.75 0 0 1 3.903-.884.75.75 0 1 0 .498-1.415A5.25 5.25 0 0 0 8.005 9.75H7.5a.75.75 0 0 0 0 1.5h.054a5.281 5.281 0 0 0 0 1.5H7.5a.75.75 0 0 0 0 1.5h.505a5.25 5.25 0 0 0 6.494 2.701.75.75 0 1 0-.498-1.415 3.75 3.75 0 0 1-4.252-1.286h3.001a.75.75 0 0 0 0-1.5H9.075a3.77 3.77 0 0 1 0-1.5h3.675a.75.75 0 0 0 0-1.5h-3c.105-.14.221-.274.348-.402Z" clipRule="evenodd" />
                  </svg>
                    <Input
                      type="number"
                      placeholder="uurtarief"
                      {...field}
                      className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                <FormLabel>Plekken</FormLabel>
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-3">
                  <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                  </svg>
                    <Input
                      type="number"
                      placeholder="Plekken"
                      {...field}
                      className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
              <FormItem className="w-full justify-end">
                 <FormLabel className="justify-end font-semibold">Vaardigheden </FormLabel>
                <FormControl>
                  <Input
                    placeholder="nederlands, engels, met 3 borden lopen, dienblad lopen, wijn presenteren, wijn inschenken, bestellingen opnemen"
                    {...field}
                    className="input-field"
                  />
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
                <FormLabel>Kledingsvoorschriften </FormLabel>
                <FormControl>
                  <Input
                    placeholder="zwarte schoenen, zwarte broek/pantalon, wit overhemd"
                    {...field}
                    className="input-field"
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
                        if (typeof checked === "boolean") {
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
                  <Dropdown
                    onChangeHandler={field.onChange}
                    value={field.value}
                    flexpoolsList={ bedrijfDetails?.flexpools || flexpools } // Pass an array of objects
                    userId={userId}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="button col-span-2 w-full">
          {form.formState.isSubmitting ? "Shift plaatsen..." : `${type} shift `}
        </Button>
      </form>
    </Form>
    </LocalizationProvider>
  )
}

export default ShiftForm;
