
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { useAuth } from "@/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import SignUpPage from "@/app/signup/page";

type ActionState = "loading" | "invalid" | "expired" | "form" | "success" | "signup";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function AuthActionHandler() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState("");
  const [actionState, setActionState] = useState<ActionState>("loading");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const oobCodeParam = searchParams.get("oobCode");

    if (!modeParam) {
        setActionState("signup");
        setMode("signup");
        return;
    }
    
    setMode(modeParam);

    if(!oobCodeParam) {
        router.push('/login');
        return;
    }
    
    setActionCode(oobCodeParam);

    if (modeParam === "resetPassword") {
      verifyPasswordResetCode(auth, oobCodeParam)
        .then(() => {
          setActionState("form");
        })
        .catch((error) => {
          console.error("Verification error:", error);
          if (error.code === 'auth/expired-action-code') {
            setActionState("expired");
          } else {
            setActionState("invalid");
          }
        });
    } else if (modeParam === "signIn") {
      router.push(`/login?email=${searchParams.get('email')}`);
    } else {
        // Handle other actions like email verification if needed
        setActionState("invalid");
    }
  }, [searchParams, auth, router]);

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, actionCode, values.password);
      setActionState("success");
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Password reset confirmation error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/weak-password') {
        description = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/expired-action-code') {
        setActionState("expired");
        description = "This password reset link has expired.";
      }
      toast({
        variant: "destructive",
        title: "Error Resetting Password",
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }
  
  if (actionState === 'signup') {
    return <SignUpPage />;
  }

  const renderPasswordReset = () => {
     switch(actionState) {
        case 'loading':
            return <div className="flex flex-col items-center text-center space-y-4 p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-lg font-semibold">Verifying link...</p>
            </div>
        
        case 'expired':
        case 'invalid':
            return <div className="flex flex-col items-center text-center space-y-4 p-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <p className="text-lg font-semibold">Invalid or Expired Link</p>
                <p className="text-muted-foreground text-sm">
                    This link may have already been used or has expired. Please request a new password reset link.
                </p>
                <Button asChild className="w-full">
                    <Link href="/forgot-password">Request a New Link</Link>
                </Button>
            </div>

        case 'form':
            return <>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Reset Your Password</CardTitle>
                    <CardDescription>
                        Choose a new, strong password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set New Password
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </>
        
        case 'success':
            return <div className="flex flex-col items-center text-center space-y-4 p-4">
                <ShieldCheck className="h-16 w-16 text-green-500" />
                <p className="text-lg font-semibold">Password Changed!</p>
                <p className="text-muted-foreground text-sm">
                    Your password has been successfully updated. You will be redirected to login.
                </p>
            </div>
        default:
            return null;
    }
  }
  
  if (mode === 'resetPassword') {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
            <Card className="w-full max-w-md">
                {renderPasswordReset()}
            </Card>
        </div>
    );
  }

  // Fallback for signin or other modes
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  )
}

export default function AuthActionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>}>
            <AuthActionHandler />
        </Suspense>
    )
}
