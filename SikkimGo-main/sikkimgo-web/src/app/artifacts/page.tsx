// src/app/artifacts/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchArtifacts } from "@/lib/artifacts";
import ArtifactCard from "@/components/artifact-card";
import { Box } from "lucide-react";

export default async function ArtifactsPage() {
  const artifacts = await fetchArtifacts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <Box className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl md:text-4xl font-headline font-bold text-foreground">
              Sikkim's 3D Artifacts
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
              Explore a collection of 3D scanned historical and cultural artifacts from the region.
            </p>
          </div>

          {artifacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {artifacts.map((item) => (
                <ArtifactCard key={item.id} artifact={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No artifacts found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
