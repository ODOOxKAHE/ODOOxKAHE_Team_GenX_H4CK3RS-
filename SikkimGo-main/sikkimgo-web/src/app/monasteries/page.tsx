

"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchMonasteries, Monastery, regions } from "@/lib/tourist-spots-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Trash2, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import MonasteryCard from "@/components/monastery-card";

const monasteryTypes = [
    { id: 'Monastry', name: 'Monastery' },
    { id: 'Manilakhang', name: 'Manilakhang' },
];

export default function MonasteriesPage() {
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [firstMonasteryId, setFirstMonasteryId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMonasteries() {
      setLoading(true);
      const fetchedMonasteries = await fetchMonasteries();
      setMonasteries(fetchedMonasteries);
      if (fetchedMonasteries.length > 0) {
        setFirstMonasteryId(fetchedMonasteries[0].id);
      }
      setLoading(false);
    }
    loadMonasteries();
  }, []);

  const filteredMonasteries = useMemo(() => {
    return monasteries.filter(monastery => {
      const regionMatch = selectedRegion === 'all' || monastery.loc.toLowerCase() === selectedRegion.toLowerCase();
      const typeMatch = selectedType === 'all' || monastery.type === selectedType;
      const searchMatch = searchTerm === '' || monastery.name.toLowerCase().includes(searchTerm.toLowerCase());
      return regionMatch && searchMatch && typeMatch;
    });
  }, [monasteries, searchTerm, selectedRegion, selectedType]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedRegion('all');
    setSelectedType('all');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Monasteries of Sikkim
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore the serene and spiritual monasteries nestled in the Himalayas.
          </p>

          <Card className="p-4 md:p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Search by Name</label>
                <div className="relative flex items-center">
                  <Input
                    type="search"
                    placeholder="e.g., Rumtek Monastery..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select region" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id.toLowerCase()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {monasteryTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
            </div>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="bg-gray-200 h-40 w-full rounded animate-pulse"></div>
                  <div className="mt-4 h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMonasteries.map((monastery) => (
                <MonasteryCard key={monastery.id} monastery={monastery} isFirst={monastery.id === firstMonasteryId} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
