import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteCheck - Instant Job Estimates",
  description: "Get transparent, honest estimates for home repair jobs in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-slate-900">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
