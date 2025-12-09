
"use client";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup, getRedirectResult, AuthError, signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, Github } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { RoleSelectorModal } from "@/components/auth/role-selector";
import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type ProviderName = 'google' | 'github';

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

function LoginHandler() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOAuthLoading, setIsOAuthLoading] = useState<null | ProviderName>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newUserProfile, setNewUserProfile] = useState<UserProfile | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isUserLoading && user && firestore) {
        const userDocRef = doc(firestore, "users", user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().userType) {
                const data = docSnap.data() as UserProfile;
                const destination = data.userType === 'organization' ? '/create-hackathon' : '/my-hackathons';
                router.push(searchParams.get('redirect') || destination);
            } else {
                const profile: UserProfile = docSnap.exists() 
                    ? docSnap.data() as UserProfile
                    : {
                        id: user.uid,
                        name: user.displayName || 'Anonymous',
                        email: user.email || '',
                        createdAt: serverTimestamp(),
                      };
                setNewUserProfile(profile);
                setShowRoleModal(true);
            }
        });
    }
  }, [user, isUserLoading, router, firestore, searchParams]);

  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            toast({
              title: "Login Successful",
              description: `Welcome back, ${result.user.displayName}!`,
            });
          }
        })
        .catch((error: AuthError) => {
          console.error("Auth redirect error:", error);
          if (error.code !== 'auth/web-storage-unsupported') {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: error.message || "An unexpected error occurred. Please try again.",
            });
          }
        }).finally(() => {
            setIsProcessingRedirect(false);
        });
    } else {
        setIsProcessingRedirect(false);
    }
  }, [auth]);

  const handleOAuthLogin = async (providerName: ProviderName) => {
    if (!auth) return;
    setIsOAuthLoading(providerName);
    
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') return;
        
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/account-exists-with-different-credential') {
          description = "An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.";
        }
        
        toast({ variant: "destructive", title: "Login Failed", description });

    } finally {
        setIsOAuthLoading(null);
    }
  };

  const handleEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    if (!auth) return;
    setIsEmailLoading(true);
    try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error: any) {
        console.error("Email login error:", error);
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Invalid email or password. Please try again.";
        }
        toast({ variant: "destructive", title: "Login Failed", description });
    } finally {
        setIsEmailLoading(false);
    }
  }
  
  const handleRoleSelect = async (role: 'participant' | 'organization') => {
    if (!user || !newUserProfile || !firestore) return;
    
    const userDocRef = doc(firestore, "users", user.uid);
    const updatedProfile: UserProfile = { ...newUserProfile, userType: role };
    
    try {
        await setDoc(userDocRef, updatedProfile, { merge: true });
        setShowRoleModal(false);
        toast({ title: "Profile Updated", description: `You are now registered as a ${role}.` });
        
        const destination = role === 'organization' ? '/create-hackathon' : '/my-hackathons';
        router.push(searchParams.get('redirect') || destination);

    } catch (e) {
        console.error("Failed to save role", e);
        toast({ variant: "destructive", title: "Error", description: "Could not save your role." });
    }
  };

  if (isUserLoading || isProcessingRedirect || (user && !showRoleModal)) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  if (showRoleModal && newUserProfile) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <RoleSelectorModal isOpen={showRoleModal} onRoleSelect={handleRoleSelect} />
       </div>
    )
  }
  
  const isLoading = !!isOAuthLoading || isEmailLoading;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to continue to HackMyWay
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="grid grid-cols-2 gap-3">
                         <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('google')} 
                            disabled={isLoading}
                        >
                            {isOAuthLoading === 'google' 
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                : <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.02 2.25-4.42 0-8.03-3.6-8.03-8.02s3.6-8.02 8.03-8.02c2.45 0 4.05.92 4.97 1.82l2.6-2.62C18.06 2.44 15.47 1 12.48 1 5.88 1 1 5.98 1 12.5s4.88 11.5 11.48 11.5c6.2 0 11.02-4.12 11.02-11.22 0-.75-.08-1.48-.22-2.18h-11.02z" fill="#4285F4"/><path d="M22.46 12.5h-11v.02z" fill="#34A853"/><path d="M22.46 12.5h-11v.02z" fill="#FBBC05"/><path d="M22.46 12.5h-11v.02z" fill="#EA4335"/></svg>
                            }
                             Google
                        </Button>
                        <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('github')} 
                            disabled={isLoading}
                        >
                            {isOAuthLoading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                            GitHub
                        </Button>
                     </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEmailLogin)} className="grid gap-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </Form>
                     <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/forgot-password"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Forgot password?
                        </Link>
                    </p>
                     <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline underline-offset-4 hover:text-primary font-semibold">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginHandler />
        </Suspense>
    )
}
