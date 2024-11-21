import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/styles/globals.css'
import NavBar from "@/app/components/shared/NavBar";
import Footer from "@/app/components/shared/Footer";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter",
  description: "Empowering progress , enabling growth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={inter.className}>
        <NavBar />
          <main>
            <section>
              <div>{children}</div>
            </section>
          </main>
          <Footer />
        </body>
      </html>
      </ClerkProvider>
  );
}