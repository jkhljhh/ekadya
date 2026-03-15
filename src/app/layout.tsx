import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ekadya 🌸 — Our Little Garden Princess',
  description: 'A magical world celebrating the most precious flower in our garden — Ekadya, our beloved little one.',
  openGraph: {
    title: 'Ekadya 🌸 — Our Little Garden Princess',
    description: 'A magical world celebrating the most precious flower in our garden',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
