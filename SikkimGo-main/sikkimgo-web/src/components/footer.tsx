import { Mountain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Mountain className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold text-lg">SikkimGo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SikkimGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
