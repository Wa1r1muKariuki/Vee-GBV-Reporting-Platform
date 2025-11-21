"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-6 left-0 w-full z-50 flex justify-center items-center">
      {/* 🌙 Floating Nav Container */}
      <nav className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-full px-10 py-3 shadow-lg flex items-center justify-center space-x-10 text-white">
        <Link
          href="/about"
          className="hover:text-teal-300 transition duration-200 text-sm font-medium tracking-wide"
        >
          About
        </Link>
        <Link
          href="/map"
          className="hover:text-teal-300 transition duration-200 text-sm font-medium tracking-wide"
        >
          Map Insights
        </Link>
        <Link
          href="/resources"
          className="hover:text-teal-300 transition duration-200 text-sm font-medium tracking-wide"
        >
          Resources
        </Link>
      </nav>

      {/* 🌀 Floating Logo Far Left */}
      <div className="absolute left-10 top-0">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Vee logo"
            width={56}
            height={56}
            className="rounded-full shadow-md border border-white/20 hover:scale-105 transition"
            priority
          />
        </Link>
      </div>

      {/* 🛡️ Report Button Far Right */}
      <div className="absolute right-10 top-1">
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-lg transition text-white"
        >
          <Shield size={16} />
          <span>Report</span>
        </Link>
      </div>
    </header>
  );
}