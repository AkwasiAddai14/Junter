"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Example() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [agreed, setAgreed] = useState(true);
  const [isBedrijf, setIsBedrijf] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "allesvoorje",
    email: "",
    phoneNumber: "",
    message: "",
  });

  // Handle user type and determine if it's a bedrijf
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("./sign-in");
      console.log("Niet ingelogd");
      return;
    }

    const userType = user?.organizationMemberships.length ?? 0;
    setIsBedrijf(userType >= 1);
  }, [isLoaded, isSignedIn, router, user]);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the privacy policy before submitting.");
      return;
    }
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Bericht verstuurd!");
        setFormData({
          firstName: "",
          lastName: "",
          company: "",
          email: "",
          phoneNumber: "",
          message: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to send email: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again later.");
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative isolate bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Content Section */}
        <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Identiteit verifiëren
            </h2>
            {isBedrijf ? (
              <p className="mt-10 gap-y-4 text-lg/8 text-gray-600">
                Bedankt voor het invullen van het registratieformulier. Om uw bedrijf te verifiëren, hebben we de
                volgende documenten nodig:
                <ul className="list-disc pl-6 mt-10">
                  <li>
                    Een geldig legitimatiebewijs (paspoort, ID-kaart of rijbewijs) van de contactpersoon.
                  </li>
                  <li>
                    Een document dat het opgegeven adres bevestigt, zoals een officiële brief met adres en KVK-nummer.
                  </li>
                </ul>
                 <div className="mt-10">
                Stuur de documenten naar {" "}
                </div>
                <strong>
                  <a href="mailto:onboarding@junter.works" className="hover:text-gray-900">
                  onboarding@junter.works
                  </a>
                </strong>{" "}
                met de volgende informatie:
                <ul className="list-disc pl-6 mt-7">
                  <li>Voor- en achternaam van de contactpersoon</li>
                  <li>Bedrijfsnaam</li>
                  <li>KVK-nummer</li>
                </ul>
                <div className="mt-10">
                Wij nemen zo snel mogelijk contact met u op na ontvangst van de documenten.
                </div>
              </p>
            ) : (
              <p className="mt-10 text-lg/8 text-gray-600">
                Bedankt voor het invullen van het registratieformulier. Om jouw profiel als freelancer te verifiëren,
                hebben we de volgende documenten nodig:
                <ul className="list-disc pl-6 mt-4">
                  <li>Een geldig legitimatiebewijs (paspoort, ID-kaart of rijbewijs).</li>
                  <li>Een foto van uw bankpas met het bijbehorende IBAN.</li>
                  <li>
                    Een document dat uw opgegeven adres bevestigt, zoals een bewijs van inschrijving op dat adres.
                  </li>
                </ul>
                <div className="mt-10">
                Stuur de documenten naar
                </div>
                <strong>
                  <a href="mailto:onboarding@junter.works" className="hover:text-gray-900">
                    onboarding@junter.works 
                  </a>
                </strong>
                {" "}
                met de volgende informatie:
                <ul className="list-disc pl-6 mt-7">
                  <li>Voor- en achternaam</li>
                  <li>Geboortedatum</li>
                  <li>Postcode en huisnummer</li>
                </ul>
                <div className="mt-10">
                Wij nemen zo snel mogelijk contact met u op na ontvangst van de documenten.
                </div>
              </p>
            )}
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
        <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm/6 font-semibold text-gray-900">
                  Voornaam
                </label>
                <div className="mt-2.5">
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm/6 font-semibold text-gray-900">
                  Achternaam
                </label>
                <div className="mt-2.5">
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone-number" className="block text-sm/6 font-semibold text-gray-900">
                  Telefoonnummer
                </label>
                <div className="mt-2.5">
                  <input
                    id="phone-number"
                    name="phone-number"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm/6 font-semibold text-gray-900">
                  Bericht
                </label>
                <div className="mt-2.5">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm/6"
                    value={formData.message}
                    onChange={handleChange}
                    defaultValue={''}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-sky-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Verstuur bericht
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

