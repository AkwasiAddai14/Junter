import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/styles/globals.css'
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/app/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter",
  description: "Empowering progress , enabling growth",
  icons: {
    icon: "@/app/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={"pk_live_Y2xlcmsuanVudGVyLmV1JA"}>
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        </body>
    </html>
    </ClerkProvider>
  );
}
