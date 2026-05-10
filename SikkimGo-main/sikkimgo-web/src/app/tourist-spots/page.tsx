
"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import TouristSpotFilters from "@/components/tourist-spot-filters";
import { fetchTouristSpots, SikkimSpot } from "@/lib/tourist-spots-data";
import TouristSpotCard from "@/components/tourist-spot-card";

export default function TouristSpotsPage() {
  const [spots, setSpots] = useState<SikkimSpot[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadSpots() {
      setLoading(true);
      const fetchedSpots = await fetchTouristSpots();
      setSpots(fetchedSpots);
      setLoading(false);
    }
    loadSpots();
  }, []);


  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => 
        spot.tags.some(tag => 
          tag.toLowerCase().includes(cat.toLowerCase()) || 
          cat.toLowerCase().includes(tag.toLowerCase())
        )
      );
      const districtMatch = selectedDistrict === 'all' || spot.district.toLowerCase() === selectedDistrict.toLowerCase();
      const searchMatch = searchTerm === '' ||
                          spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spot.short_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spot.location.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryMatch && districtMatch && searchMatch;
    });
  }, [spots, selectedCategories, selectedDistrict, searchTerm]);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedDistrict('all');
    setSearchTerm('');
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Discover Sikkim's Treasures
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Filter through a comprehensive list of tourist spots to find your next adventure.
          </p>
          <TouristSpotFilters
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onClear={handleClearFilters}
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="bg-gray-200 h-40 w-full rounded animate-pulse"></div>
                    <div className="mt-4 h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                     <div className="mt-2 h-8 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {filteredSpots.map((spot: SikkimSpot) => (
                <TouristSpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
