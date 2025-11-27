"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different incident types
const incidentIcons = {
  physical_violence: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  sexual_violence: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  harassment: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  emotional_abuse: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  domestic_violence: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  }),
  other: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  })
};

export default function LeafletMap({ reports = [] }) { 
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; 

    // Initialize map centered on Kenya
    const map = L.map(mapRef.current).setView([-1.286389, 36.817223], 7); 
    
    // LIGHT MODE tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Updates to Reports Data
  useEffect(() => {
    if (!mapInstanceRef.current || !reports.length) return;

    const map = mapInstanceRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markers = [];

    reports.forEach((report) => {
      const lat = Number(report.lat);
      const lng = Number(report.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const typeKey = report.type ? report.type.toLowerCase() : 'other';
        const icon = incidentIcons[typeKey] || incidentIcons.other;
        
        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`
             <div class="p-3 min-w-[200px] text-slate-800 font-sans">
          <strong class="text-sm uppercase font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 block">
            ${report.type?.replace(/_/g, ' ') || 'Incident'}
          </strong>
          <div class="text-xs mt-2">
            <div class="font-semibold">County: ${report.county || 'Unknown'}</div>
            ${report.area ? `<div class="font-semibold">Area: ${report.area}</div>` : ''}
            ${report.timeframe ? `<div class="text-slate-600">When: ${report.timeframe}</div>` : ''}
            ${report.relationship ? `<div class="text-slate-600">Relationship: ${report.relationship}</div>` : ''}
          </div>
          <div class="text-[10px] text-slate-500 mt-1 italic">
            Verified • Anonymized Location
          </div>
        </div>
      `);
      
    markers.push(marker);
  }
});
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      try {
        map.fitBounds(group.getBounds().pad(0.1));
      } catch (e) {
        console.log("Bounds error (safe to ignore if 1 marker):", e);
      }
    }

  }, [reports]);

  return <div ref={mapRef} className="w-full h-full z-0 bg-slate-100" />;
}