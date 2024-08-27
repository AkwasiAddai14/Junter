// pages/dashboard/page.tsx
"use client"

import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';


const FreelanceDashboard = dynamic(() => import('@/app/components/shared/freelancerDashboard'));
const BedrijvenDashboard = dynamic(() => import('@/app/components/shared/bedrijvenDashboard'));

const DashboardPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return  <div>Loading...</div>
  }

  if (!isSignedIn) {
    router.push('./sign-in');
    console.log("Niet ingelogd")
    return null; // or any placeholder, as the redirection will happen
  }
  if (!user){
    <FreelanceDashboard/>
  }

  const userType = user?.organizationMemberships.length;

  return (
    <div>
      {userType >= 1 ? <BedrijvenDashboard  /> : <FreelanceDashboard />}
    </div>
  );
};

export default DashboardPage;

