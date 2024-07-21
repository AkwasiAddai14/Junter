

import Image from 'next/image';
import george from '@/app/assets/images/cc66434b-da39-4066-8f3a-035ae5a804fb.jpg';
import lisa from '@/app/assets/images/IMG_8347.jpg';
import ahmed from '@/app/assets/images/IMG_8348.jpg';
import sarah from '@/app/assets/images/IMG_8349.jpg';
import emma from '@/app/assets/images/IMG_8351.jpg';
import mariah from '@/app/assets/images/IMG_8352.jpg';


const testimonials = [
    {
      body: 'Geweldige app voor horecawerk! Ik vind snel shifts bij toffe restuarants die bij mijn schema passen. Superhandig!',
      author: {
        name: 'Lisa D',
        handle: 'Horeca',
        imageUrl:
          ahmed,
      },
    },
    {
      body: 'Dit platform heeft mijn zoektocht naar transportwerk vereenvoudigd. Betrouwbaar en efficiënt!',
      author: {
        name: 'George A',
        handle: 'Logistiek & Transport',
        imageUrl:
          george,
      },
    },
    {
      body: 'Als beveiligingsprofessional waardeer ik de snelle toegang tot relevante opdrachten. Topapp!',
      author: {
        name: 'Ahmed S',
        handle: 'Beveiliging',
        imageUrl:
          lisa,
      },
    },
    {
      body: 'Als zorgverlener waardeer ik de flexibiliteit van deze app. Het helpt me om passende zorgopdrachten te vinden.',
      author: {
        name: 'Sarah H',
        handle: 'Zorg',
        imageUrl:
          sarah,
      },
    },
    {
      body: 'Ik hou van de eenvoud van deze app! Het heeft mijn zoektocht naar schoonmaakklussen zo veel gemakkelijker gemaakt.',
      author: {
        name: 'Maria P',
        handle: 'Schoonmaak',
        imageUrl:
           mariah,
      },
    },
    {
      body: 'Deze app heeft mijn freelance-administratiewerk naar een hoger niveau getild. Efficiënt en gebruiksvriendelijk!',
      author: {
        name: 'Solomon B',
        handle: 'Administratie',
        imageUrl:
          emma,
      },
    },
  ]
  
  export default function Example() {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-sky-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ontdek wat onze gebruikers te zeggen hebben
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.author.handle} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                  <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                    <blockquote className="text-gray-900">
                      <p>{`“${testimonial.body}”`}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <Image className="h-10 w-10 rounded-full bg-gray-50" src={testimonial.author.imageUrl} alt="testimonial" width={32} />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                        <div className="text-gray-600">{`${testimonial.author.handle}`}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  