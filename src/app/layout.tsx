import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NetworkProvider } from "@/context/NetworkContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://txfix.click"),
  title: "TxFix - Unstick Bitcoin Transactions in 3 Clicks",
  description:
    "Stuck Bitcoin transaction? Diagnose and fix it in 3 clicks - free. RBF fee bump, CPFP, or accelerator with step-by-step wallet guides. No keys required.",
  keywords: [
    "stuck bitcoin transaction",
    "fix bitcoin transaction",
    "unconfirmed bitcoin transaction",
    "bitcoin transaction not confirming",
    "speed up bitcoin transaction",
    "bitcoin fee bump",
    "RBF bitcoin",
    "CPFP bitcoin",
    "bitcoin transaction accelerator free",
    "bitcoin mempool",
  ],
  alternates: {
    canonical: "https://txfix.click",
  },
  openGraph: {
    title: "TxFix - Unstick Bitcoin Transactions in 3 Clicks",
    description:
      "Stuck Bitcoin transaction? Free diagnosis. 3 clicks to unstick. No keys required.",
    url: "https://txfix.click",
    siteName: "TxFix",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TxFix - Unstick Bitcoin Transactions in 3 Clicks",
    description:
      "Stuck Bitcoin transaction? Free diagnosis. 3 clicks to unstick. No keys required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "TxFix",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TxFix",
              url: "https://txfix.click",
              description:
                "Free Bitcoin transaction rescue tool. Diagnose stuck transactions and fix them in 3 clicks with RBF or CPFP.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires a modern web browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <Suspense fallback={null}>
          <NetworkProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </NetworkProvider>
        </Suspense>
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${process.env.NEXT_PUBLIC_CF_BEACON_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}
