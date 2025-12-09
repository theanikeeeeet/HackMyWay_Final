'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile, WithId } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Medal, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { HackathonCardSkeleton } from '@/components/hackathon-card-skeleton';

function LeaderboardSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({length: 10}).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2 rounded-lg">
                    <div className="text-lg font-bold w-8 text-center">
                        <div className="h-6 w-6 bg-muted rounded-md animate-pulse"></div>
                    </div>
                     <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-grow space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                    </div>
                     <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
                </div>
            ))}
        </div>
    )
}

function LeaderboardList({ users, isLoading, error }: { users: WithId<UserProfile>[], isLoading: boolean, error: Error | null }) {
    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    if (error) {
        return (
           <div className="text-center py-16">
               <h2 className="text-2xl font-semibold mb-2">Error Loading Leaderboard</h2>
               <p className="text-muted-foreground">There was a problem fetching the rankings. Please try again later.</p>
               <p className="text-xs text-muted-foreground/50 mt-2">{error.message}</p>
           </div>
       )
   }

    if (users.length === 0) {
        return (
            <div className="text-center py-16">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">The Leaderboard is Empty</h2>
                <p className="text-muted-foreground">Compete in hackathons and complete challenges to get on the board!</p>
            </div>
        );
    }
    
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400 fill-yellow-400" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-slate-400 fill-slate-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-yellow-700 fill-yellow-700" />;
        return <span className="font-bold text-lg w-6 text-center text-muted-foreground">{rank}</span>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead className="text-right">XP</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user, index) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{getRankIcon(index + 1)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">{user.name}</Link>
                                    <p className="text-sm text-muted-foreground">{user.college || 'Community Member'}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <Badge variant="secondary" className="text-base font-bold">{user.xp || 0} XP</Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function LeaderboardPage() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'),
            orderBy('xp', 'desc'),
            limit(100)
        );
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection<UserProfile>(usersQuery);

    const processedUsers = useMemo(() => {
        if (!users) return [];
        return users;
    }, [users]);


    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Crown className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Global Leaderboard</h1>
                    <p className="text-muted-foreground">See who is leading the pack in the hackathon community.</p>
                </div>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <LeaderboardList users={processedUsers} isLoading={isLoading} error={error} />
                </CardContent>
            </Card>
        </div>
    )
}
