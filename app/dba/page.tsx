'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import DBAfreelancers from "../components/shared/DBAfreelancers";
import DBAbedrijven from "../components/shared/DBAbedrijven";
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Tabs defaultValue="Bedrijven" className="w-full max-w-4xl ">
        {/* <TabsList className="flex justify-center px-24 bg-white items-center">
          <TabsTrigger value="Bedrijven">Bedrijven</TabsTrigger>
          <TabsTrigger value="Freelancer">Freelancers</TabsTrigger>
        </TabsList> */}
        <section className="mt-6">
          {/* <TabsContent value="Freelancer">
            <DBAfreelancers />
          </TabsContent> */}
          <TabsContent value="Bedrijven">
            <DBAbedrijven />
          </TabsContent>
        </section>
      </Tabs>
    </div>
  )
}

export default page