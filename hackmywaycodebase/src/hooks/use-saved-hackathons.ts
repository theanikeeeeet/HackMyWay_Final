
"use client";

import { useCallback } from "react";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import type { SavedHackathon } from "@/lib/types";
import { toast } from "./use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function useSavedHackathons() {
  const { user } = useUser();
  const firestore = useFirestore();

  const savedHackathonsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/savedHackathons`);
  }, [user, firestore]);

  const { data: savedHackathons, isLoading, error } = useCollection<SavedHackathon>(savedHackathonsQuery);

  const savedHackathonIds = savedHackathons?.map((h) => h.id) || [];

  const isHackathonSaved = useCallback(
    (hackathonId: string) => {
      return savedHackathonIds.includes(hackathonId);
    },
    [savedHackathonIds]
  );

  const toggleSaveHackathon = useCallback(
    (hackathonId: string) => {
      if (!user || !firestore) {
        toast({
          variant: "destructive",
          title: "Not logged in",
          description: "You need to be logged in to save hackathons.",
        });
        return;
      }

      const hackathonDocRef = doc(firestore, `users/${user.uid}/savedHackathons`, hackathonId);
      const isSaved = savedHackathonIds.includes(hackathonId);

      if (isSaved) {
        // Unsave it
        deleteDoc(hackathonDocRef)
        .then(() => {
            toast({ title: "Removed", description: "Hackathon removed from your saved list." });
        })
        .catch((err) => {
            console.error("Error removing saved hackathon:", err);
            const permissionError = new FirestorePermissionError({ path: hackathonDocRef.path, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "Error", description: "Could not remove hackathon." });
        });
      } else {
        // Save it
        const savedData: SavedHackathon = {
            hackathonId,
            savedAt: serverTimestamp() as any,
        }
        setDoc(hackathonDocRef, savedData)
        .then(() => {
            toast({ title: "Saved!", description: "Hackathon added to your saved list." });
        })
        .catch((err) => {
            console.error("Error saving hackathon:", err);
            const permissionError = new FirestorePermissionError({ path: hackathonDocRef.path, operation: 'create', requestResourceData: savedData });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "Error", description: "Could not save hackathon." });
        });
      }
    },
    [user, firestore, savedHackathonIds]
  );

  return {
    savedHackathonIds,
    isHackathonSaved,
    toggleSaveHackathon,
    isLoading,
    error,
  };
}
