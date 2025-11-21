"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function IncidentMap({ reports }) {
  const [mapReports, setMapReports] = useState([]);

  useEffect(() => {
    setMapReports(reports || []);
  }, [reports]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <LeafletMap reports={mapReports} />
    </div>
  );
}