"use client";

import { districts } from "@/lib/data";
import { cn } from "@/lib/utils";

const districtPositions = {
  Soreng: { top: "58%", left: "15%" },
  Geyzing: { top: "45%", left: "25%" },
  Namchi: { top: "70%", left: "45%" },
  Mangan: { top: "20%", left: "50%" },
  Gangtok: { top: "50%", left: "65%" },
  Pakyong: { top: "65%", left: "70%" },
};

const DistrictShape = ({
  district,
  className,
}: {
  district: (typeof districts)[0];
  className?: string;
}) => {
  const position =
    districtPositions[district.name as keyof typeof districtPositions];
  if (!position) return null;

  const handleClick = () => {
    const section = document.getElementById('districts');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cn(
        "absolute w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center group transition-all duration-300 hover:bg-primary/40 hover:scale-110 cursor-pointer",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)",
      }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50 animate-pulse-slow"></div>
      <span className="text-center text-sm font-semibold text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {district.name}
      </span>
    </div>
  );
};

export function InteractiveSikkimMap() {
  return (
    <div className="relative w-full h-full max-w-[500px] aspect-square">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[80%] h-[80%] rounded-full bg-secondary/50"></div>
      </div>
      {districts.map((district, i) => (
        <DistrictShape key={district.id} district={district} />
      ))}
    </div>
  );
}