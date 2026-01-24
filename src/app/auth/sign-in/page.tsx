"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowRight, GraduationCap, ChevronLeft } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import { redirector } from "@/actions/redirector";

// Schema Validation
const signInSchema = z.object({
  universityId: z
    .string()
    .min(4, "ID is too short")
    .regex(/^ets\d{4}\/\d+$/i, "Invalid format. Expected ETSxxxx/xx"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const formUniversityId = formData.get("universityId") as string;
    const formPassword = formData.get("password") as string;

    // Client-side Validation
    const validatedFields = signInSchema.safeParse({
      universityId: formUniversityId,
      password: formPassword,
    });

    if (!validatedFields.success) {
      // FIX: Use .issues instead of .errors
      setError(validatedFields.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      // Normalize ID to lowercase to match DB storage convention
      const universityId = validatedFields.data.universityId.toLowerCase();
      const password = validatedFields.data.password;

      const result = await signIn("credentials", {
        universityId,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect University ID or Password.");
      } else if (result?.ok) {
        redirector();
      } else {
        setError("An unexpected issue occurred during sign in.");
      }
    } catch (err) {
      setError(
        `Authentication error: ${err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden bg-background">

      {/* Left Panel - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

        <div className="flex items-center gap-2 z-10">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AASTU Exit System</span>
        </div>

        <div className="z-10 max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Welcome
            <span className="text-secondary block mt-1">Back!</span>
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Log in to check your clearance status, manage your dormitory details, and view exit history.
          </p>
        </div>

        <div className="z-10 flex items-center gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} AASTU Student Services</p>
        </div>
      </div>

      {/* Right Panel - Form (Scrollable) */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">

        <div className="lg:hidden w-full max-w-lg mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-foreground">AASTU</span>
          </div>
        </div>

        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 hidden sm:block">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign In
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account.
            </p>
          </div>

          <SignInForm onSubmit={onSubmit} isLoading={isLoading} error={error} />

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
              >
                Sign up
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
