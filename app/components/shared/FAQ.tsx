import { Container } from '@/app/components/shared/Container.tsx'

const faqs = [
  [
    {
      question: 'Hoe kan ik me registreren als freelancer op het platform?',
      answer:
        'Gewoon via de website of download eenvoudigweg de app, doorloop het registratieproces en vul je profiel in met relevante informatie.',
    },
    {
      question: 'Welke soorten opdrachten zijn beschikbaar op het platform?',
      answer:
        'Van bediening in de horeca tot aan verkeersbegeleiding en staging op festivals of maaltijdbezorging, er is een diversiteit aan opdrachten beschikbaar om uit te kiezen.',
    },
    {
      question: 'Hoe werkt het proces van het vinden en accepteren van opdrachten?',
      answer:
        'Blader door beschikbare opdrachten, bekijk de details en solliciteer met een enkele klik. Het is snel en intuïtief.',
    },
  ],
  [
    {
      question: 'Hoe worden betalingen verwerkt voor de voltooide opdrachten?',
      answer:
        'Na voltooiing van een opdracht ontvang je voorlopig de laatste vrijdag van de maand jouw betaling, vanaf Februari elke vrijdag.',
    },
    {
      question: 'Is er ondersteuning beschikbaar als ik hulp nodig heb tijdens het gebruik van de app?',
      answer:
        'Ons team staat elke dag van 09:00 tot 17:00 voor je klaar via de app of WhatsApp om eventuele vragen of problemen op te lossen.',
    },
    {
      question: 'Zijn er beoordelingen of beoordelingen van opdrachtgevers beschikbaar voor de opdrachten?',
      answer:
        'Opdrachtgevers kunnen na voltooiing van de opdracht beoordelingen achterlaten, waardoor je reputatie wordt opgebouwd en verbeterd.',
    },
  ],
  [
    {
      question: 'Kan ik mijn eigen tarieven instellen voor de aangeboden diensten?',
      answer:
        'Als freelancer heb je de vrijheid om je eigen tarieven in te stellen op basis van je ervaring en de marktstandaarden.',
    },
    {
      question: 'Hoe kan ik mijn profiel optimaliseren om meer opdrachten te krijgen?',
      answer:
        'Optimaliseer je profiel door vaardigheden en werkervaring toe te voegen om meer opdrachten aan te trekken.',
    },
    {
      question: 'Zijn er bepaalde vereisten waaraan ik moet voldoen om opdrachten te kunnen aannemen via het platform?',
      answer:
        'In de meeste gevallen heb je minimale ervaring of vaardigheden nodig die relevant zijn voor de opdracht die je wilt aannemen.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faqs"
      aria-labelledby="faqs-title"
      className="border-t border-gray-200 py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faqs-title"
            className="text-3xl font-medium tracking-tight text-gray-900"
          >
            De meestgestelde vragen
          </h2>
          <p className="mt-2 text-lg text-gray-600">
          Nog meer vragen?{' '}
            <a
              href="mailto:info@example.com"
              className="text-gray-900 underline"
            >
              Neem gerust contact op
            </a>
            .
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="space-y-10">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-gray-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
