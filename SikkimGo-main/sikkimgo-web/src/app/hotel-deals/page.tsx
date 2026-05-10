// src/app/hotel-deals/page.tsx
"use client";

import { useState, useMemo } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import Image from "next/image";
import {
  BedDouble,
  CalendarIcon,
  Star,
  Users,
  CheckCircle2,
  Minus,
  Plus
} from "lucide-react";
import { Badge } from '@/components/ui/badge';

const hotelResultsData = [
    {
        id: 1,
        name: "Garden Retreat Hotel",
        rating: 3.8,
        reviews: 503,
        location: "Satyarupa",
        price: 979,
        taxes: 117,
        imageUrl: "https://picsum.photos/seed/hotel1/400/300",
        tags: ["MMT ValueStays", "Sponsored"],
        features: ["50% Discount On Room Upgrade", "Peaceful mountain views, serene environment, spacious and clean rooms"],
    },
    {
        id: 2,
        name: "Vivanta Sikkim, Pakyong",
        rating: 4.6,
        reviews: 111,
        location: "Namchey-Bung | 8.8 km drive to Pakyong Airport (PYG)",
        price: 5829,
        taxes: 291,
        imageUrl: "https://picsum.photos/seed/hotel2/400/300",
        tags: ["MMTLuxe"],
        features: ["15% off on session of Spa", "Breakfast Included", "Nestled in serene surroundings, informative treks, temperature-controlled swimming pool"],
    },
    {
        id: 3,
        name: "KINGSWAY BOUTIQUE HOTEL",
        rating: 4.1,
        reviews: 292,
        location: "MG Marg | 6 minutes walk to MG Marg Market",
        price: 2043,
        taxes: 244,
        imageUrl: "https://picsum.photos/seed/hotel3/400/300",
        tags: ["Sponsored"],
        features: ["Stunning mountain views, proximity to MG Marg, 24-hour hot water and centralized AC"],
    },
    {
        id: 4,
        name: "Jain Group Hotel Potala",
        rating: 3.7,
        reviews: 1460,
        location: "Tibet Road | 6 minutes walk to MG Marg Market",
        price: 1635,
        taxes: 210,
        imageUrl: "https://picsum.photos/seed/hotel4/400/300",
        tags: ["MMT ValueStays"],
        features: ["Room Upgrade", "Prime location near MG Marg, supportive staff, budget-friendly with clean, well-maintained rooms"],
    },
    {
        id: 5,
        name: "Tara's Homestay | Gangtok",
        rating: 4.2,
        reviews: 75,
        location: "Tadong",
        price: 1885,
        taxes: 220,
        imageUrl: "https://picsum.photos/seed/hotel5/400/300",
        tags: ["New to MakeMyTrip"],
        features: ["Private Room in a Homestay", "Free Cancellation till 24 hrs before check in"],
    }
];

const GuestSelector = ({ rooms, setRooms, adults, setAdults, children, setChildren }: any) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="rooms">Rooms</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRooms(Math.max(1, rooms - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input id="rooms" type="number" value={rooms} readOnly className="w-12 h-8 text-center px-1" />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRooms(rooms + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="adults">Adults</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAdults(Math.max(1, adults - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input id="adults" type="number" value={adults} readOnly className="w-12 h-8 text-center px-1" />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAdults(adults + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="children">Children</Label>
                    <p className="text-xs text-muted-foreground">0-17 years old</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setChildren(Math.max(0, children - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input id="children" type="number" value={children} readOnly className="w-12 h-8 text-center px-1" />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setChildren(children + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
            <Button className="w-full">Apply</Button>
        </div>
    )
}

const HotelCard = ({ hotel }: { hotel: typeof hotelResultsData[0] }) => {
    const ratingText = hotel.rating >= 4.5 ? "Excellent" : hotel.rating >= 3.5 ? "Very Good" : "Good";

    return (
        <Card className="overflow-hidden shadow-md transition-shadow hover:shadow-lg">
            <CardContent className="p-4 grid md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                    <h3 className="text-xl font-bold mt-2">{hotel.name}</h3>
                    <div className="flex items-center mt-1">
                        {Array(Math.floor(hotel.rating)).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{hotel.location}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        {hotel.features.map(feature => (
                            <div key={feature} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0"/>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-4 flex flex-col items-end justify-between text-right">
                    <div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="font-semibold">{ratingText}</span>
                            <Badge className="bg-blue-600 text-white hover:bg-blue-700">{hotel.rating.toFixed(1)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">({hotel.reviews} Ratings)</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-3xl font-bold">INR {hotel.price.toLocaleString()}</p>
                        <Button size="sm" className="mt-4 w-full">Book</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function HotelDealsPage() {
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date("2025-10-01"));
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(new Date("2025-10-08"));
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [sortKey, setSortKey] = useState<'rating' | 'price_desc' | 'price_asc'>('rating');

    const totalGuests = adults + children;

    const sortedHotelResults = useMemo(() => {
        const hotels = [...hotelResultsData];
        switch (sortKey) {
            case 'price_desc':
                return hotels.sort((a, b) => (b.price) - (a.price));
            case 'price_asc':
                return hotels.sort((a, b) => (a.price) - (b.price));
            case 'rating':
            default:
                return hotels.sort((a, b) => b.rating - a.rating);
        }
    }, [sortKey]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary/10">
            <div className="container mx-auto py-8">
                <Card className="shadow-lg mb-6">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                             <div className="md:col-span-3">
                                <Label htmlFor="location">City, Area or Property</Label>
                                <Input id="location" defaultValue="Gangtok" className="mt-1"/>
                            </div>
                             <div className="md:col-span-2">
                                <Label htmlFor="checkin">Check-in</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="checkin" variant="outline" className="w-full justify-start font-normal mt-1">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkInDate ? format(checkInDate, "EEE, MMM d") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="md:col-span-2">
                                <Label htmlFor="checkout">Check-out</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="checkout" variant="outline" className="w-full justify-start font-normal mt-1">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkOutDate ? format(checkOutDate, "EEE, MMM d") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="md:col-span-3">
                                <Label htmlFor="guests">Rooms &amp; Guests</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="guests" variant="outline" className="w-full justify-start font-normal mt-1">
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>{rooms} Room{rooms > 1 ? 's' : ''}, {totalGuests} Guest{totalGuests > 1 ? 's' : ''}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                       <GuestSelector 
                                            rooms={rooms} setRooms={setRooms}
                                            adults={adults} setAdults={setAdults}
                                            children={children} setChildren={setChildren}
                                       />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="md:col-span-2">
                                <Button className="w-full h-12 text-lg">SEARCH</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <section className="lg:col-span-12">
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 my-4 border-y py-2">
                            <span className="text-sm font-bold">Sort By</span>
                             <Button variant={sortKey === 'rating' ? 'secondary': 'ghost'} size="sm" className="rounded-full" onClick={() => setSortKey('rating')}>User Rating (Highest First)</Button>
                             <Button variant={sortKey === 'price_desc' ? 'secondary': 'ghost'} size="sm" className="rounded-full" onClick={() => setSortKey('price_desc')}>Price (Highest First)</Button>
                             <Button variant={sortKey === 'price_asc' ? 'secondary': 'ghost'} size="sm" className="rounded-full" onClick={() => setSortKey('price_asc')}>Price (Lowest First)</Button>
                        </div>
                       
                        <div className="space-y-6">
                            {sortedHotelResults.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
                        </div>
                   </section>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
