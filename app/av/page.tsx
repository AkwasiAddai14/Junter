'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import AVfreelancers from "../components/shared/AVfreelancers";
import AVbedrijven from "../components/shared/AVbedrijven";
import React from 'react'

const page = () => {
  return (
    <div className="justify-center items-center mt-12">
      <Tabs defaultValue="Freelancer" className="items-center justify-center">
    <TabsList className="justify-center items-center ml-80">
      <TabsTrigger value="Freelancer">Freelancers</TabsTrigger>
      <TabsTrigger value="Bedrijven">Bedrijven</TabsTrigger>
    </TabsList>
    <section >
      <TabsContent value="Freelancer">
        <AVfreelancers/>
      </TabsContent>
      <TabsContent value="Bedrijven">
        <AVbedrijven/>
      </TabsContent>
    </section>
  </Tabs></div>
  )
}

export default page