"use client";
import React from "react";

interface Report {
  id: number;
  lat: number;
  lng: number;
  type: string;
  location?: string;
  description?: string;
  timestamp?: Date;
}

export default function MapSidebar({ reports }: { reports: Report[] }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      harassment: 'bg-blue-500',
      assault: 'bg-red-500',
      femicide: 'bg-black',
      public_violence: 'bg-orange-500',
      domestic_violence: 'bg-purple-500',
      workplace_harassment: 'bg-yellow-500',
      online_harassment: 'bg-indigo-500',
      other: 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="w-full h-full p-6 bg-transparent overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-4">Reported Incidents</h2>
      <p className="text-gray-400 text-sm mb-6">
        {reports.length} incident{reports.length !== 1 ? 's' : ''} found
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No incidents match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <div
              key={report.id || i}
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(report.type)}`}></div>
                  <span className="font-semibold text-white text-sm capitalize">
                    {report.type.replace(/_/g, ' ')}
                  </span>
                </div>
                {report.timestamp && (
                  <span className="text-xs text-gray-400">
                    {formatDate(report.timestamp)}
                  </span>
                )}
              </div>
              
              {report.location && (
                <p className="text-gray-300 text-sm mb-2">
                  📍 {report.location}
                </p>
              )}
              
              {report.description && (
                <p className="text-gray-400 text-xs line-clamp-2">
                  {report.description}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  Lat: {report.lat?.toFixed(4)}, Lng: {report.lng?.toFixed(4)}
                </span>
                <span className="text-xs text-teal-400">
                  🔒 Anonymous
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}