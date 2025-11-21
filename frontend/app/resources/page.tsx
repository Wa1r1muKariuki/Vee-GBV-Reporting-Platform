"use client";

import { useState, useMemo } from 'react';
import { 
  Phone, MapPin, Clock, DollarSign, AlertCircle, 
  Hospital, Scale, Heart, Home, Shield, Users, 
  Search, Filter, X, ChevronDown, Languages,
  FileText
} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

// ==================== TYPES ====================

interface Resource {
  name: string;
  type: string;
  phone: string;
  location?: string;
  hours?: string;
  cost?: string;
  services: string[];
  email?: string;
  website?: string;
  availability?: string;
  languages?: string[];
}

interface County {
  name: string;
  medical: Resource[];
  legal: Resource[];
  counseling: Resource[];
  shelters: Resource[];
  police: Resource[];
}

// ==================== ACTUAL DATA ====================

const NATIONAL_HOTLINES: Resource[] = [
  {
    name: "National GBV Helpline",
    type: "Emergency Hotline",
    phone: "1195",
    hours: "24/7",
    cost: "Toll-free",
    availability: "24/7",
    languages: ["English", "Kiswahili"],
    services: ["Crisis counseling", "Referrals", "Emergency response"]
  },
  {
    name: "Police Emergency",
    type: "Emergency",
    phone: "999 / 112 / 911",
    hours: "24/7",
    cost: "Free",
    services: ["Emergency police response", "Crime reporting"]
  },
  {
    name: "Childline Kenya",
    type: "Child Protection",
    phone: "116",
    hours: "24/7",
    cost: "Toll-free",
    services: ["Child protection", "Abuse reporting", "Counseling for children"]
  },
  {
    name: "Kenya Red Cross Psychosocial Support",
    type: "Mental Health",
    phone: "1199",
    hours: "24/7",
    cost: "Toll-free",
    services: ["Mental health support", "Trauma counseling"]
  }
];

const COUNTIES: Record<string, County> = {
  "Nairobi": {
    name: "Nairobi",
    medical: [
      {
        name: "Kenyatta National Hospital - GBV Unit",
        type: "Public Hospital",
        phone: "020-2726300 / 0709-854000",
        location: "Hospital Road, Nairobi",
        hours: "24/7",
        cost: "Free/Subsidized for GBV survivors",
        services: ["Medical examination", "PEP", "Emergency contraception", "Forensic evidence", "STI screening", "Counseling", "Police liaison"]
      },
      {
        name: "Nairobi Women's Hospital - GVRC",
        type: "Private Hospital GBV Unit",
        phone: "0722-845841 / 020-2845000",
        location: "Argwings Kodhek Road, Hurlingham",
        hours: "24/7",
        cost: "FREE for survivors (donor funded)",
        services: ["Medical care", "Counseling", "Legal support", "Safe house", "24/7 hotline"]
      },
      {
        name: "Mama Lucy Kibaki Hospital - GBV Centre",
        type: "Public Hospital",
        phone: "020-2340871",
        location: "Outer Ring Road, Embakasi",
        hours: "24/7",
        services: ["Medical examination", "PEP", "Counseling", "Referrals"]
      }
    ],
    legal: [
      {
        name: "FIDA Kenya - Nairobi Office",
        type: "Legal Aid",
        phone: "020-3874998 / 0800-720553",
        email: "fida@fidakenya.org",
        location: "Argwings Kodhek Road, Kilimani",
        hours: "Mon-Fri 8:00-17:00",
        cost: "FREE",
        website: "www.fidakenya.org",
        services: ["Free legal advice", "Court representation", "Protection orders", "Legal aid"]
      },
      {
        name: "Kituo Cha Sheria",
        type: "Legal Aid Centre",
        phone: "020-3876290 / 0730-123222",
        location: "Valley Road, Nairobi",
        hours: "Mon-Fri 8:00-17:00",
        cost: "FREE",
        services: ["Legal aid", "Advocacy", "Court accompaniment"]
      }
    ],
    counseling: [
      {
        name: "LVCT Health",
        type: "Counseling",
        phone: "1190 (Toll-free)",
        location: "Ralph Bunche Road, Nairobi",
        hours: "Mon-Fri 8:00-17:00",
        cost: "FREE",
        services: ["Free counseling", "HIV testing", "GBV support groups"]
      },
      {
        name: "Amani Counselling Centre",
        type: "Trauma Counseling",
        phone: "020-2730300 / 0722-203132",
        location: "Nairobi",
        hours: "Mon-Fri 8:00-17:00",
        services: ["Individual therapy", "Group therapy", "Trauma counseling"]
      },
      {
        name: "Befrienders Kenya",
        type: "Emotional Support",
        phone: "0722-178177",
        hours: "24/7",
        cost: "FREE",
        services: ["Emotional support", "Suicide prevention", "Crisis counseling"]
      }
    ],
    shelters: [
      {
        name: "Nairobi Women's Hospital Safe House",
        type: "Emergency Shelter",
        phone: "0722-845841",
        services: ["Safe housing (up to 3 months)", "Counseling", "Medical care", "Legal support"]
      },
      {
        name: "COVAW Shelter",
        type: "Women's Shelter",
        phone: "0736-002606 / 0722-384096",
        services: ["Safe housing", "Psychosocial support", "Economic empowerment"]
      }
    ],
    police: [
      {
        name: "Central Police Station - Gender Desk",
        type: "Police",
        phone: "020-222222 / 999",
        location: "University Way, Nairobi",
        services: ["GBV reporting", "Protection orders", "Case follow-up"]
      }
    ]
  },
  "Mombasa": {
    name: "Mombasa",
    medical: [
      {
        name: "Coast General Hospital - GBV Centre",
        type: "Public Hospital",
        phone: "041-2312301 / 0713-449700",
        location: "Hospital Road, Mombasa",
        hours: "24/7",
        services: ["Medical examination", "PEP", "Counseling", "Forensics"]
      }
    ],
    legal: [
      {
        name: "FIDA Kenya - Mombasa",
        type: "Legal Aid",
        phone: "041-2314925 / 0800-720553",
        cost: "FREE",
        services: ["Legal aid", "Court representation"]
      }
    ],
    counseling: [
      {
        name: "Coast Counselling Services",
        type: "Counseling",
        phone: "041-2222881",
        services: ["Trauma counseling", "Group therapy"]
      }
    ],
    shelters: [],
    police: [
      {
        name: "Mombasa Central - Gender Desk",
        type: "Police",
        phone: "041-2312121",
        location: "Makadara Road",
        services: ["GBV reporting"]
      }
    ]
  },
  "Kisumu": {
    name: "Kisumu",
    medical: [
      {
        name: "JOOTRH - GBV Unit",
        type: "Public Hospital",
        phone: "057-2023395 / 0790-663000",
        location: "Kisumu",
        hours: "24/7",
        services: ["Medical care", "PEP", "Counseling"]
      }
    ],
    legal: [
      {
        name: "FIDA Kenya - Kisumu",
        type: "Legal Aid",
        phone: "057-2022844 / 0800-720553",
        cost: "FREE",
        services: ["Legal aid", "Court representation"]
      }
    ],
    counseling: [],
    shelters: [],
    police: []
  }
};

const COUNTY_NAMES = Object.keys(COUNTIES);

const SERVICE_TYPES = [
  { value: "all", label: "All Services", icon: Users },
  { value: "medical", label: "Medical", icon: Hospital },
  { value: "legal", label: "Legal", icon: Scale },
  { value: "counseling", label: "Counseling", icon: Heart },
  { value: "shelters", label: "Shelters", icon: Home },
  { value: "police", label: "Police", icon: Shield }
];

// ==================== NAVBAR COMPONENT ====================

function Navbar() {
  const handleSafeExit = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.body.style.filter = "blur(8px)";
      setTimeout(() => window.location.replace("https://www.google.com"), 150);
    } catch {
      window.location.replace("https://www.google.com");
    }
  };

  return (
    <header className="fixed top-4 left-0 w-full z-50 flex justify-center items-center">
      {/* Floating Nav Container */}
      <nav className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-full px-8 py-2 shadow-2xl flex items-center justify-center space-x-8 text-white">
        <Link
          href="/home"
          className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide"
        >
          Home
        </Link>
        <Link
          href="/chat"
          className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide"
        >
          Chat
        </Link>
        <Link
          href="/resources"
          className="hover:text-teal-300 transition duration-200 text-xs font-medium tracking-wide"
        >
          Resources
        </Link>
      </nav>

      {/* Floating Logo Far Left */}
      <div className="absolute left-6 top-0">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Vee logo"
            width={44}
            height={44}
            className="rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all duration-300"
            priority
          />
        </Link>
      </div>
    </header>
  );
}

// ==================== RESOURCE CARD COMPONENT ====================

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:border-teal-400/30 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-white text-lg flex-1 group-hover:text-teal-200 transition-colors">
          {resource.name}
        </h3>
        <span className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full font-medium border border-teal-400/30">
          {resource.type}
        </span>
      </div>

      <div className="space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <a 
            href={`tel:${resource.phone.replace(/\s/g, '')}`}
            className="text-teal-300 hover:text-teal-200 font-semibold text-sm transition-colors"
          >
            {resource.phone}
          </a>
        </div>

        {/* Location */}
        {resource.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-sm">{resource.location}</span>
          </div>
        )}

        {/* Hours */}
        {resource.hours && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{resource.hours}</span>
          </div>
        )}

        {/* Cost */}
        {resource.cost && (
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className={`text-sm font-medium ${
              resource.cost.toLowerCase().includes('free') ? 'text-green-400' : 'text-gray-300'
            }`}>
              {resource.cost}
            </span>
          </div>
        )}

        {/* Services */}
        <div className="pt-3 border-t border-white/20">
          <p className="text-xs font-semibold text-gray-400 mb-2">SERVICES:</p>
          <div className="flex flex-wrap gap-1">
            {resource.services.slice(0, 4).map((service, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/10"
              >
                {service}
              </span>
            ))}
            {resource.services.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{resource.services.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ResourcesPage() {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  // Filter resources
  const filteredResources = useMemo(() => {
    let resources: { category: string; items: Resource[] }[] = [];

    // Always include national hotlines
    if (selectedService === "all" || selectedService === "emergency") {
      resources.push({
        category: "🚨 National Emergency Hotlines",
        items: NATIONAL_HOTLINES
      });
    }

    // County-specific resources
    if (selectedCounty === "all") {
      // Show all counties
      COUNTY_NAMES.forEach(countyName => {
        const county = COUNTIES[countyName];
        if (selectedService === "all") {
          ["medical", "legal", "counseling", "shelters", "police"].forEach(service => {
            const items = county[service as keyof County] as Resource[];
            if (items && items.length > 0) {
              resources.push({
                category: `${countyName} - ${service.charAt(0).toUpperCase() + service.slice(1)}`,
                items
              });
            }
          });
        } else {
          const items = county[selectedService as keyof County] as Resource[];
          if (items && items.length > 0) {
            resources.push({
              category: `${countyName} - ${selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}`,
              items
            });
          }
        }
      });
    } else {
      // Show selected county
      const county = COUNTIES[selectedCounty];
      if (county) {
        if (selectedService === "all") {
          ["medical", "legal", "counseling", "shelters", "police"].forEach(service => {
            const items = county[service as keyof County] as Resource[];
            if (items && items.length > 0) {
              resources.push({
                category: `${selectedCounty} - ${service.charAt(0).toUpperCase() + service.slice(1)}`,
                items
              });
            }
          });
        } else {
          const items = county[selectedService as keyof County] as Resource[];
          if (items && items.length > 0) {
            resources.push({
              category: `${selectedCounty} - ${selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}`,
              items
            });
          }
        }
      }
    }

    // Apply search filter
    if (searchQuery) {
      resources = resources.map(category => ({
        ...category,
        items: category.items.filter(resource =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.phone.includes(searchQuery) ||
          resource.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.items.length > 0);
    }

    return resources;
  }, [selectedCounty, selectedService, searchQuery]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
  };

  const t = {
    en: {
      title: "Find Support",
      subtitle: "Verified resources, emergency services, and support networks across Kenya",
      emergencyTitle: "In Immediate Danger?",
      emergencyText: "Call 999 or 112 for police • GBV Helpline: 1195 (24/7, toll-free)",
      available247: "Available 24/7 • Confidential • Free",
      searchPlaceholder: "Search by name, phone, or service...",
      allServices: "All Services",
      allCounties: "All Counties",
      noResults: "No resources found",
      noResultsSub: "Try adjusting your filters or search query",
      switchLanguage: "SW",
      switchTo: "Switch to Swahili"
    },
    sw: {
      title: "Tafuta Usaidizi",
      subtitle: "Rasilimali zilizothibitishwa, huduma za dharura, na mitandao ya usaidizi nchini Kenya",
      emergencyTitle: "Uko Hatari ya Haraka?",
      emergencyText: "Piga 999 au 112 kwa polisi • Mstari wa Msaidizi: 1195 (24/7, bila malipo)",
      available247: "Inapatikana 24/7 • Siri • Bila Malipo",
      searchPlaceholder: "Tafuta kwa jina, namba ya simu, au huduma...",
      allServices: "Huduma Zote",
      allCounties: "Kaunti Zote",
      noResults: "Hakuna rasilimali zilizopatikana",
      noResultsSub: "Badilisha michujo au utafutaji wako",
      switchLanguage: "EN",
      switchTo: "Switch to English"
    }
  }[language];

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-inter text-gray-100">
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

      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-8 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            {/* Colored "Find Support" heading */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-teal-300 via-green-300 to-teal-400 bg-clip-text text-transparent">
                  {t.title}
                </span>
              </h1>
            </div>

            <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* More Visible Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 text-white bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 px-4 py-3 rounded-xl transition-all duration-200 border border-teal-400/30 shadow-lg hover:scale-105"
            title={t.switchTo}
          >
            <Languages size={18} className="text-white" />
            <span className="font-semibold text-sm">{t.switchLanguage}</span>
          </button>
        </div>

        {/* Smaller Emergency Banner - Beside Find Support */}
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 rounded-xl p-4 mb-8 max-w-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-100 text-base">{t.emergencyTitle}</h3>
              <p className="text-red-50 text-sm mt-1">
                {t.emergencyText}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-red-200">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                <span>{t.available247}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-t-3xl border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Filters Section */}
          <div className="mb-8">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-medium mb-4"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter content */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Search */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-200" />
                  </button>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Service type filter */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Service Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TYPES.map(service => {
                      const Icon = service.icon;
                      return (
                        <button
                          key={service.value}
                          onClick={() => setSelectedService(service.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                            selectedService === service.value
                              ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg'
                              : 'bg-white/10 text-gray-300 border border-white/20 hover:border-teal-300/50 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {service.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* County filter */}
                <div className="lg:w-64">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    County / Location
                  </label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white"
                  >
                    <option value="all" className="bg-gray-800">{t.allCounties}</option>
                    {COUNTY_NAMES.map(county => (
                      <option key={county} value={county} className="bg-gray-800">{county}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-12">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">{t.noResults}</h3>
                <p className="text-gray-400">{t.noResultsSub}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredResources.map((category, idx) => (
                  <div key={idx}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {category.category}
                      <span className="text-sm font-normal text-gray-400">
                        ({category.items.length})
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((resource, resourceIdx) => (
                        <ResourceCard key={resourceIdx} resource={resource} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-2">Your Privacy</h4>
                <p>All services listed respect confidentiality. Most are free or low-cost.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Need Help Now?</h4>
                <p>If you're in danger, call <strong className="text-white">999</strong> or <strong className="text-white">1195</strong> immediately.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Resource Accuracy</h4>
                <p>Resources updated November 2024. Contact numbers verified with providers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}