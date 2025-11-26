"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import Leaflet to avoid Server-Side Rendering (SSR) issues
const LeafletMap = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-teal-500">
      <div className="animate-pulse">Loading Map...</div>
    </div>
  )
});

export default function IncidentMap({ reports }) {
  const [mapReports, setMapReports] = useState([]);

  useEffect(() => {
    // Ensure reports is always an array to prevent crashes
    setMapReports(reports || []);
  }, [reports]);

  return (
    // This container controls the size of the map
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 relative z-0">
      <LeafletMap reports={mapReports} />
    </div>
  );
}