"use client";

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Filter, X } from 'lucide-react';

export default function HealthRecordFilters({ activeFilter, setActiveFilter }) {
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  
  // Predefined filter categories
  const categories = [
    { id: "all", name: "All Records" },
    { id: "cardiac", name: "Cardiac" },
    { id: "respiratory", name: "Respiratory" },
    { id: "diabetes", name: "Diabetes" },
    { id: "preventative", name: "Preventative" },
    { id: "urgent", name: "Urgent Care" },
    { id: "allergy", name: "Allergy" },
    { id: "testing", name: "Lab Testing" },
    { id: "imaging", name: "Imaging" },
    { id: "surgery", name: "Surgery" }
  ];
  
  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    searchText === "" || category.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // Handle selection of a category
  const handleSelectCategory = (categoryId) => {
    setActiveFilter(categoryId);
    setOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilter("all");
    setOpen(false);
  };
  
  // Get the display name of the active filter
  const getActiveFilterName = () => {
    const category = categories.find(c => c.id === activeFilter);
    return category ? category.name : "All Records";
  };
  
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        {activeFilter && activeFilter !== "all" && (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1">
            {getActiveFilterName()}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={clearFilters}
            />
          </Badge>
        )}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Filter className="h-4 w-4" />
              {activeFilter === "all" ? "Filter" : "Change Filter"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-4">
              <h3 className="font-medium">Filter by Category</h3>
              <Input
                placeholder="Search categories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
                {filteredCategories.map(category => (
                  <div 
                    key={category.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeFilter === category.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                    }`}
                    onClick={() => handleSelectCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    {activeFilter === category.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))}
                
                {filteredCategories.length === 0 && (
                  <div className="text-center py-2 text-gray-500">
                    No matching categories
                  </div>
                )}
              </div>
              
              {activeFilter !== "all" && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-center"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
