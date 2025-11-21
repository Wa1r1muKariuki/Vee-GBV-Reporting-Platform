"use client";

import { useEffect, useState } from "react";
import IncidentMap from "@/components/IncidentMap";
import MapSidebar from "@/components/MapSidebar";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, Filter, MapPin, Calendar, Shield, 
  FileText, X, ChevronDown 
} from "lucide-react";

// ==================== NAVBAR COMPONENT ====================

function Navbar() {
  const handleSafeExit = (e) => {
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
          href="/Home"
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

// ==================== ENHANCED FILTER BAR ====================

function EnhancedFilterBar({ 
  onFilterChange, 
  currentFilter, 
  onSearchChange, 
  searchQuery, 
  onTimeFilterChange, 
  timeFilter, 
  onLocationFilterChange, 
  locationFilter 
}) {
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: "all", label: "All Incidents", color: "bg-gray-500" },
    { value: "harassment", label: "Harassment", color: "bg-blue-500" },
    { value: "assault", label: "Assault", color: "bg-red-500" },
    { value: "femicide", label: "Femicide", color: "bg-black" },
    { value: "public_violence", label: "Public Violence", color: "bg-orange-500" },
    { value: "domestic_violence", label: "Domestic Violence", color: "bg-purple-500" },
    { value: "workplace_harassment", label: "Workplace", color: "bg-yellow-500" },
    { value: "online_harassment", label: "Online", color: "bg-indigo-500" }
  ];

  const timeFilters = [
    { value: "all", label: "All Time" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" }
  ];

  const locationFilters = [
    { value: "all", label: "All Locations" },
    { value: "nairobi", label: "Nairobi" },
    { value: "mombasa", label: "Mombasa" },
    { value: "kisumu", label: "Kisumu" },
    { value: "nakuru", label: "Nakuru" },
    { value: "eldoret", label: "Eldoret" }
  ];

  return (
    <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-medium mb-4"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter content */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents by type or location..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-200" />
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Incident Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Incident Type
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => onFilterChange(category.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      currentFilter === category.value
                        ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 border border-white/20 hover:border-teal-300/50 hover:text-white'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${category.color}`}></div>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Time Period
              </label>
              <select
                value={timeFilter}
                onChange={(e) => onTimeFilterChange(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white"
              >
                {timeFilters.map(filter => (
                  <option key={filter.value} value={filter.value} className="bg-gray-800">
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => onLocationFilterChange(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent text-white"
              >
                {locationFilters.map(filter => (
                  <option key={filter.value} value={filter.value} className="bg-gray-800">
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/incident", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const data = await res.json();
        console.log("API Response:", data);
        
        // Extract incidents from the response
        const incidents = data.data?.incidents || [];
        console.log("Processed incidents:", incidents);
        
        const validIncidents = incidents.filter(incident => 
          incident.lat != null && 
          incident.lng != null &&
          !isNaN(incident.lat) && 
          !isNaN(incident.lng)
        );

        console.log("Valid incidents with coordinates:", validIncidents);

        setReports(validIncidents);
        setFilteredReports(validIncidents);

      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError("Could not load map data.");
        
        // Fallback sample data for demonstration
        const sampleData = [
          {
            id: 1,
            type: "harassment",
            lat: -1.286389,
            lng: 36.817223,
            location: "Nairobi CBD",
            timestamp: new Date('2024-11-20'),
            description: "Street harassment incident"
          },
          {
            id: 2,
            type: "assault",
            lat: -1.3000,
            lng: 36.8000,
            location: "Westlands",
            timestamp: new Date('2024-11-19'),
            description: "Physical assault reported"
          },
          {
            id: 3,
            type: "public_violence",
            lat: -1.3500,
            lng: 36.8500,
            location: "Eastleigh",
            timestamp: new Date('2024-11-18'),
            description: "Public disturbance"
          },
          {
            id: 4,
            type: "domestic_violence",
            lat: -1.3200,
            lng: 36.8300,
            location: "Kilimani",
            timestamp: new Date('2024-11-17'),
            description: "Domestic violence case"
          },
          {
            id: 5,
            type: "workplace_harassment",
            lat: -1.3100,
            lng: 36.8400,
            location: "Upper Hill",
            timestamp: new Date('2024-11-16'),
            description: "Workplace harassment"
          }
        ];
        
        setReports(sampleData);
        setFilteredReports(sampleData);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // Apply all filters
  useEffect(() => {
    let filtered = reports;

    // Incident type filter
    if (filter !== "all") {
      filtered = filtered.filter(report => report.type === filter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.type?.toLowerCase().includes(query) ||
        report.location?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query)
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeFilter) {
        case "24h":
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case "7d":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(report => {
        if (!report.timestamp) return false;
        const reportDate = new Date(report.timestamp);
        return reportDate >= cutoffDate;
      });
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(report => 
        report.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, filter, searchQuery, timeFilter, locationFilter]);

  const handleFilterChange = (type) => {
    setFilter(type);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleTimeFilterChange = (time) => {
    setTimeFilter(time);
  };

  const handleLocationFilterChange = (location) => {
    setLocationFilter(location);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden font-inter text-gray-100">
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
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="animate-pulse text-white text-lg">Loading incident map...</div>
        </div>
      </main>
    );
  }

  if (error && reports.length === 0) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden font-inter text-gray-100">
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
        <div className="relative z-10 flex flex-col items-center justify-center h-screen">
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

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
      <div className="relative z-10 pt-20 pb-6 px-7 max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight leading-none text-white">
            Map Insights
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-1xl mt-1">
            Visualize reported incidents across Kenya. Data is anonymized for safety.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-t-3xl border-t border-white/20">
        {/* Enhanced Filter Bar */}
        <EnhancedFilterBar 
          onFilterChange={handleFilterChange}
          currentFilter={filter}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          onTimeFilterChange={handleTimeFilterChange}
          timeFilter={timeFilter}
          onLocationFilterChange={handleLocationFilterChange}
          locationFilter={locationFilter}
        />

        {/* Main Section */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="w-full lg:w-80 border-r border-white/10 bg-black/20 backdrop-blur-lg overflow-y-auto">
            <MapSidebar reports={filteredReports} />
          </div>

          {/* Map */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl h-full overflow-hidden">
                <IncidentMap reports={filteredReports} />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="border-t border-white/10 bg-black/20 px-6 py-4 text-sm text-gray-300 flex items-center gap-2">
              <span className="text-teal-400">🔒</span>
              Data is anonymized for safety. Locations are approximate.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/20 py-4 text-center text-sm text-gray-400">
          <p>
            Data source: Survivor-submitted reports | Visualization ©{" "}
            <a
              href="https://openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:text-teal-200"
            >
              OpenStreetMap
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}