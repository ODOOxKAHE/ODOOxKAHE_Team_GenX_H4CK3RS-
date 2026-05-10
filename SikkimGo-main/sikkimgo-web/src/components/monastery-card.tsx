

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monastery } from "@/lib/tourist-spots-data";
import { MapPin, Eye, Building2, Video } from "lucide-react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import AFrame360Video from "./aframe-360-video";

export default function MonasteryCard({ monastery, isFirst }: { monastery: Monastery, isFirst?: boolean }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [is360Open, setIs360Open] = useState(false);
  const [is360VideoOpen, setIs360VideoOpen] = useState(false);
  const videoUrl = "/videos/ngadak.mp4";

  return (
    <>
      <Card
        className="overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col h-full"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardHeader className="p-0">
          <AspectRatio ratio={4 / 3}>
            {monastery.img ? (
              <Image
                src={`http://www.sikkimeccl.gov.in/${monastery.img}`}
                alt={monastery.name}
                fill
                className="object-cover"
                data-ai-hint="monastery building"
              />
            ) : (
              <div className="bg-secondary flex items-center justify-center h-full">
                <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-bold mb-2">{monastery.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{monastery.loc}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-2/3 h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl">{monastery.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2">
              <MapPin className="w-4 h-4 text-primary" />
              {monastery.loc}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="pt-4 grid gap-6">
                <div className="w-full max-w-md mx-auto">
                    <AspectRatio ratio={16 / 9}>
                        {monastery.img ? (
                        <Image
                            src={`http://www.sikkimeccl.gov.in/${monastery.img}`}
                            alt={monastery.name}
                            fill
                            className="object-cover rounded-lg shadow-lg"
                        />
                        ) : (
                        <div className="bg-secondary rounded-lg flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No Image Available</p>
                        </div>
                        )}
                    </AspectRatio>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                    <p className="text-base text-foreground/90 leading-relaxed text-justify">{monastery.desc}</p>
                </div>
                <div className="flex justify-center gap-4">
                    {monastery.gm_360_embed_url && (
                        <Button onClick={(e) => { e.stopPropagation(); setIs360Open(true); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View 360°
                        </Button>
                    )}
                        <Button asChild>
                           <Link href="https://my.matterport.com/show" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Building2 className="mr-2 h-4 w-4" />
                                3D Tour
                           </Link>
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); setIs360VideoOpen(true); }}>
                           <Video className="mr-2 h-4 w-4" />
                           360 Video
                        </Button>
                </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {monastery.gm_360_embed_url && (
        <Dialog open={is360Open} onOpenChange={setIs360Open}>
            <DialogContent className="max-w-3xl h-[80vh] p-0 flex flex-col">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle>360° View of {monastery.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-1">
                    <iframe 
                        src={monastery.gm_360_embed_url} 
                        width="100%" 
                        height="100%" 
                        style={{border:0}} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
      )}

          <Dialog open={is360VideoOpen} onOpenChange={setIs360VideoOpen}>
              <DialogContent className="max-w-4xl w-full h-[90vh] p-0 flex flex-col">
                  <DialogHeader className="p-4 pb-0">
                      <DialogTitle>360° Video Tour</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1">
                      <AFrame360Video videoUrl={videoUrl} />
                  </div>
              </DialogContent>
          </Dialog>
    </>
  );
}
