import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import '@/app/styles/globals.css'

export const metadata = {
  title: 'Junter',
  description: 'Empowering progress, enabling growth.'
}

const inter = Inter({subsets: ["latin"]})

export default function AuthLayout({children} : {children : React.ReactNode}){
  return(
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
       <body className={`${inter.className} bg-dark-1`}>
        {children}
       </body>
      </html>
    </ClerkProvider>
  )
}