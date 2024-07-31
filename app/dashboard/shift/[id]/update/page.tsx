
import ShiftForm from "@/app/components/forms/shiftForm";
import { haalShiftMetId } from "@/app/lib/actions/shift.actions"
import { useUser } from "@clerk/nextjs";

type UpdateEventProps = {
  params: {
    id: string
  }
}

const UpdateEvent = async ({ params: { id } }: UpdateEventProps) => {
  const { user } = useUser();

  const userId = user?.id as string;
  const shift = await haalShiftMetId(id)

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">wijzig shift</h3>
      </section>

      <div className="wrapper my-8">
        <ShiftForm 
          type="update" 
          shift={shift} 
          shiftId={shift._id} 
          userId={userId} 
        />
      </div>
    </>
  )
}

export default UpdateEvent