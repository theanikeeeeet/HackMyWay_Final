
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  avatarUrl: z.string().url("Please enter a valid URL.").or(z.literal("")).optional(),
  skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userProfile: UserProfile;
}

export function EditProfileDialog({ isOpen, setIsOpen, userProfile }: EditProfileDialogProps) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userProfile.name || "",
      bio: userProfile.bio || "",
      avatarUrl: userProfile.avatarUrl || "",
      skills: userProfile.skills?.join(", ") || "",
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }
    setIsSubmitting(true);

    const userDocRef = doc(firestore, "users", userProfile.id);

    const updatedProfileData = {
        ...userProfile,
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    setDoc(userDocRef, updatedProfileData, { merge: true })
      .then(() => {
        toast({
          title: "Profile Updated!",
          description: "Your changes have been saved successfully."
        });
        setIsOpen(false);
      })
      .catch((serverError) => {
        console.error("Error updating profile:", serverError);
        // Create and emit the custom permission error
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updatedProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        
        // Show a generic error toast to the user
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not update your profile. Please check permissions and try again.",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                   <FormDescription>
                    Paste a link to your profile picture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About / Bio</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, React, Figma..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your skills, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
