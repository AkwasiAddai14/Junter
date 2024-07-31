'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import AVfreelancers from "../components/shared/AVfreelancers";
import AVbedrijven from "../components/shared/AVbedrijven";
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Tabs defaultValue="Freelancer" className="w-full max-w-4xl ">
        <TabsList className="flex justify-center px-24 bg-white items-center">
          <TabsTrigger value="Freelancer">Freelancers</TabsTrigger>
          <TabsTrigger value="Bedrijven">Bedrijven</TabsTrigger>
        </TabsList>
        <section className="mt-6">
          <TabsContent value="Freelancer">
            <AVfreelancers />
          </TabsContent>
          <TabsContent value="Bedrijven">
            <AVbedrijven />
          </TabsContent>
        </section>
      </Tabs>
    </div>
  )
}

export default page