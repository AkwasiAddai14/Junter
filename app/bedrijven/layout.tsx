
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";


import '@/app/styles/globals.css'
import NavBar from "@/app/components/shared/NavBar";
import Footer from "@/app/components/shared/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter",
  description: "A Next.js 13 Meta Threads application",
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
          <main>
              <div >{children}</div>
            {/* @ts-ignore */}
          </main>
          <Footer />
        </body>
      </html>
   
  );
}