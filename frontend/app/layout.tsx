import "../styles/globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Vee | Safe GBV Reporting Platform",
  description: "Anonymous gender-based violence reporting and support platform.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="font-sans antialiased bg-white">{children}</body>
    </html>
  );
}