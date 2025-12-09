
"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProfileDisplay from "@/app/profile/[id]/page";

export default function MyProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If we are on `/profile` without an ID, and the user is not logged in, redirect them.
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking for the user.
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
             <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  // Determine which profile to show: the logged-in user's.
  const targetUserId = user?.uid;

  if (!targetUserId) {
     // This case should be handled by the useEffect redirect, but as a fallback:
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
             <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Please Login</h2>
                <p className="text-muted-foreground">Login to view your profile.</p>
             </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <ProfileDisplay params={{ id: targetUserId }} />
    </div>
  );
}
