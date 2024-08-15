"use client";

import { useState } from 'react';
import NavBar from "@/app/components/shared/NavBar";
import FreelancerForm from "@/app/components/forms/freelancergegevens";
import Footer from "@/app/components/shared/Footer4";
import OnboardingDialog from "@/app/components/shared/Onboarding";
import { useRouter } from 'next/navigation';
import { RedirectToCreateOrganization } from '@clerk/nextjs';
import BedrijfsForm from '@/app/components/forms/bedrijfsgegevens';

function Page() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(true);
  const [isFreelancer, setIsFreelancer] = useState(true);

  const handleFreelancerSelected = () => {
    setIsFreelancer(true);
    setShowDialog(false); // Close the dialog after user selection
  };

  const handleCompanySelected = () => {
    setIsFreelancer(false);
    setShowDialog(false); // Close the dialog after user selection
  };

  return (
    <>
      <NavBar />
      <main className="flex-grow">
        {showDialog && (
          <OnboardingDialog
            onFreelancerSelected={handleFreelancerSelected}
            onCompanySelected={handleCompanySelected}
          />
        )}

        {!showDialog && (
          isFreelancer ? (
            <FreelancerForm
              freelancer={{
                freelancerID: undefined,
                profielfoto: "",
                voornaam: "",
                tussenvoegsel: "",
                achternaam: "",
                geboortedatum: new Date("01/01/2000"),
                emailadres: "",
                straat: "",
                stad: "",
                telefoonnummer: "",
                korregeling: false,
                btwid: "",
                iban: "",
                path: ""
              }}
            />
          ) : (
          
            <BedrijfsForm bedrijven={{
              bedrijvenID: '',
              profielfoto: '',
              naam: '',
              displaynaam: '',
              kvknr: '',
              btwnr: '',
              postcode: '',
              huisnummer: '',
              telefoonnummer: '',
              emailadres: '',
              iban: '',
              path: ''
          }} />
          )
        )}
      </main>
      <Footer/>
    </>
  );
}
  {/* <RedirectToCreateOrganization/> */}
export default Page;

