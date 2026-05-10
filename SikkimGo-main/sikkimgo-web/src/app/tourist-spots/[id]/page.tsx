import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchTouristSpots, getTouristSpotById, SikkimSpot, filterCategories } from "@/lib/tourist-spots-data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import {
  Mountain,
  MapPin,
  Clock,
  ParkingCircle,
  Car,
  Plane,
  Train,
  ShieldCheck,
  BriefcaseMedical,
  Phone,
  Bed,
  Utensils,
  Camera,
  ShoppingBasket,
  Navigation,
  QrCode,
  Star,
  Info,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateStaticParams() {
    const spots = await fetchTouristSpots();
    return spots.map((spot) => ({
        id: spot.id,
    }));
}

const DetailSection = ({ title, subtitle, icon: Icon, children }: { title: string, subtitle: string, icon: React.ElementType, children: React.ReactNode }) => (
    <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
                <Icon className="w-8 h-8 text-primary" />
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground">{subtitle}</h3>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold">{title}</h2>
                </div>
            </div>
            {children}
        </div>
    </section>
);

const PhotoGallery = ({ photos, spotName }: { photos: string[], spotName: string }) => (
    <DetailSection title={`${spotName} Gallery`} subtitle="Explore" icon={Camera}>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {photos.map((photo, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                        <div className="overflow-hidden rounded-lg shadow-lg">
                            <AspectRatio ratio={4 / 3}>
                                <Image src={photo} alt={`${spotName} gallery image ${index + 1}`} fill className="object-cover transition-transform hover:scale-110" />
                            </AspectRatio>
                        </div>
                    </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
    </DetailSection>
);

const PointsOfInterest = ({ points, spotName }: { points: SikkimSpot['pois'], spotName: string }) => (
    <DetailSection title={`Points of Interest at ${spotName}`} subtitle="Discover" icon={Star}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map((point) => (
                <Card key={point.name} className="overflow-hidden group flex flex-col">
                    <CardHeader className="p-0">
                        <AspectRatio ratio={4 / 3}>
                            <Image src={point.imgs[0]} alt={point.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                        </AspectRatio>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="font-bold text-lg">{point.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{point.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </DetailSection>
);

const Facilities = ({ facilities }: { facilities: SikkimSpot['fss'] }) => (
    <DetailSection title="Facilities & Services" subtitle="Amenities" icon={ParkingCircle}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {facilities.map(facility => (
                <Card key={facility.name} className="text-center p-6 flex flex-col items-center justify-center relative overflow-hidden group aspect-w-4 aspect-h-5">
                    <Image src={facility.img} alt={facility.name} fill className="object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative text-white flex flex-col items-center justify-center">
                        <h3 className="font-semibold">{facility.name}</h3>
                    </div>
                </Card>
            ))}
        </div>
    </DetailSection>
);

const Accommodation = ({ accommodation }: { accommodation: SikkimSpot['acc'] }) => (
    <DetailSection title="Accommodation & Eateries" subtitle="Stay & Dine" icon={Bed}>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bed className="w-6 h-6 text-accent"/> Places to Stay</h3>
                <div className="grid grid-cols-1 gap-4">
                    {accommodation.stay.map(item => (
                        <Card key={item.name} className="p-4 relative overflow-hidden group text-white aspect-w-16 aspect-h-9">
                            <Image src="https://picsum.photos/seed/stay/400/200" alt={item.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black/60"></div>
                            <div className="relative">
                                <h4 className="font-bold">{item.name}</h4>
                                <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4"/>
                                    <span>{item.location}</span>
                                </div>
                                 <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4"/>
                                    <span>{item.phone}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Utensils className="w-6 h-6 text-accent"/> Places to Eat</h3>
                <div className="grid grid-cols-1 gap-4">
                    {accommodation.eat.map(item => (
                        <Card key={item.name} className="p-4 relative overflow-hidden group text-white aspect-w-16 aspect-h-9">
                             <Image src="https://picsum.photos/seed/eat/400/200" alt={item.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black/60"></div>
                            <div className="relative">
                                <h4 className="font-bold">{item.name}</h4>
                                 <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4"/>
                                    <span>{item.location}</span>
                                </div>
                                 <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4"/>
                                    <span>{item.phone}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    </DetailSection>
);

const Safety = ({ safety }: { safety: SikkimSpot['ses'] }) => (
    <DetailSection title="Safety & Emergency" subtitle="Your Wellbeing" icon={ShieldCheck}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 flex items-start gap-4 relative overflow-hidden group text-white aspect-w-16 aspect-h-9">
                <Image src={safety.ps.img} alt={safety.ps.name} fill className="object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative flex items-start gap-4 w-full">
                    <div className="flex-grow">
                        <h3 className="font-bold">{safety.ps.name}</h3>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {safety.ps.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-white/20 text-white">{tag}</Badge>)}
                        </div>
                    </div>
                </div>
            </Card>
             <Card className="p-6 flex items-start gap-4 relative overflow-hidden group text-white aspect-w-16 aspect-h-9">
                <Image src={safety.hs.img} alt={safety.hs.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                <div className="absolute inset-0 bg-black/60"></div>
                 <div className="relative flex items-start gap-4 w-full">
                    <div className="flex-grow">
                        <h3 className="font-bold">{safety.hs.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {safety.hs.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-white/20 text-white">{tag}</Badge>)}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </DetailSection>
);

const HowToReach = ({ howToReach }: { howToReach: SikkimSpot['maps'] }) => (
  <DetailSection title="How to Reach" subtitle="Getting There" icon={Navigation}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {howToReach.map(method => {
          let Icon = Car;
          if (method.name === 'By Air') Icon = Plane;
          if (method.name === 'By Train') Icon = Train;

          return (
            <div key={method.name} className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><Icon className="w-6 h-6 text-primary" /></div>
                <div>
                <h4 className="font-bold">{method.name}</h4>
                <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
            </div>
          )
      })}
    </div>
    <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
      <AspectRatio ratio={16/9}>
        <Image src="https://picsum.photos/seed/map/1200/675" alt="Map" fill className="object-cover" />
      </AspectRatio>
    </div>
  </DetailSection>
);

const Shops = ({shops}: {shops: SikkimSpot['shops']}) => (
    <DetailSection title="Explore Artisan Shops" subtitle="Local Crafts" icon={ShoppingBasket}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {shops.map(shop => (
            <Card key={shop.name} className="p-4 text-center relative overflow-hidden group aspect-w-4 aspect-h-5">
                 <Image src={shop.img} alt={shop.name} fill className="object-cover transition-transform group-hover:scale-110"/>
                 <div className="absolute inset-0 bg-black/60"></div>
                 <div className="relative text-white flex flex-col justify-center items-center h-full">
                    <h3 className="font-bold">{shop.name}</h3>
                    <p className="text-sm text-white/80">{shop.desc}</p>
                </div>
            </Card>
        ))}
      </div>
    </DetailSection>
);

export default async function SpotPage({ params }: { params: { id: string } }) {
  const spot = await getTouristSpotById(params.id);

  if (!spot) {
    notFound();
  }

  const spotCategories = filterCategories.filter(fc => spot.tags.includes(fc.id));


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative h-[50vh] min-h-[300px] w-full">
            <Image 
                src={spot.bg_img} 
                alt={`A breathtaking view of ${spot.name}`}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
                <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">{spot.name}</h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90">
                    {spot.location}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {spotCategories.map(cat => (
                        <Badge key={cat.id} variant="secondary" className="font-normal backdrop-blur-sm bg-white/20 text-white">{cat.label}</Badge>
                    ))}
                </div>
            </div>
        </section>

        {/* ABOUT */}
        <DetailSection title={`About ${spot.name}`} subtitle="An Introduction" icon={Info}>
            <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <MapPin className="w-10 h-10 text-primary mb-2"/>
                    <h3 className="font-bold text-lg">Location</h3>
                    <p className="text-muted-foreground">{spot.location}</p>
                </div>
                <div className="flex flex-col items-center">
                    <Building className="w-10 h-10 text-primary mb-2"/>
                    <h3 className="font-bold text-lg">Distance</h3>
                    <p className="text-muted-foreground">{spot.dist}</p>
                </div>
            </div>
            <Separator className="my-12"/>
            <div className="max-w-3xl mx-auto text-center">
                 <p className="text-muted-foreground">{spot.desc}</p>
            </div>
        </DetailSection>

        {/* GALLERY */}
        <div className="bg-secondary/30">
          <PhotoGallery photos={spot.imgs} spotName={spot.name}/>
        </div>
        
        {/* POINTS OF INTEREST */}
        <PointsOfInterest points={spot.pois} spotName={spot.name} />

        {/* FACILITIES AND SERVICES */}
        <div className="bg-secondary/30">
            <Facilities facilities={spot.fss} />
            <Safety safety={spot.ses} />
        </div>
        
        {/* ACCOMMODATIONS AND EATERIES */}
        <Accommodation accommodation={spot.acc} />

        {/* SHOPS */}
        <div className="bg-secondary/30">
            <Shops shops={spot.shops}/>
        </div>

        {/* MAP */}
        <HowToReach howToReach={spot.maps} />

        {/* VIRTUAL TOUR - Example Section */}
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <Card className="shadow-lg grid md:grid-cols-2 items-center relative overflow-hidden group">
                    <Image src="https://picsum.photos/seed/tour/1200/600" alt="Virtual tour background" fill className="object-cover transition-transform group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="p-8 relative text-white">
                        <h2 className="text-2xl font-headline font-bold">Virtual Tour</h2>
                        <p className="text-white/80 mt-2">Scan the QR code to get an immersive 360-degree view of {spot.name}.</p>
                        <Button className="mt-4">
                            <Camera className="mr-2"/>
                            Start Virtual Tour
                        </Button>
                    </div>
                    <div className="p-8 flex justify-center items-center relative">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                           <QrCode className="w-32 h-32"/>
                        </div>
                    </div>
                </Card>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
