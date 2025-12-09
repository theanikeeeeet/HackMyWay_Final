
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Loader2, User as UserIcon, Building, Award, Star, History, Edit } from "lucide-react";
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditProfileDialog } from './components/edit-profile-dialog';

function ProfileSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-muted"></div>
                <div className="text-center md:text-left space-y-2">
                    <div className="h-8 w-48 rounded-md bg-muted"></div>
                    <div className="h-5 w-64 rounded-md bg-muted"></div>
                    <div className="h-6 w-32 rounded-md bg-muted"></div>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-32 rounded-lg bg-muted"></div>
                <div className="h-40 rounded-lg bg-muted"></div>
            </div>
            
            <div className="h-32 rounded-lg bg-muted"></div>
            <div className="h-32 rounded-lg bg-muted"></div>
        </div>
    )
}


export default function ProfileDisplay({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { user: currentUser } = useUser();
    const userId = params.id;

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);

    const { data: profile, isLoading, error } = useDoc<UserProfile>(userDocRef);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const isOwnProfile = currentUser?.uid === userId;

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-8">
              <div className="text-center py-16">
                  <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
                  <p className="text-muted-foreground">Could not find a profile for this user.</p>
                  {error && <p className="text-xs text-muted-foreground/50 mt-2">{error.message}</p>}
              </div>
            </div>
        );
    }
    
    const roleIcon = profile.userType === 'organization' 
        ? <Building className="mr-2 h-4 w-4"/> 
        : <UserIcon className="mr-2 h-4 w-4"/>;

    return (
         <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name || ""} />
                    <AvatarFallback>{profile.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold font-headline">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                     <Badge className="mt-2" variant="outline">
                        {roleIcon}
                        {profile.userType === 'organization' ? 'Organization' : 'Participant'}
                     </Badge>
                </div>
                {isOwnProfile && (
                    <div className="ml-auto">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || 'This user has not written a bio yet.'}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Award className="h-4 w-4" /> Rank</span>
                            <span className="font-bold text-lg">#-</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4" /> Total XP</span>
                            <span className="font-bold text-lg">{profile.xp || 0}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><History className="h-4 w-4" /> Hackathons</span>
                            <span className="font-bold text-lg">{profile.badges?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map(skill => <Badge key={skill}>{skill}</Badge>)
                    ) : (
                        <p className="text-muted-foreground text-sm">No skills listed. Add some to stand out!</p>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Hackathon History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Past hackathon participation will be shown here.</p>
                </CardContent>
            </Card>

            {isOwnProfile && (
                <EditProfileDialog
                    isOpen={isEditDialogOpen}
                    setIsOpen={setIsEditDialogOpen}
                    userProfile={profile}
                />
            )}
        </div>
    )
}
