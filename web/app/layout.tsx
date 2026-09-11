import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrowdSignal | Live Event Intelligence & Verifiable Reputation for DreamDEX",
  description:
    "The intelligence layer built on top of Event Contracts. Turn real market participation into verifiable crowd intelligence and predictor reputation on Somnia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 flex flex-col font-sans antialiased selection:bg-brand selection:text-black">
        {children}
      </body>
    </html>
  );
}
