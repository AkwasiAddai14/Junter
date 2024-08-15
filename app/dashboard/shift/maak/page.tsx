"use client"

import ShiftForm from "@/app/components/forms/ShiftForm"
import { useUser } from "@clerk/nextjs";
import DashNav from "@/app/components/shared/DashNav";
import Footer from "@/app/components/shared/Footer4";


const MaakShift = () => {
  const { user } = useUser();
 

  const userId = user?.id as string;

  return (
    <>
    <DashNav />
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper font-bold text-[28px] leading-[36px] md:text-[36px] md:leading-[44px] text-center sm:text-left">Nieuwe shift</h3>
      </section>
      <div className="wrapper my-8">
        <ShiftForm userId={userId} type="maak" />
      </div>
    <Footer />
    </>
  )
}

export default MaakShift;