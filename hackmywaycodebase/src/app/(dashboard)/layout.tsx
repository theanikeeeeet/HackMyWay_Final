
"use client";

import Link from "next/link";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { RoleSelectorModal } from "@/components/auth/role-selector";
import type { UserProfile } from "@/lib/types";

const participantNav = [
    { name: "Discover", href: "/my-hackathons" },
    { name: "Saved Hackathons", href: "/saved" },
    { name: "My Profile", href: "/profile" },
];

const organizationNav = [
    { name: "Create Hackathon", href: "/create-hackathon" },
    { name: "My Events", href: "/my-events" },
    { name: "My Profile", href: "/profile" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!user) {
      router.push('/login?redirect=' + pathname);
      return;
    }

    if (firestore) {
      const userDocRef = doc(firestore, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          if (!data.userType) {
            setShowRoleModal(true);
          }
        } else {
            // This case happens on first login via OAuth provider
            const newUserProfile: UserProfile = {
                id: user.uid,
                name: user.displayName || 'Anonymous',
                email: user.email || '',
                createdAt: new Date().toISOString(),
            };
            setProfile(newUserProfile);
            setShowRoleModal(true);
        }
        setIsProfileLoading(false);
      });
    }
  }, [user, isUserLoading, router, pathname, firestore]);

  const handleRoleSelect = async (role: 'participant' | 'organization') => {
    if (!user || !profile || !firestore) return;
    
    const userDocRef = doc(firestore, "users", user.uid);
    const updatedProfile = { ...profile, userType: role };
    
    try {
        await setDoc(userDocRef, updatedProfile, { merge: true });
        setProfile(updatedProfile);
        setShowRoleModal(false);
    } catch (e) {
        console.error("Failed to save role", e);
    }
  };

  if (isUserLoading || isProfileLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        {profile && <RoleSelectorModal isOpen={showRoleModal} onRoleSelect={handleRoleSelect} />}
      </div>
    );
  }
  
  if (!profile.userType) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <RoleSelectorModal isOpen={showRoleModal} onRoleSelect={handleRoleSelect} />
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  const navLinks = profile.userType === 'organization' ? organizationNav : participantNav;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            {navLinks.map(item => (
                <Link key={item.name} href={item.href} className="text-muted-foreground hover:text-foreground p-2 rounded-md transition-colors">{item.name}</Link>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3">
            {children}
        </main>
      </div>
    </div>
  );
}
