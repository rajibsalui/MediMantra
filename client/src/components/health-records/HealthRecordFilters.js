"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function HealthRecordFilters({ activeFilter, setActiveFilter }) {
  return (
    <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
      <div className="w-40">
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="bg-white border-gray-300 text-gray-700">
            <SelectValue placeholder="All Records" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="recent">Recent Records</SelectItem>
            <SelectItem value="critical">Critical Records</SelectItem>
            <SelectItem value="active">Active Medications</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search records" 
          className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 w-full md:w-60"
        />
        <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      <button className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        More Filters
      </button>
    </div>
  );
}
