// src/components/artifact-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Artifact } from "@/lib/artifacts";
import { AspectRatio } from "./ui/aspect-ratio";

export default function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <AspectRatio ratio={16 / 9}>
          <div className="sketchfab-embed-wrapper w-full h-full">
            <iframe
              title={artifact.name}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
              src={artifact.url}
              className="w-full h-full"
            ></iframe>
          </div>
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-xl">{artifact.name}</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground text-sm line-clamp-3">
          {artifact.desc}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
