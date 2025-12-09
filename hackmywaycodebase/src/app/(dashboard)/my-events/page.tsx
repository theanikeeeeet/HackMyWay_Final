
"use client";

import { useMemo, useState } from "react";
import { collection, query, where } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Hackathon, WithId, UserProfile } from "@/lib/types";
import { HackathonCard } from "@/components/hackathon-card";
import { HackathonCardSkeleton } from "@/components/hackathon-card-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Sprout, Loader2, Building } from "lucide-react";
import { seedHackathons } from "@/lib/seed-db";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

function MyEventsList({ hackathons, isLoading, error }: { hackathons: WithId<Hackathon>[], isLoading: boolean, error: Error | null }) {
    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <HackathonCardSkeleton key={i} />)}
            </div>
        )
    }

    if (error) {
         return (
            <div className="text-center col-span-full py-16">
                <h2 className="text-2xl font-semibold mb-2">Error Loading Events</h2>
                <p className="text-muted-foreground">There was a problem fetching your hackathons. Please try again later.</p>
                <p className="text-xs text-muted-foreground/50 mt-2">{error.message}</p>
            </div>
        )
    }

    if (hackathons.length === 0) {
        return (
            <div className="text-center col-span-full py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">You haven't created any events yet.</h2>
                <p className="text-muted-foreground mb-6">Ready to host your first hackathon?</p>
                <Button asChild>
                    <Link href="/create-hackathon">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Event
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
        </div>
    )
}

export default function MyEventsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  
  // You should fetch user profile from a shared context or a dedicated hook
  // For simplicity, let's assume user object has a `userType` property
  // This is a placeholder for actual role management logic
  const userProfile: Partial<UserProfile> = { userType: 'organization' }; // Placeholder

  const myHackathonsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, "hackathons"), 
        where("organizerId", "==", user.uid)
    );
  }, [firestore, user]);

  const { data: hackathons, isLoading, error } = useCollection<Hackathon>(myHackathonsQuery);

  const processedHackathons = useMemo(() => {
    if (!hackathons) return [];
    
    return hackathons.map(h => ({
      ...h,
      startDate: h.startDate?.toDate ? h.startDate.toDate() : new Date(h.startDate as any),
      endDate: h.endDate?.toDate ? h.endDate.toDate() : new Date(h.endDate as any),
      registrationDeadline: h.registrationDeadline?.toDate ? h.registrationDeadline.toDate() : new Date(h.registrationDeadline as any),
    } as WithId<Hackathon>));
  }, [hackathons]);
  
  const handleSeed = async () => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to seed the database.' });
        return;
    }
    setIsSeeding(true);
    const result = await seedHackathons(firestore, user.uid);
    if (result.success) {
        toast({ title: 'Database Seeding', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSeeding(false);
  }

  if (userProfile.userType !== 'organization') {
      return (
          <Card>
              <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                      <Building className="h-16 w-16 text-muted-foreground/30" />
                      <h2 className="text-2xl font-semibold">For Organizations Only</h2>
                      <p className="text-muted-foreground max-w-sm">
                          This page is for creating and managing hackathon events. If you are a participant, explore hackathons in the discover tab.
                      </p>
                      <Button asChild className="mt-4">
                          <Link href="/my-hackathons">Discover Hackathons</Link>
                      </Button>
                  </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <h1 className="text-3xl font-bold font-headline tracking-tight">My Events</h1>
            <div className="flex gap-2">
                <Button onClick={handleSeed} disabled={isSeeding} variant="outline">
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sprout className="mr-2 h-4 w-4" />}
                    Seed Database
                </Button>
                <Button asChild>
                    <Link href="/create-hackathon">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Hackathon
                    </Link>
                </Button>
            </div>
        </div>
        <MyEventsList 
            hackathons={processedHackathons}
            isLoading={isLoading}
            error={error}
        />
    </div>
  );
}
