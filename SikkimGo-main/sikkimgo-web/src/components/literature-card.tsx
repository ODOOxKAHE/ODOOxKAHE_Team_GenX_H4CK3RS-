// src/components/literature-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Book, Newspaper, FileText } from "lucide-react";
import type { LiteratureItem } from "@/lib/literature";
import { AspectRatio } from "./ui/aspect-ratio";

const typeIcons: { [key: string]: React.ElementType } = {
  "Story Book": Book,
  "Magazine": Newspaper,
  "Journal": FileText,
  "Report": FileText,
};

export default function LiteratureCard({ item }: { item: LiteratureItem }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const Icon = typeIcons[item.type] || BookOpen;
  const aspectRatio = item.type === "Story Book" ? 16 / 9 : 3 / 4;

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="p-0 flex-grow relative">
          <AspectRatio ratio={aspectRatio} className="absolute inset-0">
            {item.cover_page_url ? (
              <Image
                src={item.cover_page_url}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint="book cover"
              />
            ) : (
              <div className="bg-secondary flex items-center justify-center h-full">
                <Icon className="w-16 h-16 text-muted-foreground/50"/>
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <div className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-bold leading-tight pr-4">{item.name}</CardTitle>
              <Badge variant="secondary" className="whitespace-nowrap shrink-0">{item.type}</Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-secondary/30">
            <Button onClick={() => setIsPopupOpen(true)} className="w-full">
              <BookOpen className="mr-2 h-4 w-4" />
              Read
            </Button>
          </CardFooter>
        </div>
      </Card>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-4xl w-11/12 h-[90vh] flex flex-col p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.type}</DialogDescription>
          </DialogHeader>
          <div className="flex-grow mt-4 overflow-hidden">
            {item.type === "Story Book" ? (
              <iframe
                allowFullScreen={true}
                allow="clipboard-write"
                scrolling="no"
                className="fp-iframe"
                src={item.embed_url}
                style={{ border: "1px solid lightgray", width: "100%", height: "100%" }}
              ></iframe>
            ) : (
              <iframe
                frameBorder="0"
                allowTransparency
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none" }}
                src={item.embed_url}
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
