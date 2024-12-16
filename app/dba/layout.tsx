import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/styles/globals.css'
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/app/components/ui/toaster"
import '@/app/styles/globals.css'
import NavBar from "@/app/components/shared/NavBar";
import Footer from "@/app/components/shared/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junter | Deregulering Beoordeling Arbeidsrelaties",
  description: "In de Wet DBA (Deregulering Beoordeling Arbeidsrelaties) staat uitgelegd wanneer bij het verlenen van een opdracht sprake is van ondernemerschap of loondienst en uitzendwerk.",
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
    <NavBar />
        <main className="mt-11 flex flex-row justify-center items-center min-h-screen">
            <section className="main-container flex justify-center items-center">
  <div className="w-full max-w-4xl">{children}</div>
            </section>
            {/* @ts-ignore */}
            </main>
        <Toaster />
        <Footer />
        </body>
    </html>
    </ClerkProvider>
  );
}
