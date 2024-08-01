import ShiftForm from "@/app/components/forms/ShiftForm"
import { useUser } from "@clerk/nextjs";

const MaakShift = () => {
  const { user } = useUser();

  const userId = user?.id as string;

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Nieuwe shift</h3>
      </section>

      <div className="wrapper my-8">
        <ShiftForm userId={userId} type="maak" />
      </div>
    </>
  )
}

export default MaakShift;