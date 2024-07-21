"use client";

import { useState } from 'react';
import NavBar from "@/app/components/shared/NavBar";
import FreelancerForm from "@/app/components/forms/freelancergegevens";
import Footer from "@/app/components/shared/Footer4";
import OnboardingDialog from "@/app/components/shared/Onboarding";
import BedrijfsForm from "@/app/components/forms/bedrijfsgegevens";

function Page() {
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
                achternaam: "",
                geboortedatum: "",
                emailadres: "",
                telefoonnummer: "",
                korregeling: false,
                btwid: "",
                iban: "",
                path: ""
              }}
            />
          ) : (
            <BedrijfsForm
              bedrijven={{
                bedrijvenID: "",
                profielfoto: "",
                naam: "",
                kvknr: "",
                btwnr: "",
                postcode: "",
                huisnummer: "",
                telefoonnummer: "",
                emailadres: "",
                iban: "",
                path: ""
              }}
            />
          )
        )}
      </main>
      {/*<Footer/>*/}
    </>
  );
}

export default Page;

