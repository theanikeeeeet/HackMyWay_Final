

"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Hackathon, WithId } from "@/lib/types";
import { HackathonCard } from "@/components/hackathon-card";
import { HackathonCardSkeleton } from "@/components/hackathon-card-skeleton";
import { Filters, type FilterState } from "@/components/filters";
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, Timestamp } from 'firebase/firestore';

const TABS = ["upcoming", "ongoing", "past"];

function HackathonList({ hackathons, isLoading, error }: { hackathons: WithId<Hackathon>[], isLoading: boolean, error: Error | null }) {
    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <HackathonCardSkeleton key={i} />)}
            </div>
        )
    }

    if (hackathons.length === 0) {
        return (
            <div className="text-center col-span-full py-16">
                <h2 className="text-2xl font-semibold mb-2">No Hackathons Found</h2>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria. {error && `Error: ${error.message}`}</p>
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

function toDate(dateValue: Date | Timestamp | string | undefined | null): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (dateValue instanceof Timestamp) return dateValue.toDate();
    
    if (typeof dateValue === 'string') {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) {
            return d;
        }
    }
    
    if (typeof dateValue === 'object' && 'seconds' in dateValue && typeof dateValue.seconds === 'number') {
        // This handles Firestore Timestamps that have been serialized and passed from server to client components
        return new Date((dateValue.seconds as number) * 1000 + ((dateValue.nanoseconds as number) || 0) / 1000000);
    }

    console.warn("Could not parse date:", dateValue);
    return null;
}


const initialFilterState: FilterState = {
    modes: [],
    locations: [],
    prizes: [],
    themes: [],
    difficulties: [],
    sources: [],
};

export function HackathonTabs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('upcoming');
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const firestore = useFirestore();

  const hackathonsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'hackathons'));
  }, [firestore]);

  const { data: hackathons, isLoading, error } = useCollection<Hackathon>(hackathonsQuery);

  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
        const currentValues = prev[filterType];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  }

  const processedHackathons = useMemo(() => {
    if (!hackathons) return [];
    
    return hackathons.map(h => ({
      ...h,
      startDate: toDate(h.startDate),
      endDate: toDate(h.endDate),
      registrationDeadline: toDate(h.registrationDeadline),
    } as WithId<Hackathon>));
  }, [hackathons]);


  const sortedAndFilteredHackathons = useMemo(() => {
    return processedHackathons.filter(h => {
        // Search term filter
        const matchesSearch = (h.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (h.organizerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (h.theme?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (Array.isArray(h.tags) && h.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

        // Checkbox filters
        const matchesModes = filters.modes.length === 0 || filters.modes.includes(h.mode);
        const matchesLocations = filters.locations.length === 0 || (h.location && filters.locations.includes(h.location)) || (h.mode === 'Online' && filters.locations.includes('Online'));
        const matchesDifficulties = filters.difficulties.length === 0 || (h.difficulty && filters.difficulties.includes(h.difficulty));
        const matchesThemes = filters.themes.length === 0 || (h.theme && filters.themes.includes(h.theme));
        const matchesSources = filters.sources.length === 0 || (h.sourcePlatform && filters.sources.includes(h.sourcePlatform));

        const prizeRanges: { [key: string]: [number, number] } = {
          'Under ₹50K': [0, 50000],
          '₹50K-₹1L': [50001, 100000],
          '₹1L-₹5L': [100001, 500000],
          '₹5L-₹10L': [500001, 1000000],
          'Above ₹10L': [1000001, Infinity],
        };
        
        const matchesPrizes = filters.prizes.length === 0 || filters.prizes.some(range => {
            if (range === 'All') return true;
            const [min, max] = prizeRanges[range];
            const prize = h.prizeMoney || 0;
            return prize >= min && prize <= max;
        });


        return matchesSearch && matchesModes && matchesLocations && matchesDifficulties && matchesThemes && matchesSources && matchesPrizes;
    }).sort((a, b) => {
        const aStartDate = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bStartDate = b.startDate ? new Date(b.startDate).getTime() : 0;
        const aEndDate = a.endDate ? new Date(a.endDate).getTime() : 0;
        const bEndDate = b.endDate ? new Date(b.endDate).getTime() : 0;
        const aRegDeadline = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : 0;
        const bRegDeadline = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : 0;
        
        switch (sortBy) {
            case 'prize-desc':
                return (b.prizeMoney || 0) - (a.prizeMoney || 0);
            case 'prize-asc':
                return (a.prizeMoney || 0) - (b.prizeMoney || 0);
            case 'deadline':
                return aRegDeadline - bRegDeadline;
            case 'recent':
                return bEndDate - aEndDate;
            case 'upcoming':
            default:
                return aStartDate - bStartDate;
        }
    });
  }, [processedHackathons, searchTerm, sortBy, filters]);
  
  const filterByStatus = (status: 'ongoing' | 'upcoming' | 'past') => {
    const now = new Date().getTime();
    const list = sortedAndFilteredHackathons.filter(h => {
        if (!h.startDate || !h.endDate) return false;
        const start = new Date(h.startDate).getTime();
        const end = new Date(h.endDate).getTime();
        if (status === "ongoing") return start <= now && end >= now;
        if (status === "upcoming") return start > now;
        if (status === "past") return end < now;
        return false;
    });

    if (status === 'past') {
        return list.sort((a, b) => {
            const dateA = b.endDate ? new Date(b.endDate).getTime() : 0;
            const dateB = a.endDate ? new Date(a.endDate).getTime() : 0;
            return dateA - dateB;
        });
    }
    return list;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block">
          <Filters 
            filters={filters}
            onFilterChange={handleFilterChange}
            clearFilters={clearFilters}
          />
        </aside>
        <main className="lg:col-span-3">
            <Tabs defaultValue="upcoming">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {TABS.map(tab => (
                                <TabsTrigger key={tab} value={tab}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                     <div className="flex items-center gap-4 w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select defaultValue={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming First</SelectItem>
                                <SelectItem value="prize-desc">Prize: High to Low</SelectItem>
                                <SelectItem value="prize-asc">Prize: Low to High</SelectItem>
                                <SelectItem value="deadline">Deadline: Closest First</SelectItem>
                                <SelectItem value="recent">Recently Ended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {TABS.map(tab => (
                    <TabsContent key={tab} value={tab}>
                        <HackathonList 
                            hackathons={filterByStatus(tab as any)}
                            isLoading={isLoading}
                            error={error}
                        />
                    </TabsContent>
                ))}
            </Tabs>
          
          {/* TODO: Add pagination */}
        </main>
      </div>
    </div>
  );
}
