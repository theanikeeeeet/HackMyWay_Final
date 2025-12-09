import { cn } from "@/lib/utils";
import type { Hackathon } from "@/lib/types";
import { Badge } from "./ui/badge";

type SourceBadgeProps = {
  platform: Hackathon['sourcePlatform'];
  className?: string;
};

const platformColors: Record<NonNullable<Hackathon['sourcePlatform']>, string> = {
    'Devfolio': 'bg-[#FF7F50] hover:bg-[#FF7F50]/90 text-white', // Coral
    'Unstop': 'bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white', // DodgerBlue
    'MLH': 'bg-[#FF4500] hover:bg-[#FF4500]/90 text-white', // OrangeRed
    'Devpost': 'bg-[#003E54] hover:bg-[#003E54]/90 text-white', // Dark Blue
    'HackerEarth': 'bg-[#2F3442] hover:bg-[#2F3442]/90 text-white', // Dark Gray
    'User Created': 'bg-green-600 hover:bg-green-600/90 text-white',
    'HackScrapped': 'bg-teal-500 hover:bg-teal-500/90 text-white',
};

export function SourceBadge({ platform, className }: SourceBadgeProps) {
  if (!platform) return null;
  const colorClass = platformColors[platform] || 'bg-gray-500 text-white';

  return (
    <Badge className={cn("border-none", colorClass, className)}>
      {platform}
    </Badge>
  );
}
