"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  Lock, Eye, EyeOff, Loader2, CheckCircle,
  GraduationCap, XCircle, ArrowRight
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// --- Validation Schema ---
const onboardingSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// --- Inner Form Component ---
function OnboardingForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  // 1. Handle Invalid/Missing Token State
  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-destructive animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2">
            <XCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Invalid Link</CardTitle>
          <p className="text-muted-foreground text-sm">
            This onboarding link is missing, invalid, or has expired. Please contact the administrator or request a new invite.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/auth/sign-in">Return to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 2. Handle Success State
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500 animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Account Activated!</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your password has been set successfully. We are redirecting you to the dashboard...
          </p>
          <Loader2 className="h-6 w-6 text-green-500 animate-spin mt-4" />
        </CardContent>
      </Card>
    );
  }

  // 3. Main Submission Handler
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await axios.post("/api/auth/complete-onboarding", {
        token,
        password: data.password
      });

      setIsSuccess(true);
      toast({ title: "Welcome aboard!", description: "Your account is now active." });

      // Give them a moment to read the success message before redirecting
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2500);

    } catch (err: any) {
      toast({
        title: "Activation Failed",
        description: err.response?.data?.error || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  // 4. Main Form UI
  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* Friendly Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 border border-primary/20 shadow-sm">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Almost there!
        </h1>
        <p className="text-muted-foreground text-sm">
          Set a secure password to activate your AASTU Exit Slip account.
        </p>
      </div>

      <Card className="shadow-xl border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-background focus-visible:ring-primary"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium pl-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-background focus-visible:ring-primary"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive font-medium pl-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full font-bold text-base h-11 mt-4 transition-all" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  Activate Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page Export ---
export default function OnboardingPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Suspense Boundary is REQUIRED by Next.js when using useSearchParams */}
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading secure connection...</p>
          </div>
        }>
          <OnboardingForm />
        </Suspense>
      </div>
    </div>
  );
}
