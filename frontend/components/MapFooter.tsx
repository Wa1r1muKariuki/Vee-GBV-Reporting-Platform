"use client";
import React from "react";

export default function MapFooter() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-3 text-center text-sm text-gray-600">
      <p>
        Data source: Survivor-submitted reports | Visualization ©{" "}
        <a
          href="https://openstreetmap.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-700 font-semibold"
        >
          OpenStreetMap
        </a>
      </p>
    </footer>
  );
}
