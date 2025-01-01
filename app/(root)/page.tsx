"use client"


import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import Testimonials from "../components/shared/Testimonials";
import { Faqs } from "../components/shared/FAQ";
import { SecondaryFeatures } from "../components/shared/Features";
import Branches from "../components/shared/Branches";
import { Hero } from "../components/shared/PhoneHero";
import  NEWCTA  from "../components/shared/NEWCTA";
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'

export default function Home() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
 


  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard', { scroll: false }) // Navigate to the dashboard if the user is signed in
    }
  }, [isLoaded, user]);

  return (
    <main>
      <Header/>
      <NEWCTA/>
      {/* <Hero/> */}
      <SecondaryFeatures/>
      <Branches/>
      {/* <Testimonials/> */}
      <Faqs/>
      <Footer/>
    </main>
  );
}
