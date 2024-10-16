import {ClerkProvider} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import '@/app/styles/globals.css'

export const metadata = {
  title: 'Junter',
  description: 'Empowering progress, enabling growth.'
}

const inter = Inter({subsets: ["latin"]})

export default function AuthLayout({children} : {children : React.ReactNode}){
  return(
    <ClerkProvider publishableKey="pk_live_Y2xlcmsuanVudGVyLmV1JA">
      <html lang="en">
       <body className={`${inter.className} bg-dark-1`}>
        {children}
       </body>
      </html>
    </ClerkProvider>
  )
}