import { Mountain, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import Image from "next/image";

const navLinks = [
    { href: "/tourist-spots", label: "Tourist Spots" },
    { href: "/monasteries", label: "Monasteries" },
    { href: "/festivals", label: "Festivals" },
    { href: "/lakes", label: "Lakes" },
    { href: "/literature", label: "Literature" },
    { href: "/artifacts", label: "Artifacts" },
    { href: "/flight-deals", label: "Flight Deals" },
    { href: "/hotel-deals", label: "Hotel Deals" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="mr-6 flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo Image"
                width={48}
                height={48}
                className="max-w-14 h-14 p-2 aspect-square"
              />
            <span className="font-bold">SikkimGo</span>
          </a>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
                <a key={link.href} href={link.href} className="transition-colors hover:text-primary">{link.label}</a>
            ))}
        </nav>

        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="p-4">
                        <div className="flex items-center mb-6">
                            <Mountain className="h-6 w-6 mr-2 text-primary" />
                            <a href="/" className="mr-6 flex items-center space-x-2">
                                <span className="font-bold">SikkimGo</span>
                            </a>
                        </div>
                        <nav className="flex flex-col space-y-4">
                            {navLinks.map(link => (
                                <a key={link.href} href={link.href} className="text-lg font-medium transition-colors hover:text-primary">{link.label}</a>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
