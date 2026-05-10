// src/app/literature/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchLiterature, LiteratureItem } from "@/lib/literature";
import LiteratureCard from "@/components/literature-card";
import { BookOpen } from "lucide-react";

export default async function LiteraturePage() {
  const literature = await fetchLiterature();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <BookOpen className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl md:text-4xl font-headline font-bold text-foreground">
              Sikkim's Literature
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
              Explore a collection of story books, magazines, and other publications from the region.
            </p>
          </div>

          {literature.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {literature.map((item) => (
                <LiteratureCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No literature items found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
