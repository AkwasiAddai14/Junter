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
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isBedrijf, setIsBedrijf] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return; // Wait until user data is fully loaded

    if (!isSignedIn) {
      router.push('./sign-in');
      return;
    }

    if (user) {
      const userType = user.organizationMemberships?.length >= 1;
      setIsBedrijf(userType);
    }
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (isBedrijf === null) return; // Wait until we know the user type

      try {
        const userId = user?.id; // Extract user ID safely
        if (!userId) {
          console.error('User ID is undefined.');
          router.push('/sign-in'); // Redirect if user ID is invalid
          return;
        }
        let response: boolean | null = null;

        if (isBedrijf) {
          response = await checkOnboardingStatusBedrijf(userId);
        } else {
          response = await checkOnboardingStatusFreelancer(userId);
        }

        setIsOnboarded(response ?? false);

        if (!response) {
          router.push('/verifieren');
        }
      } catch (error: any) {
        console.error('Error checking onboarding status:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [isBedrijf, user, router]);

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isOnboarded) {
    return null; // Redirect happens if not onboarded
  }

  return (
    <div>
      {isBedrijf ? <BedrijvenDashboard /> : <FreelanceDashboard />}
    </div>
  );
};

export default DashboardPage;

