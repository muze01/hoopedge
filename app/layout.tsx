import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PaystackScript } from "@/components/PaystackScript";
import QueryProvider from "@/components/QueryProvider";
import { PaymentSuccessHandler } from "@/components/PaymentSuccessHandler";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HoopEdge",
  description: "Basketball Analytics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Navigation session={session} />
          <PaymentSuccessHandler />
          {children}
          <PaystackScript />
          <Footer />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
