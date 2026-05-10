import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Watch, Mountain, Users } from "lucide-react";
import ItineraryPlanner from "@/components/itinerary-planner";
import { destinations, districts } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin } from 'lucide-react';

const getImage = (id: string) => {
  return PlaceHolderImages.find(img => img.id === id);
}

export default function Home() {
  const heroImage = getImage('hero-background');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section id="hero" className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center text-white overflow-hidden">
          {heroImage && (
              <Image
                src="/hero-bg.jpg"
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container mx-auto px-4 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">SikkimGo</h1>
              <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90">
                Discover the hidden paradise of the Himalayas. Your adventure begins here.
              </p>
              <Button asChild className="mt-8" size="lg">
                <a href="#planner">Plan Your Trip</a>
              </Button>
          </div>
        </section>

        {/*
        <section id="destinations" className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">Must-Visit Places</h2>
            <p className="mt-2 text-center text-muted-foreground max-w-2xl mx-auto">Explore the breathtaking destinations that make Sikkim a traveler's dream.</p>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="mt-12 w-full"
            >
              <CarouselContent>
                {destinations.map((destination) => {
                  const image = getImage(destination.id);
                  return (
                    <CarouselItem key={destination.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col h-full">
                          <CardHeader className="p-0">
                            <div className="aspect-w-4 aspect-h-3">
                              {image && (
                                <Image
                                  src={image.imageUrl}
                                  alt={destination.name}
                                  width={600}
                                  height={400}
                                  className="object-cover w-full h-full"
                                  data-ai-hint={image.imageHint}
                                />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 flex-grow">
                            <CardTitle className="font-headline text-2xl">{destination.name}</CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              {destination.location}
                            </CardDescription>
                          </CardContent>
                          <CardFooter className="p-6 bg-secondary/30 flex justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-accent" />
                              <span>{destination.bestTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Watch className="w-4 h-4 text-accent" />
                              <span>{destination.duration}</span>
                            </div>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
*/}
        <section id="districts" className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">Explore the Districts</h2>
            <p className="mt-2 text-center text-muted-foreground max-w-2xl mx-auto">Each district in Sikkim offers a unique blend of culture, nature, and adventure.</p>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="mt-12 w-full"
            >
              <CarouselContent>
                {districts.map((district) => {
                  const image = getImage(district.id);
                  return (
                    <CarouselItem key={district.id} className="md:basis-1/2 lg:basis-1/3">
                       <div className="p-1 h-full">
                        <Card className="overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-2xl flex flex-col h-full rounded-xl">
                            <CardHeader className="p-0 relative">
                                <div className="aspect-w-4 aspect-h-3">
                                {image && (
                                    <Image
                                    src={image.imageUrl}
                                    alt={district.name}
                                    width={400}
                                    height={300}
                                    className="object-cover w-full h-full"
                                    data-ai-hint={image.imageHint}
                                    />
                                )}
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow flex flex-col text-center">
                                <CardTitle className="font-headline text-2xl">{district.name}</CardTitle>
                                <div className="flex justify-center items-center gap-4 text-muted-foreground text-sm mt-2">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4"/>
                                        <span>{district.population}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mountain className="w-4 h-4"/>
                                        <span>{district.altitude}</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground flex-grow">{district.description}</p>
                                <div className="mt-6">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4">Popular Places</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {district.popular_places.map(place => (
                                            <div key={place} className="bg-background/60 rounded-full px-3 py-2 text-sm flex items-center gap-2 justify-start">
                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                <span className="truncate">{place}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>

        <section id="planner" className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">AI-Powered Itinerary Planner</h2>
            <p className="mt-2 text-center text-muted-foreground max-w-2xl mx-auto">Tell us your preferences, and our AI will craft a personalized journey just for you.</p>
            <div className="mt-12 max-w-4xl mx-auto">
              <ItineraryPlanner />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
