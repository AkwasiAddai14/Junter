import AanmeldButton from '@/app/components/shared/AanmeldButton';
import { AanmeldingenSectie } from '@/app/components/shared/AanmeldingenSectie';
import Collection from '@/app/components/shared/Collection';
import { haalShiftMetId, haalGerelateerdShiftsMetCategorie } from '@/app/lib/actions/shift.actions'
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export type SearchParamProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const shiftDetails = async ({ params: { id }, searchParams }: SearchParamProps) => {
  const shift = await haalShiftMetId(id);
  const { user } = useUser();
  
  const relatedEvents = await haalGerelateerdShiftsMetCategorie({
    categoryId: shift.categorie._id,
    shiftId: shift._id,
    page: searchParams.page as string,
  })

  const isOpdrachtgever = user && user.id === shift.opdrachtgever._id;

  

  return (
    <>
    <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
        <Image 
          src={shift.afbeelding}
          alt="hero image"
          width={1000}
          height={1000}
          className="h-full min-h-[300px] object-cover object-center"
        />

        <div className="flex w-full flex-col gap-8 p-5 md:p-10">
          <div className="flex flex-col gap-6">
            <h2 className='h2-bold'>{shift.titel}</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                  {shift.opdrachtgever.naam}
                </p>
                <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                  {shift.functie}
                </p>
                <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                €{shift.uurtarief} p/u
                </p>
              </div>

              <div className="p-regular-20 flex items-center gap-3">
              <Image src="/assets/icons/location.svg" alt="location" width={32} height={32} />
              <p className="p-medium-16 lg:p-regular-20"> {shift.opdrachtgever.stad}, {shift.adres}</p>
            </div>

            <div className="p-regular-20 flex items-center gap-3">
              <Image src="/assets/icons/location.svg" alt="location" width={32} height={32} />
              <p className="p-medium-16 lg:p-regular-20">{shift.plekken} plekken</p>
            </div>

            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className='flex gap-2 md:gap-3'>
              <Image src="/assets/icons/calendar.svg" alt="calendar" width={32} height={32} />
              <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
                <p>
                  {shift.begindatum}
                </p>
                <p>
                  {shift.begintijd} -  {' '}
                  {shift.eindtijd}
                </p>
              </div>
            </div>

            {!isOpdrachtgever && 
            <AanmeldButton shift={shift} />
          }
          </div>

          <div className="flex flex-col gap-2">
            <p className="p-bold-20 text-grey-600">Over de shift:</p>
            <p className="p-medium-16 lg:p-regular-18">{shift.beschrijving}</p>
            <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline">{shift.inFlexpool ? shift.Flexpools.titel : 'niet in flexpool'}</p>
          </div>
        </div>
      </div>
    </section>

    {!isOpdrachtgever ? ( <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
      <h2 className="h2-bold">Gerelateerde shifts</h2>

      <Collection 
          data={relatedEvents?.data}
          emptyTitle="Geen relevante shifts gevonden"
          emptyStateSubtext="Kom later nog eens terug"
          collectionType="All_Events"
          limit={3}
          page={searchParams.page as string}
          totalPages={relatedEvents?.totalPages}
        />
    </section>
    ) : 
    (
    <AanmeldingenSectie shiftId={shift._id}/>
    )
  }
    
    </>
  )
}

export default shiftDetails;