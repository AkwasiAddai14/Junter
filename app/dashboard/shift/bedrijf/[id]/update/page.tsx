
import ShiftForm from "@/app/components/forms/ShiftForm";
import { haalShiftMetId } from "@/app/lib/actions/shift.actions"
import DashNav from "@/app/components/shared/DashNav";
import Footer from "@/app/components/shared/Footer4";
import { fetchBedrijfClerkId } from "@/app/lib/actions/bedrijven.actions";



type UpdateEventProps = {
  params: {
    id: string
  }
}

const UpdateEvent = async ({ params: { id } }: UpdateEventProps) => {
  
  const shift = await haalShiftMetId(id);
  const bedrijf = await fetchBedrijfClerkId(shift.opdrachtgever as unknown as string)

  return (
    <>
    <DashNav />
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">wijzig shift</h3>
      </section>
      <div className="wrapper my-8">
        <ShiftForm 
          type="update" 
          shift={shift} 
          shiftId={shift._id as unknown as string} 
          userId={bedrijf} 
        />
      </div>
      <Footer/>
    </>
  )
}

export default UpdateEvent