"use client"

import { StarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { haalFreelancer } from '@/app/lib/actions/freelancer.actions';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/app/components/ui/use-toast';
import { blokkeerFreelancer } from '@/app/lib/actions/bedrijven.actions';



interface FreelancerProfielModalProps {
    isVisible: boolean;
    onClose: () => void;
    id: string;
  }

export default function freelancerProfielModal({isVisible, onClose, id} : FreelancerProfielModalProps) {
    if (!isVisible) return null;

    const [freelancer, setFreelancer] = useState<any>("");
    const { user } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
          try {
            const fetchedFreelancer = await haalFreelancer(id);
            setFreelancer(fetchedFreelancer);
          } catch (error) {
            console.error('Error fetching freelancer:', error);
          }
        })();
    }, []);

    console.log(freelancer, "freelancer")
   
  if (!freelancer ) {
    return (
      <div>freelasncer informatie niet beschikbaar...</div>
    )
  }

  interface idProps {
    freelancerId: string;
    bedrijfId: string;
    }
   
  const handleFreelancerBlokkade = async ({freelancerId, bedrijfId}: idProps) =>{
    setIsLoading(true);
    try {
        const response = await blokkeerFreelancer({freelancerId, bedrijfId});
        if(response.success){
            setTimeout(()=>{
                toast({
                    variant: 'succes',
                    description: "Een verzoek om freelancer te blokkeren ingediend! 👍"
                  });
               }, 3000) 
        } else {
            setTimeout(() => {
                toast({
                    variant: 'destructive',
                    description: "Verzoek niet verzonden, neem contact op! \n support@junter.works"
                  });
               }, 3000)
        }
       
    } catch (error: any) {
        console.error('Failed to submit checkout:', error);
    }
    setIsLoading(false);
  }



  const { voornaam, tussenvoegsel, achternaam, telefoonnummer, emailadres, bio, profielfoto } = freelancer;

  
    const calculateAge = (dateOfBirth: string | number | Date) => {
      // If dateOfBirth is a string in the format dd/MM/yyyy, parse it
      if (typeof dateOfBirth === 'string') {
        const [day, month, year] = dateOfBirth.split('/').map(Number);
        dateOfBirth = new Date(year, month - 1, day);
        console.log(dateOfBirth)
      }
    
      const diff = Date.now() - new Date(dateOfBirth).getTime();
      const age = new Date(diff).getUTCFullYear() - 1970;
      return age;
    };
  
    console.log(freelancer);

  return (

  <div  className="fixed inset-0 mt-14 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center overflow-hidden w-auto">
      <div className="lg:col-start-3 lg:row-end-1 max-w-lg w-full max-h-[90vh] overflow-y-auto"> {/* Added max height and overflow */}
        <h2 className="sr-only">Profiel</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <dl className="flex flex-wrap">
            <div className="flex-auto pl-6 pt-6">
              <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {freelancer && freelancer.voornaam ? `${freelancer.voornaam} ${freelancer.tussenvoegsel} ${freelancer.achternaam}` : `${voornaam} ${tussenvoegsel} ${achternaam}` || user?.fullName}  
                    </dd>
              <dt className="text-sm font-semibold leading-6 text-gray-900">{freelancer.stad}, {calculateAge(freelancer.geboortedatum)}</dt>
            </div>
            <div className="flex-none justify-center items-center self-end px-6 pt-4">
                  <Image
                    className="h-16 w-16 mb-4 rounded-full"
                    src={freelancer?.profielfoto || user?.imageUrl || profielfoto}
                    alt="profielfoto"
                    width={32}
                    height={32}
                  />
              <dt className="sr-only">rating</dt>
              <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {freelancer?.rating ?  freelancer?.rating.toFixed(2) : 5}
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
          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">Telefoonnumer  </span>
            <dd className="text-sm leading-6 text-gray-500">
              <p className="text-sm leading-6 text-gray-500">{freelancer?.telefoonnummer || telefoonnummer || "geen telefoonnummer"}</p>
            </dd>
          </div>

          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">Emaildres  </span>
            <dd className="text-sm leading-6 text-gray-500">
              <p className="text-sm leading-6 text-gray-500">{freelancer?.emailadres || emailadres || "geen emailadres"}</p>
            </dd>
          </div>

          <div className="mt-4 flex w-full flex-auto gap-x-4 px-6">
              <span className="text-sm font-semibold leading-6 text-gray-900">Bio  </span>
            <dd className="text-sm leading-6 text-gray-500">
            </dd>
            <Textarea className="rounded-2xl" >
            {freelancer?.bio || bio ||"Schrijf wat over jezelf.."}
            </Textarea>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Vaardigheden</h4>
            {freelancer.vaardigheden?.length > 0 ? (
              freelancer.vaardigheden.map((item: { vaardigheid: string }, index: number) => (
                <p key={index} className="text-gray-700">- {item.vaardigheid}</p>
              ))
            ) : (
              <p className="text-gray-500">Geen vaardigheden</p>
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Werkervaring</h4>
            {freelancer.werkervaring?.length > 0 ? (
              freelancer.werkervaring.map((experience: { bedrijf: string; functie: string; duur: string }, index: number) => (
                <div key={index} className="text-gray-700">
                  <p><span className="font-semibold">Bedrijf:</span> {experience.bedrijf}</p>
                  <p><span className="font-semibold">Functie:</span> {experience.functie}</p>
                  <p><span className="font-semibold">Duur:</span> {experience.duur}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Geen werkervaring</p>
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Opleidingen</h4>
            {freelancer.opleidingen?.length > 0 ? (
              freelancer.opleidingen.map((education: { naam: string; school: string; niveau?: string }, index: number) => (
                <div key={index} className="text-gray-700">
                  <p><span className="font-semibold">Naam:</span> {education.naam}</p>
                  <p><span className="font-semibold">School:</span> {education.school}</p>
                  {education.niveau && <p><span className="font-semibold">Niveau:</span> {education.niveau}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Geen opleidingen</p>
            )}
          </div>  
              </div>
                {/* Actions */}
                            <div className="border-t border-gray-900/5 px-6 py-6 flex justify-between">
                             <Button className="bg-white text-black border-2 border-black hover:text-white" onClick={() => onClose()}>
                                Sluiten
                             </Button>
            <Button 
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-red-500"
              onClick={() => { handleFreelancerBlokkade({freelancerId: freelancer.id, bedrijfId: user!.id}) }}
            >
              {isLoading ? 'Blokkeren...' : 'Blokkeren'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
       