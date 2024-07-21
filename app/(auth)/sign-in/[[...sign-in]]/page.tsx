import Footer from "@/app/components/shared/Footer4";
import NavBar from "@/app/components/shared/NavBar";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
      <div className="flex items-center justify-center w-full">
          <SignIn path="/sign-in" />
        </div>
      </div>
      <Footer />
    </>
  );
}
