
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useSavedHackathons } from "@/hooks/use-saved-hackathons";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Hackathon, WithId } from "@/lib/types";
import { query, collection, where, documentId } from "firebase/firestore";
import { HackathonCard } from "@/components/hackathon-card";
import { HackathonCardSkeleton } from "@/components/hackathon-card-skeleton";

export default function SavedHackathonsPage() {
  const firestore = useFirestore();
  const { savedHackathonIds, isLoading: isLoadingSavedIds, error: savedIdsError } = useSavedHackathons();

  // This query will fetch the full hackathon documents for the saved IDs.
  const savedHackathonsQuery = useMemoFirebase(() => {
    if (!firestore || !savedHackathonIds || savedHackathonIds.length === 0) return null;
    return query(
        collection(firestore, "hackathons"),
        where(documentId(), "in", savedHackathonIds)
    );
  }, [firestore, savedHackathonIds]);

  const { data: hackathons, isLoading: isLoadingHackathons, error: hackathonsError } = useCollection<Hackathon>(savedHackathonsQuery);

  const processedHackathons = useMemo(() => {
    if (!hackathons) return [];
    return hackathons.map(h => ({
      ...h,
      startDate: h.startDate?.toDate ? h.startDate.toDate() : new Date(h.startDate as any),
      endDate: h.endDate?.toDate ? h.endDate.toDate() : new Date(h.endDate as any),
      registrationDeadline: h.registrationDeadline?.toDate ? h.registrationDeadline.toDate() : new Date(h.registrationDeadline as any),
    } as WithId<Hackathon>));
  }, [hackathons]);

  const isLoading = isLoadingSavedIds || (savedHackathonIds.length > 0 && isLoadingHackathons);
  const error = savedIdsError || hackathonsError;

  if (isLoading) {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight mb-6">Saved Hackathons</h1>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <HackathonCardSkeleton key={i} />)}
            </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">Error Loading Saved Hackathons</h2>
            <p className="text-muted-foreground">There was a problem fetching your saved events. Please try again later.</p>
            <p className="text-xs text-muted-foreground/50 mt-2">{error.message}</p>
        </div>
    )
  }


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight mb-6">Saved Hackathons</h1>
      
      {processedHackathons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                  <Heart className="h-16 w-16 text-muted-foreground/30" />
                  <h2 className="text-2xl font-semibold">No Saved Hackathons</h2>
                  <p className="text-muted-foreground max-w-sm">
                      You haven't saved any hackathons yet. Click the heart icon on any hackathon to save it for later.
                  </p>
                  <Button asChild className="mt-4">
                      <Link href="/my-hackathons">Discover Hackathons</Link>
                  </Button>
              </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processedHackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      )}
    </div>
  );
}
