import React from 'react'

const features = [
    {
        name: 'Snelle toegang tot opdrachten',
        description:
          'Vind in een oogwenk opdrachten die aansluiten bij jouw vaardigheden en interesses, zonder eindeloos te hoeven zoeken.',
      },
      {
        name: 'Flexibele planning',
        description:
        'Beheer jouw eigen agenda en werk wanneer het jou uitkomt, waardoor je jouw werk en privéleven beter in balans kunt brengen.',
      },
      {
        name: 'Diverse opdrachtgevers',
        description:
          'Krijg toegang tot een breed scala aan opdrachtgevers, van startups tot grote bedrijven, en vergroot zo jouw netwerk en ervaring.',
      },
      {
        name: 'Gemakkelijke communicatie',
        description:
          'Communiceer direct met ons via de app of WhatsApp, waardoor je snel vragen kunt stellen, feedback kunt geven en opdrachten kunt afronden.',
      },
      {
        name: 'Snelle betalingen',
        description:
          'Ontvang gegarandeerde betalingen voor jouw werk zonder gedoe of vertragingen.',
      },
      {
        name: 'Waardering en feedback',
        description:
          'Bouw een sterke reputatie op door positieve beoordelingen en feedback te verzamelen van tevreden opdrachtgevers, waardoor je jouw kansen op toekomstige opdrachten vergroot.',
      },
  ]

  const stats = [
      { label: 'verschillende opdrachtgevers', value: `Oplopend \n 100+`},
      { label: 'verschillende diensten', value: 'Wekelijks 2000' },
    { label: 'kun je ook kiezen voor wekelijkse betalingen', value: 'Vanaf Februari' },
  ]
const page = () => {
  return (
    <><div className="mx-auto  pt-40 mt-20 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Make Money Fast</h2>
        <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
            <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
                <p className="text-xl leading-8 text-gray-600">
                Download de app en meld je aan. Je kunt je registreren vanaf 16 jaar en werken als uitzendkracht. Vanaf 18 jaar is het toegestaan om als freelancer aan de slag te gaan. Nadat je je hebt aangemeld, kun je kiezen uit duizenden shifts in de app.
                </p>
                <div className="mt-10 max-w-xl text-base leading-7 text-gray-700">
                    <p>
                    Om je kansen op acceptatie te verbeteren, zorg ervoor dat je profiel compleet en professioneel is. Voeg een duidelijke profielfoto toe, vul al je gegevens nauwkeurig in, en beschrijf je vaardigheden en ervaring uitvoerig. Referenties van eerdere opdrachtgevers kunnen ook helpen. En dan kan je meteen aan de slag! 
                    </p>
                    <p className="mt-10">
                    Na het indienen van je gewerkte uren, ontvang je (voorlopig) aan het eind van de maand je betalingen. Vanaf Februari kun je ook voor wekelijkse betalingen kiezen.  Deze betalingen worden rechtstreeks naar je bankrekening overgemaakt. 
                    </p>
                </div>
            </div>
            <div className="lg:flex lg:flex-auto lg:justify-center">
                <dl className="w-64 space-y-8 xl:w-80">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col-reverse gap-y-4">
                            <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                            <dd className="text-5xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </div>
</div>

<div className="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
        <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
            alt=""
            className="aspect-[5/2] w-full object-cover xl:rounded-3xl" />
    </div><div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">All-in-one platform</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                Ontdek een wereld van mogelijkheden als werkzoekensde op ons platform. Van creatieve projecten tot zakelijke taken, 
                hier vind je jouw volgende succesverhaal. Word lid en maak je dromen werkelijkheid!
                </p>
            </div>
            <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                    <div key={feature.name}>
                        <dt className="font-semibold text-gray-900">{feature.name}</dt>
                        <dd className="mt-1 text-gray-600">{feature.description}</dd>
                    </div>
                ))}
            </dl>
        </div>
    </div></>
  )
}

export default page