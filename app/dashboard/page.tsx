"use client";

import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkOnboardingStatusBedrijf } from '../lib/actions/bedrijven.actions';
import { checkOnboardingStatusFreelancer } from '../lib/actions/freelancer.actions';

const FreelanceDashboard = dynamic(() => import('@/app/components/shared/freelancerDashboard'));
const BedrijvenDashboard = dynamic(() => import('@/app/components/shared/bedrijvenDashboard'));

const DashboardPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isBedrijf, setIsBedrijf] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    setIsBedrijf(user?.organizationMemberships?.length > 0);
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (isBedrijf === null) return;
      try {
        const userId = user?.id;
        if (!userId) throw new Error('User ID missing');

        const response = isBedrijf
          ? await checkOnboardingStatusBedrijf(userId)
          : await checkOnboardingStatusFreelancer(userId);
        setIsOnboarded(response);
        setIsLoading(false)
      } catch (error) {
        console.error('Error:', error);
        router.push('/sign-in');
      }
    };
    fetchOnboardingStatus();
  }, [isBedrijf, user, router]);

  // Redirect based on state
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
    } else if (isOnboarded === false) {
      router.push('/verifieren');
    }
  }, [isLoaded, isSignedIn, isOnboarded, router]);

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isOnboarded) {
    router.push('/verifieren'); // Redirect happens if not onboarded
  }

  return (
    <div>
      {isBedrijf ? <BedrijvenDashboard /> : <FreelanceDashboard /> }
    </div>
  );
};

export default DashboardPage;

