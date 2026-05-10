

import {
  Landmark, Globe, Mountain, Church, PawPrint, Bell, Building2, Leaf, ShoppingCart, Utensils, Unplug, Sofa, Bird, Home, Footprints, Waves, Calendar, Car, Flag, Users, Ribbon,
} from 'lucide-react';

export const filterCategories = [
    { id: 'historical', label: 'Historical', icon: Landmark },
    { id: 'cultural', label: 'Cultural', icon: Globe },
    { id: 'natural', label: 'Natural', icon: Mountain },
    { id: 'religious', label: 'Religious', icon: Church },
    { id: 'adventure', label: 'Adventure', icon: Footprints },
    { id: 'wildlife', label: 'Wildlife & Nature', icon: PawPrint },
    { id: 'hill-stations', label: 'Hill Stations', icon: Bell },
    { id: 'urban', label: 'Urban & Modern', icon: Building2 },
    { id: 'wellness', label: 'Wellness & Retreat', icon: Leaf },
    { id: 'shopping', label: 'Shopping & Markets', icon: ShoppingCart },
    { id: 'food', label: 'Food & Culinary', icon: Utensils },
    { id: 'unesco', label: 'UNESCO World Heritage', icon: Unplug },
    { id: 'leisure', label: 'Leisure', icon: Sofa },
    { id: 'spiritual', label: 'Spiritual', icon: Bird },
    { id: 'eco', label: 'Eco & Sustainable', icon: Leaf },
    { id: 'rural', label: 'Rural & Village', icon: Home },
    { id: 'trekking', label: 'Trekking & Trails', icon: Footprints },
    { id: 'lakes', label: 'Lakes & Water', icon: Waves },
    { id: 'festivals', label: 'Festivals & Events', icon: Calendar },
    { id: 'scenic-drives', label: 'Scenic Drives &', icon: Car },
    { id: 'memorials', label: 'Freedom Fighters Memorials', icon: Flag },
    { id: 'statues', label: 'Statues & Sculptures', icon: Users },
    { id: 'martyrs', label: 'Army Martyrs', icon: Ribbon },
];

export const districts = [
    { id: "gangtok", name: "Gangtok" },
    { id: "namchi", name: "Namchi" },
    { id: "mangan", name: "Mangan" },
    { id: "gezing", name: "Geyzing" },
    { id: "pakyong", name: "Pakyong" },
    { id: "soreng", name: "Soreng" },
]

export const regions = [
    { id: 'East', name: 'East Sikkim' },
    { id: 'West', name: 'West Sikkim' },
    { id: 'North', name: 'North Sikkim' },
    { id: 'South', name: 'South Sikkim' },
];

// New data structure based on the API
export interface SikkimSpot {
    id: string;
    name: string;
    district: string;
    location: string;
    short_desc: string;
    bg_img: string;
    tags: string[];
    desc: string;
    dist: string;
    imgs: string[];
    pois: {
        name: string;
        desc: string;
        imgs: string[];
    }[];
    fss: {
        img: string;
        name: string;
        tags: string[];
    }[];
    ses: {
        hs: { img: string; name: string; tags: string[] };
        ps: { img: string; name: string; tags: string[] };
    };
    acc: {
        eat: { name: string; phone: string; location: string; }[];
        stay: { name:string; phone: string; location: string; }[];
    };
    shops: {
        img: string;
        desc: string;
        name: string;
    }[];
    maps: {
        name: 'By Air' | 'By Car' | 'By Train';
        desc: string;
    }[];
}

export interface Monastery {
  id: string;
  name: string;
  loc: string;
  district: string;
  img: string | null;
  desc: string;
  type: 'Monastry' | 'Manilakhang';
  gm_360_embed_url?: string;
}

const API_URL = 'https://api.jsonsilo.com/public/f8162a92-bce8-41da-b535-54924b5af7b7';

async function fetchData() {
    try {
        const response = await fetch(API_URL, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return null;
    }
}

// Function to fetch all tourist spots
export async function fetchTouristSpots(): Promise<SikkimSpot[]> {
  const responseData = await fetchData();
  if (!responseData || !responseData.t_spots) return [];
  
  const data: Omit<SikkimSpot, 'id'>[] = responseData.t_spots;
  // Add an ID to each spot based on its name
  return data.map(spot => ({
    ...spot,
    id: spot.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Function to get a single tourist spot by its ID
export async function getTouristSpotById(id: string): Promise<SikkimSpot | null> {
  const spots = await fetchTouristSpots();
  const spot = spots.find(s => s.id === id);
  return spot || null;
}

export async function fetchMonasteries(): Promise<Monastery[]> {
    const responseData = await fetchData();
    if (!responseData || !responseData.monastries) return [];

    const data: Omit<Monastery, 'id' | 'district'>[] = responseData.monastries;
    return data.map((monastery) => {
        return {
            ...monastery,
            id: monastery.name.toLowerCase().replace(/\s+/g, '-'),
            district: monastery.loc // Keep the original location string
        };
    });
}


// Legacy types for compatibility if needed, can be removed later
export type TouristSpot = {
  id: string;
  name: string;
  district: string;
  categories: string[];
  imageUrl: string;
  imageHint: string;
};

export type Photo = {
    url: string;
    alt: string;
}
export interface SpotDetail {
    altitude: string;
    location: string;
    bestTimeToVisit: string;
    about: string;
    photos: Photo[];
    pointsOfInterest: {
        name: string;
        description: string;
        imageUrl: string;
    }[];
    facilities: {
        name: string;
        details: string;
    }[];
    accommodation: {
        name: string;
        type: 'hotel' | 'restaurant';
        description: string;
        distance: string;
    }[];
    safety: {
        name: string;
        type: 'police' | 'hospital';
        address: string;
        phone: string;
    }[];
    howToReach: {
        road: string;
        rail: string;
        air: string;
    };
}
