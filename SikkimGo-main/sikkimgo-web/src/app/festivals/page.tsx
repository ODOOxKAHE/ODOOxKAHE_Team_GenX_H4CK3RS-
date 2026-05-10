import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { festivals } from "@/lib/festivals";
import { Calendar } from "lucide-react";

export default function FestivalsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Buddhist Festivals of Sikkim
          </h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
            Discover the rich cultural and religious tapestry of Sikkim through its vibrant Buddhist festivals. Each festival is a unique celebration of faith, tradition, and community.
          </p>

          <div className="max-w-4xl mx-auto space-y-6">
            {festivals.map((festival, index) => (
              <Card key={index} className="shadow-lg overflow-hidden">
                <CardHeader className="bg-background/80">
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary"/>
                    {festival.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-base text-foreground/90 leading-relaxed text-justify">
                    {festival.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
