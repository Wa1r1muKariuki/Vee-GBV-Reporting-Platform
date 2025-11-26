"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MessageCircle, Sparkles, Languages } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
  };

  const t = {
    en: {
      heading1: "You are not ",
      heading2: "alone.",
      description: "Vee helps you put words to your experience, and find safe places and people who can help.",
      highlighted1: "put words to your experience",
      highlighted2: "safe places",
      buttonText: "Start Chat with Vee",
      status: "Anonymous • Secure • Available 24/7",
      emergencyTitle: "In Immediate Danger?",
      emergencyText: "Call 999 or 112 for police • GBV Helpline: 1195 (24/7, toll-free)",
      emergencyStatus: "Available 24/7 • Confidential • Free"
    },
    sw: {
      heading1: "Wewe si ",
      heading2: "peke yako.",
      description: "Vee anakusaidia kuweka maneno kwa uzoefu wako, na kupata maeneo salama na watu wanaoweza kukusaidia.",
      highlighted1: "kuweka maneno kwa uzoefu wako",
      highlighted2: "maeneo salama",
      buttonText: "Anza Gumzo na Vee",
      status: "Anonimu • Salama • Inapatikana 24/7",
      emergencyTitle: "Uko Hatari ya Haraka?",
      emergencyText: "Piga 999 au 112 kwa polisi • Mstari wa Msaidizi: 1195 (24/7, bila malipo)",
      emergencyStatus: "Inapatikana 24/7 • Siri • Bila Malipo"
    }
  }[language];

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

      {/* Language Toggle */}
      <div className="absolute top-24 right-10 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 px-4 py-2 rounded-xl transition-all duration-200 border border-teal-400/30 shadow-lg hover:scale-105"
          title={language === 'en' ? "Switch to Swahili" : "Badilisha kwa Kiingereza"}
        >
          <Languages size={18} className="text-white" />
          <span className="font-semibold text-sm">
            {language === 'en' ? 'SW' : 'EN'}
          </span>
        </button>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-10 max-w-5xl mt-20">
        
        {/* Main Heading - FORCED ONE LINE */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold whitespace-nowrap tracking-tight leading-none">
            <span className="text-white italic">{t.heading1}</span>
            <span className="bg-gradient-to-r from-teal-300 via-green-300 to-teal-400 bg-clip-text text-transparent italic">
              {t.heading2}
            </span>
          </h1>
        </div>

        {/* Rest of your content */}
        <p className="text-xl text-gray-200 leading-relaxed max-w-lg mb-8">
          {language === 'en' ? (
            <>
              Vee helps you{" "}
              <span className="text-teal-300 font-semibold drop-shadow-lg">{t.highlighted1}</span>, and find{" "}
              <span className="text-green-300 font-semibold drop-shadow-lg">{t.highlighted2}</span> and people who can help.{" "}
            </>
          ) : (
            <>
              Vee anakusaidia{" "}
              <span className="text-teal-300 font-semibold drop-shadow-lg">{t.highlighted1}</span>, na kupata{" "}
              <span className="text-green-300 font-semibold drop-shadow-lg">{t.highlighted2}</span> na watu wanaoweza kukusaidia.{" "}
            </>
          )}
        </p>

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
            
            <span className="text-lg tracking-wide">{t.buttonText}</span>
            
            <span className="group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-300">→</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-teal-200/80">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
          <span>{t.status}</span>
        </div>

        {/* Smaller Emergency Info */}
        <div className="mt-8 p-3 bg-red-900/40 border border-red-700/50 rounded-lg max-w-md">
          <p className="text-xs text-red-200 leading-relaxed">
            <span className="font-semibold">{t.emergencyTitle}</span><br />
            {t.emergencyText}<br />
            {t.emergencyStatus}
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="text-6xl">💫</div>
      </div>
    </main>
  );
}