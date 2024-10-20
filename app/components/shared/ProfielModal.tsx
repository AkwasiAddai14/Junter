"use client"


import { StarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { haalFreelancer, updateFreelancer } from '@/app/lib/actions/freelancer.actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/ui/form";
import { useForm } from 'react-hook-form';
import { ProfielValidation } from "@/app/lib/validations/profiel";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/app/components/ui/use-toast';
import { useUploadThing } from "@/app/lib/uploadthing";
import { FileUploader } from './FileUploader';
import  browser  from '@/app/assets/images/browser.png';




export default function ProfielModal({isVisible, onClose} : {isVisible: boolean, onClose: any}) {
    if (!isVisible) return null;
    const [open, setOpen] = useState(false);
    const [freelancer, setFreelancer] = useState<any>(null);
    const { isLoaded, user } = useUser();
    const { toast } = useToast();
    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing("media");

    useEffect(() => {
      if (isLoaded && user) {
        (async () => {
          try {
            const fetchedFreelancer = await haalFreelancer(user.id);
            setFreelancer(fetchedFreelancer);
          } catch (error) {
            console.error('Error fetching freelancer:', error);
          }
        })();
      }
    }, [isLoaded, user]);

   
  if (!user /* || !freelancer */) {
    return null; {/* <div>Gebruiker informatie niet beschikbaar...</div>; */}
  }

  const DefaultValues = {
    telefoonnummer: freelancer?.telefoonnummer || "",
    emailadres: freelancer?.emailadres || "",
    kvknr: freelancer?.kvknr || "",
    btwid: freelancer?.btwid || "",
    iban: freelancer?.iban || "",
    bio: freelancer?.bio || "",
    profielfoto: freelancer.profielfoto || "",
  };

    const form = useForm<z.infer<typeof ProfielValidation>>({
      resolver: zodResolver(ProfielValidation),
      defaultValues: DefaultValues,
    })

    async function onSubmit(values: z.infer<typeof ProfielValidation>) {

      let uploadedImageUrl = values.profielfoto;

// Check if there are files to upload
if (files.length > 0) {
  try {
    // Start the upload and wait for the response
    const uploadedImages = await startUpload(files);

    // Check if the upload was successful
    if (!uploadedImages || uploadedImages.length === 0) {
      console.error('Failed to upload images');
      return;
    }

    // Use the URL provided by the upload service
    uploadedImageUrl = uploadedImages[0].url;
    console.log("Final URL:", uploadedImageUrl);
  } catch (error) {
    console.error('Error uploading image:', error);
    return;
  }
}

      try {

        const { voornaam, tussenvoegsel, achternaam, geboortedatum, postcode, huisnummer, straat, stad, kvknr, path, werkervaring, vaardigheden, opleidingen, profielfoto } = freelancer;
        const { emailadres, telefoonnummer, btwid, iban, bio } = values || {};

const updateInformatie = await updateFreelancer({
    clerkId: user!.id,
    voornaam,
    tussenvoegsel,
    achternaam,
    geboortedatum,
    emailadres: emailadres || freelancer.emailadres || "emailadres",
    telefoonnummer: telefoonnummer || freelancer.telefoonnummer || "telefoonnummer",
    postcode,
    huisnummer,
    straat,
    stad,
    korregeling: false,
    btwid: btwid || freelancer.btwid || "btwid",
    iban: iban || freelancer.iban || "iban",
    path,
    kvk: kvknr,
    bio: bio || freelancer.bio,
    profielfoto: profielfoto || user!.imageUrl || browser || "profielfoto",
    werkervaring,
    vaardigheden,
    opleidingen,
    onboarded: true
});

      if (updateInformatie.success) {
        setTimeout(() => {
          toast({
            variant: 'succes', // Ensure you use 'success' (correct spelling)
            description: "Informatie succesvol geupdate! 👍"
          });
        }, 1500); // Corrected the syntax for setTimeout
        onClose()
      }

      } catch (error: any){
        toast({
          variant: 'destructive',
          description: `Actie is niet toegestaan!\n${error}\n❌`
        });
        console.log(error)
      }
    }
  
    console.log(freelancer);

  return (
    <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="fixed inset-0 mt-14 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
      <div className="lg:col-start-3 lg:row-end-1 max-w-lg w-full max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
        <h2 className="sr-only">Profiel</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <dl className="flex flex-wrap">
            <div className="flex-auto pl-6 pt-6">
              <dt className="text-sm font-semibold leading-6 text-gray-900">{user.fullName}</dt>
              <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">{freelancer?.stad} {freelancer?.leeftijd}</dd>
            </div>
            <div className="flex-none justify-center items-center self-end px-6 pt-4">
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={freelancer?.profielfoto || user?.imageUrl}
                    alt="profielfoto"
                    width={32}
                    height={32}
                    onClick={() => setOpen(true)}
                  />
{open && (
  <FormField
    control={form.control}
    name="profielfoto"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormControl className="h-72">
          <FileUploader
            onFieldChange={field.onChange}
            imageUrl={field.value as string}
            setFiles={setFiles}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

              <dt className="sr-only">rating</dt>
              <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {freelancer?.rating.toFixed(2) || "nog geen rating"}
                <StarIcon aria-hidden="true" className="h-4 w-5 text-gray-400" />
              </dd>
            </div>
          </dl>
          <dl className="flex flex-wrap border-b  border-gray-900/5 px-6 pb-6">
          <div className="mt-6 flex w-full flex-auto gap-x-4  border-t border-gray-900/5 px-6 pt-6">
              <p className="text-sm font-semibold leading-6 text-gray-900">{freelancer?.shiftsCount || "0"} </p>
            <dd className="text-sm leading-6 text-gray-500">Shifts gewerkt</dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">{freelancer?.percentageAanwezig || 100} %</span>
            <dd className="text-sm leading-6 text-gray-500">
              <p className="text-sm leading-6 text-gray-500">Aanwezig</p>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <p className="text-sm font-semibold leading-6 text-gray-900">{freelancer?.percentageOptijd || 100} %</p>
            <dd className="text-sm leading-6 text-gray-500">Op tijd</dd>
          </div>
        </dl>

          {/* Additional Fields */}
          <div className="px-6 py-4 space-y-4">
            <FormField
              control={form.control}
              name="kvk"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={freelancer?.kvknr || "geen KVK-nummer"} {...field} className="input-field" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Repeat other FormFields similarly */}
            <FormField
                            control={form.control}
                            name="btwid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder={freelancer?.btwid || "geen BTW-ID"} {...field} className="input-field" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder={freelancer?.iban || "geen IBAN"} {...field} className="input-field" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="telefoonnummer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder={freelancer?.telefoonnummer || "geen telefoonnummer"} {...field} className="input-field" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emailadres"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder={freelancer?.emailadres || "geen emailadres"} {...field} className="input-field" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder={freelancer?.bio || "Schrijf wat over jezelf.."} {...field} className="rounded-2xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
          </div>

          {/* Actions */}
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
              {form.formState.isSubmitting ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </form>
</Form>


  )
}
       