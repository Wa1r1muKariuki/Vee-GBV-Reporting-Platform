"use client";
import React from "react";

interface Props {
  onFilterChange: (type: string) => void;
  currentFilter: string;
}

// In MapFilterBar component
const categories = ["all", "harassment", "public_violence", "femicide"];
export default function MapFilterBar({ onFilterChange, currentFilter }: Props) {
  return (
    <div className="flex justify-center items-center py-3 bg-white shadow-sm gap-3 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`capitalize px-4 py-2 rounded-full text-sm transition-all ${
            currentFilter === cat
              ? "bg-purple-700 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {cat.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
