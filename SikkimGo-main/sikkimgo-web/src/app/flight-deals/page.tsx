// src/app/flight-deals/page.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CalendarIcon,
  Trash2,
  SlidersHorizontal,
  Users,
  Plus,
  Minus
} from "lucide-react";

const allFlightResults = [
    {
        outbound: {
            airline: "Akasa Air",
            departureTime: "08:20",
            departureAirportCode: "BOM",
            departureCity: "Mumbai",
            duration: "03h 10m",
            stops: "Non stop",
            arrivalTime: "11:30",
            arrivalAirportCode: "IXB",
            arrivalCity: "Bagdogra",
            price: "6,908",
        },
        return: {
            airline: "Akasa Air",
            departureTime: "12:00",
            departureAirportCode: "IXB",
            departureCity: "Bagdogra",
            duration: "03h 15m",
            stops: "Non stop",
            arrivalTime: "15:15",
            arrivalAirportCode: "BOM",
            arrivalCity: "Mumbai",
            price: "7,123",
        }
    },
    {
        outbound: {
            airline: "Air India Express",
            departureTime: "02:15",
            departureAirportCode: "BOM",
            departureCity: "Mumbai",
            duration: "16h 20m",
            stops: "1 stop via New...",
            arrivalTime: "18:35",
            arrivalAirportCode: "IXB",
            arrivalCity: "Bagdogra",
            price: "8,084",
        },
        return: {
            airline: "Air India Express",
            departureTime: "09:45",
            departureAirportCode: "IXB",
            departureCity: "Bagdogra",
            duration: "14h 50m",
            stops: "1 stop via New...",
            arrivalTime: "00:35",
            arrivalAirportCode: "BOM",
            arrivalCity: "Mumbai",
            price: "8,200",
        }
    },
    {
        outbound: {
            airline: "IndiGo",
            departureTime: "05:50",
            departureAirportCode: "BOM",
            departureCity: "Mumbai",
            duration: "05h 20m",
            stops: "1 stop via DEL",
            arrivalTime: "11:10",
            arrivalAirportCode: "IXB",
            arrivalCity: "Bagdogra",
            price: "7,500",
        },
        return: {
            airline: "IndiGo",
            departureTime: "18:00",
            departureAirportCode: "IXB",
            departureCity: "Bagdogra",
            duration: "06h 30m",
            stops: "1 stop via CCU",
            arrivalTime: "00:30",
            arrivalAirportCode: "BOM",
            arrivalCity: "Mumbai",
            price: "7,800",
        }
    },
    {
        outbound: {
            airline: "Vistara",
            departureTime: "11:00",
            departureAirportCode: "BOM",
            departureCity: "Mumbai",
            duration: "03h 05m",
            stops: "Non stop",
            arrivalTime: "14:05",
            arrivalAirportCode: "IXB",
            arrivalCity: "Bagdogra",
            price: "9,200",
        },
        return: {
            airline: "Vistara",
            departureTime: "15:00",
            departureAirportCode: "IXB",
            departureCity: "Bagdogra",
            duration: "03h 10m",
            stops: "Non stop",
            arrivalTime: "18:10",
            arrivalAirportCode: "BOM",
            arrivalCity: "Mumbai",
            price: "9,500",
        }
    },
    {
        outbound: {
            airline: "SpiceJet",
            departureTime: "20:30",
            departureAirportCode: "BOM",
            departureCity: "Mumbai",
            duration: "12h 05m",
            stops: "1 stop via GAU",
            arrivalTime: "08:35",
            arrivalAirportCode: "IXB",
            arrivalCity: "Bagdogra",
            price: "6,500",
        },
        return: {
            airline: "SpiceJet",
            departureTime: "09:15",
            departureAirportCode: "IXB",
            departureCity: "Bagdogra",
            duration: "15h 00m",
            stops: "1 stop via DEL",
            arrivalTime: "00:15",
            arrivalAirportCode: "BOM",
            arrivalCity: "Mumbai",
            price: "6,800",
        }
    }
];

const FlightDetailCard = ({ flight, direction } : { flight: any, direction: 'outbound' | 'return' }) => (
    <Card className="shadow-none border-dashed">
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-base font-semibold">
                {direction === 'outbound' ? 'Mumbai → Bagdogra' : 'Bagdogra → Mumbai'}
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">{flight.airline}</p>
        </CardHeader>
        <CardContent>
             <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{flight.departureTime}</p>
                            <p className="text-sm text-muted-foreground">{flight.departureAirportCode}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm">{flight.duration}</p>
                            <div className="w-full h-px bg-border my-1"></div>
                            <p className="text-xs text-muted-foreground">{flight.stops}</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{flight.arrivalTime}</p>
                            <p className="text-sm text-muted-foreground">{flight.arrivalAirportCode}</p>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);


const FlightResultCard = ({ result }: { result: typeof allFlightResults[0] }) => {
    const totalPrice = (parseInt(result.outbound.price.replace(/,/g, '')) + parseInt(result.return.price.replace(/,/g, ''))).toLocaleString();

    return (
        <Card className="mb-4 transition-shadow hover:shadow-lg">
            <CardContent className="p-4 grid md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-10">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FlightDetailCard flight={result.outbound} direction="outbound" />
                        <FlightDetailCard flight={result.return} direction="return" />
                    </div>
                </div>
                <div className="md:col-span-2 flex flex-col items-center justify-center text-center gap-2 md:border-l md:pl-4">
                    <div>
                        <p className="text-2xl font-bold">INR {totalPrice}</p>
                        <p className="text-xs text-muted-foreground">Total (Round Trip)</p>
                    </div>
                    <Button className="w-full">Book Now</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PassengerSelector = ({ adults, setAdults, children, setChildren, travelClass, setTravelClass }: any) => {
    return (
        <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">2-12 yrs</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setChildren(Math.max(0, children - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input id="children" type="number" value={children} readOnly className="w-12 h-8 text-center px-1" />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setChildren(children + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
             <div>
                <Label>Travel Class</Label>
                 <Select value={travelClass} onValueChange={setTravelClass}>
                    <SelectTrigger className="mt-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default function FlightDealsPage() {
    const [departDate, setDepartDate] = useState<Date | undefined>(new Date("2025-10-01"));
    const [returnDate, setReturnDate] = useState<Date | undefined>(new Date("2025-10-08"));
    const [showResults, setShowResults] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [travelClass, setTravelClass] = useState("economy");

    const handleSearch = () => {
        setShowResults(true);
    };

    const handleClear = () => {
        setShowResults(false);
    }
    
    const totalPassengers = adults + children;

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
                    Find the Best Flight Deals
                </h1>
                <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
                    Compare and book cheap flights to your favorite destinations.
                </p>
                <Card className="shadow-lg">
                    <CardContent className="p-4 md:p-6">
                         <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Search Flights</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClear}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="from">From</Label>
                                        <Input id="from" defaultValue="Mumbai, India"/>
                                    </div>
                                    <div>
                                        <Label htmlFor="depart">Depart</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="depart" variant="outline" className="w-full justify-start font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {departDate ? format(departDate, "EEE, MMM d") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={departDate} onSelect={setDepartDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="to">To</Label>
                                        <Input id="to" defaultValue="Gangtok, India"/>
                                    </div>
                                    <div>
                                        <Label htmlFor="return">Return</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button id="return" variant="outline" className="w-full justify-start font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {returnDate ? format(returnDate, "EEE, MMM d") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-4 border-t">
                               <div>
                                    <Label>Passengers &amp; Class</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start font-normal mt-2">
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>{totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}, {travelClass.charAt(0).toUpperCase() + travelClass.slice(1)}</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <PassengerSelector
                                                adults={adults}
                                                setAdults={setAdults}
                                                children={children}
                                                setChildren={setChildren}
                                                travelClass={travelClass}
                                                setTravelClass={setTravelClass}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label className="text-sm">Fare Type</Label>
                                     <RadioGroup defaultValue="regular" className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="regular" id="regular" />
                                            <Label htmlFor="regular" className="font-normal text-sm">Regular</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="student" id="student" />
                                            <Label htmlFor="student" className="font-normal text-sm">Student</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="senior" id="senior" />
                                            <Label htmlFor="senior" className="font-normal text-sm">Senior Citizen</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="armed" id="armed" />
                                            <Label htmlFor="armed" className="font-normal text-sm">Armed Forces</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="doctor" id="doctor" />
                                            <Label htmlFor="doctor" className="font-normal text-sm">Doctor and Nurses</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                             <Button size="lg" className="w-full md:w-auto h-12 text-xl font-bold tracking-wider" onClick={handleSearch}>SEARCH</Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
            {showResults && (
                <div className="container mx-auto py-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Flight Results</h2>
                        <p className="text-sm text-muted-foreground">{allFlightResults.length} of {allFlightResults.length} flights</p>
                    </div>
                    <div>
                        {allFlightResults.map((result, i) => (
                            <FlightResultCard key={i} result={result} />
                        ))}
                    </div>
                </div>
            )}
        </main>
        <Footer />
    </div>
  );
}

    