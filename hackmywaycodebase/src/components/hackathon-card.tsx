
"use client";

import type { Hackathon, WithId } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { SourceBadge } from "./source-badge";
import { useSavedHackathons } from "@/hooks/use-saved-hackathons";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

type HackathonCardProps = {
  hackathon: WithId<Hackathon>;
};

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const { user } = useUser();
  const { isHackathonSaved, toggleSaveHackathon } = useSavedHackathons();
  
  const link = `/hackathons/${hackathon.id}`;
  
  const dateRange = hackathon.startDate && hackathon.endDate 
    ? `${format(new Date(hackathon.startDate), "MMM d")} - ${format(new Date(hackathon.endDate), "MMM d, yyyy")}`
    : 'Date not specified';
  
  const getStatus = () => {
    if (hackathon.status) return hackathon.status;
    if (!hackathon.startDate || !hackathon.endDate) return 'Upcoming';
    const now = new Date();
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);
    
    if (now >= start && now <= end) return 'Ongoing';
    if (now > end) return 'Ended';
    return 'Upcoming';
  };
  
  const status = getStatus();
  const statusColor = status === 'Ongoing' ? 'bg-green-500' : status === 'Ended' ? 'bg-red-500' : 'bg-blue-500';
  const defaultCover = "https://picsum.photos/seed/default/600/300";

  const isSaved = isHackathonSaved(hackathon.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if the button is inside a link
    toggleSaveHackathon(hackathon.id);
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow duration-300 group">
      <CardHeader className="p-0 relative">
        <Link href={link}>
          <Image
            src={hackathon.coverImageUrl || defaultCover}
            alt={hackathon.title || 'Hackathon Cover'}
            width={600}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {hackathon.sourcePlatform && (
          <div className="absolute top-2 right-2 flex gap-2">
            <SourceBadge platform={hackathon.sourcePlatform} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {hackathon.mode || 'Online'}
          </Badge>
          <Badge className={`${statusColor} text-white`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-1 leading-tight">
          <Link href={link} className="hover:text-primary transition-colors">
            {hackathon.title}
          </Link>
        </CardTitle>
        <CardDescription className="mb-3 text-sm flex items-center gap-2">
          <Users className="h-4 w-4" /> 
          {hackathon.organizerName || 'Unknown Organizer'}
        </CardDescription>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0"/> 
            <span>{dateRange}</span>
          </div>
           <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0"/> 
            <span>{hackathon.location || (hackathon.mode === 'Online' ? 'Remote' : 'Location TBA')}</span>
          </div>
          {hackathon.participantCount && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0"/> 
              <span>{hackathon.participantCount}+ participants</span>
            </div>
          )}
        </div>
        
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hackathon.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center mt-auto">
        {user && (
           <Button variant="ghost" size="icon" onClick={handleSaveClick}>
              <Heart className={cn("h-5 w-5", isSaved ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
              <span className="sr-only">Save</span>
            </Button>
        )}
        {!user && <div />}
        <Button asChild>
          <Link href={link}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
