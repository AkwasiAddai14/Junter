import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/styles/globals.css'
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/app/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter | Make Money Fast",
  description: "Ontdek een wereld van mogelijkheden op ons platform. Van creatieve projecten tot zakelijke taken, hier vind je jouw volgende succesverhaal. Word lid en maak je dromen werkelijkheid!",
  icons: {
    icon: "@/app/assets/images/iStock-2149706236.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        </body>
    </html>
    </ClerkProvider>
  );
}
