import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLakes } from "@/lib/lakes";
import Image from "next/image";
import { Waves } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default async function LakesPage() {
  const lakes = await fetchLakes();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Lakes of Sikkim
          </h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
            Discover the pristine and serene lakes that adorn the landscape of Sikkim, each with its own unique charm and story.
          </p>

          <div className="max-w-4xl mx-auto space-y-8">
            {lakes.map((lake) => (
              <Card key={lake.id} className="shadow-lg overflow-hidden">
                 <CardHeader className="bg-background/80 flex flex-row items-center gap-3 space-y-0">
                    <Waves className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">
                        {lake.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="w-full mb-6">
                        <AspectRatio ratio={16 / 9}>
                            <Image
                                src={`http://www.sikkimeccl.gov.in/${lake.img}`}
                                alt={lake.name}
                                fill
                                className="object-cover rounded-lg shadow-lg"
                                data-ai-hint="lake landscape"
                            />
                        </AspectRatio>
                    </div>
                  <p className="text-base text-foreground/90 leading-relaxed text-justify">
                    {lake.desc}
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
