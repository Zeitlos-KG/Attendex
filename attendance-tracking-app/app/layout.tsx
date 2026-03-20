import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GuestProvider } from '@/lib/guest-context'
import { GuestBanner } from '@/components/guest-banner'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: 'Attendex - Smart Attendance Tracking',
  description: 'Track your college attendance effortlessly with Attendex. Stay on top of your classes, monitor your progress, and never miss the attendance threshold.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <GuestProvider>
          <GuestBanner />
          {children}
        </GuestProvider>
        <Analytics />
      </body>
    </html>
  )
}

