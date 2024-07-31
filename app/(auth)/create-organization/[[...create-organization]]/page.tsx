import NavBar from "@/app/components/shared/NavBar";
import { CreateOrganization } from "@clerk/nextjs";
import { Footer } from "react-day-picker";

export default function CreateOrganizationPage() {
  return (
    <>
     <NavBar />
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
      <div className="flex items-center justify-center w-full">
            <CreateOrganization 
            path="/create-organization"
            />
      </div>
      </div>
     <Footer />
    </>
  );
}