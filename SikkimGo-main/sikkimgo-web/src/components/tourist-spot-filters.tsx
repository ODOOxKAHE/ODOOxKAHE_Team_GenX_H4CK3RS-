
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filterCategories, districts } from "@/lib/tourist-spots-data";
import { cn } from "@/lib/utils";
import {
  ListFilter,
  Trash2,
  SlidersHorizontal,
  Search,
  MapPin,
} from "lucide-react";

interface TouristSpotFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onClear: () => void;
}

export default function TouristSpotFilters({
  selectedCategories,
  onCategoryChange,
  selectedDistrict,
  onDistrictChange,
  searchTerm,
  onSearchTermChange,
  onClear,
}: TouristSpotFiltersProps) {
  const [showFilters, setShowFilters] = useState(true);

  const toggleCategory = (id: string) => {
    onCategoryChange(
      selectedCategories.includes(id)
        ? selectedCategories.filter(catId => catId !== id)
        : [...selectedCategories, id]
    );
  };
  
  const handleSearch = () => {
    // The search is applied live via onSearchTermChange
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Applied Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "flex items-center gap-2",
                    isSelected ? "bg-accent text-accent-foreground" : ""
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">District</label>
              <Select value={selectedDistrict} onValueChange={onDistrictChange}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select district" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district.id} value={district.name.toLowerCase()}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full relative">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative flex items-center">
                    <Input 
                      type="search" 
                      placeholder="Search in Sikkim..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
