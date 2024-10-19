import React from 'react'
import { CurrencyEuroIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline'
import dashboardLogo from '@/app/assets/images/logos/A sleek modern dashboard displayed on a computer screen in a compact office space.jpg'
import officeLogo from '@/app/assets/images/logos/A smaller office with people working very fast.jpg'
import euroBillsLogo from '@/app/assets/images/logos/Euro bills flying around in the air.jpg'
import Image from 'next/image'


const features = [
  {
    name: 'Reserves',
    description:
    'Bij klussen kunnen meer mensen worden aangenomen dan beschikbare plekken, waarbij extra personen als reserve worden opgenomen. Als een aangenomen persoon uitvalt, schuiven de reserves automatisch door naar beschikbare plekken.',
    href: '#',
    icon: UsersIcon,
  },
  {
    name: 'Flexpool',
    description:
    'Freelancers in de flexpool worden automatisch geaccepteerd voor de klussen waar zij op reageren. Dit betekent dat u freelancers waarmee u graag werkt vaker en sneller kunt oproepen.',
    href: '#',
    icon: UserGroupIcon,
  },
  {
    name: 'Competitve pricing',
    description:
      'Als een shift langere tijd onvervuld blijft, heeft u de mogelijkheid om het tarief van de shift automatisch te verhogen. Dit stelt u in staat om snel gekwalificeerde kandidaten aan te trekken en de bezetting van de shift te waarborgen.',
    href: '#',
    icon: CurrencyEuroIcon,
  },
  ]

  const bigfeatures = [
    {
      name: 'Kosten',
      description:
        'Door te kiezen voor ons platform, profiteer je van een transparant en eenvoudig kostenmodel, waarbij je alleen betaalt voor de daadwerkelijk gewerkte uren van de freelancers die je uitnodigt. Nodig onbeperkt freelancers uit voor een vast tarief van €16,50 per gewerkt uur per freelancer.',
      imageSrc: euroBillsLogo,
      imageAlt: 'Bills flying around.',
    },
    {
      name: 'Administratie',
      description:
        "Bij ons platform wordt vrijwel alle administratie voor je uit handen genomen, zodat jij je kunt focussen op wat echt belangrijk is. Ons team staat klaar om je te ondersteunen en ervoor te zorgen dat alles soepel verloopt, zodat je bedrijf efficiënt en probleemloos kan blijven draaien.",
      imageSrc: officeLogo,
      imageAlt: 'Save on administrstive work and leave it to us.',
    },
    {
      name: 'Dashboard',
      description:
        'Met het dashboard behoud je als bedrijf volledig overzicht over al je activiteiten. Het dashboard biedt je inzicht in geplaatste klussen, reacties op klussen, openstaande checkouts en facturen, en de status van je flexpools. Met het dashboard heb je alle essentiële informatie binnen handbereik.',
      imageSrc: dashboardLogo,
      imageAlt: 'Simple and easy, sleek and modern dashboard to have a great overview of your business.',
    },
  ]

const page = () => {
  return (
    <><div className="bg-white">
          <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-32 lg:px-4">
              <div className="mx-auto max-w-2xl px-4 lg:max-w-none">
                  <div className="max-w-3xl">
                      <h2 className="font-semibold text-gray-500">Junter voor bedrijven</h2>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Use it your way</p>
                      <p className="mt-4 text-gray-500">
                          Vind snel en gemakkelijk freelancers of uitzendkrachten voor een vast en vrijblijvend tarief
                      </p>
                  </div>

                  <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
                      {bigfeatures.map((feature) => (
                          <div
                              key={feature.name}
                              className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
                          >
                              <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4">
                                  <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                                  <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                              </div>
                              <div className="flex-auto lg:col-span-7 xl:col-span-8">
                                  <div className="aspect-h-2 aspect-w-5 overflow-hidden rounded-lg bg-gray-100">
                                      <Image src={feature.imageSrc} alt={feature.imageAlt} className="object-cover object-center" />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div><div className="bg-white py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="mx-auto max-w-2xl lg:mx-0">
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                          Stay on top
                      </h2>
                      <p className="mt-6 text-lg leading-8 text-gray-600">
                          Met deze handige functies heb je bijna geen omkijken naar de wat minder boeiende zaken.
                      </p>
                  </div>
                  <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                          {features.map((feature) => (
                              <div key={feature.name} className="flex flex-col">
                                  <dt className="text-base font-semibold leading-7 text-gray-900">
                                      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600">
                                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                      </div>
                                      {feature.name}
                                  </dt>
                                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                      <p className="flex-auto">{feature.description}</p>
                                  </dd>
                              </div>
                          ))}
                      </dl>
                  </div>
              </div>
          </div></>
  )
}

export default page