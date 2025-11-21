import "../styles/globals.css";
import React from "react";

export const metadata = {
  title: "Vee | Safe GBV Reporting Platform",
  description: "Anonymous gender-based violence reporting and support platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white">{children}</body>
    </html>
  );
}
