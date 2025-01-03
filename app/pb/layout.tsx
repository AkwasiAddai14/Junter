

import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";


import '@/app/styles/globals.css'
import NavBar from "@/app/components/shared/NavBar";
import Footer from "@/app/components/shared/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter",
  description: "Making Money Fast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
      <html lang='en'>
        <body className={inter.className}>
          <NavBar />

          <main className="flex flex-row justify-center items-center min-h-screen">

            <section className="main-container flex justify-center items-center">
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            {/* @ts-ignore */}
          </main>

          <Footer />
        </body>
      </html>
   
  );
}