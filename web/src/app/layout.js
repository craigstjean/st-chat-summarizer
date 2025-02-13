import { Suspense } from 'react'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientPage from '@/components/ClientPage';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const apiBaseUrl = process.env.API_BASE_URL || '/api';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <ClientPage apiBaseUrl={apiBaseUrl} />
        </Suspense>
      </body>
    </html>
  );
}

