"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MessageCircle, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden font-inter text-gray-100">
      <Navbar />

      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/Webapp GBV Design.png"
          alt="Empowering illustration for GBV survivors"
          fill
          priority
          className="object-cover object-center brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/30 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-10 max-w-5xl mt-20">
        
        {/* Main Heading - FORCED ONE LINE */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold whitespace-nowrap tracking-tight leading-none">
            <span className="text-white italic">You are not </span>
            <span className="bg-gradient-to-r from-teal-300 via-green-300 to-teal-400 bg-clip-text text-transparent italic">
              alone.
            </span>
          </h1>
        </div>

        {/* Rest of your content */}
        <p className="text-xl text-gray-200 leading-relaxed max-w-lg mb-8">
          Vee helps you{" "}
          <span className="text-teal-300 font-semibold drop-shadow-lg">put words to your experience</span>, and find{" "}
          <span className="text-green-300 font-semibold drop-shadow-lg">safe places</span> and people who can help.{" "}        </p>

        <div className="mb-4">
          <Link
            href="/chat"
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 via-green-500 to-teal-600 hover:from-teal-400 hover:via-green-400 hover:to-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-teal-500/40 transition-all duration-300 hover:scale-105 border-2 border-white/30"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-green-400 to-teal-500 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-300 -z-10"></div>
            
            <div className="relative">
              <MessageCircle size={24} className="text-white group-hover:scale-110 transition-transform" />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            
            <span className="text-lg tracking-wide">Start Chat with Vee</span>
            
            <span className="group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-300">→</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-teal-200/80">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
          <span>Anonymous • Secure • Available 24/7</span>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="text-6xl">💫</div>
      </div>
    </main>
  );
}