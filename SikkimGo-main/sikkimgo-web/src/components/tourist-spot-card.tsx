import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { districts, filterCategories, SikkimSpot } from "@/lib/tourist-spots-data";


export default function TouristSpotCard({ spot }: { spot: SikkimSpot }) {
  const districtName = districts.find(d => d.name.toLowerCase() === spot.district.toLowerCase())?.name;
  const spotCategories = filterCategories.filter(fc => spot.tags.includes(fc.id));

  return (
    <Link href={`/tourist-spots/${spot.id}`} className="block h-full">
        <Card className="overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg flex flex-col h-full">
        <CardHeader className="p-0">
            <div className="aspect-w-4 aspect-h-3">
            {spot.bg_img && (
                <Image
                    src={spot.bg_img}
                    alt={spot.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                    data-ai-hint={spot.short_desc}
                />
            )}
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg font-bold mb-2">{spot.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{districtName}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{spot.short_desc}</p>
        </CardContent>
        <CardFooter className="p-4 bg-secondary/30 flex flex-wrap gap-2 text-xs">
            {spotCategories.slice(0, 3).map(cat => (
                <Badge key={cat.id} variant="secondary" className="font-normal">{cat.label}</Badge>
            ))}
        </CardFooter>
        </Card>
    </Link>
  );
}
