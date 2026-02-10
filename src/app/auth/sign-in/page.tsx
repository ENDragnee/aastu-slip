"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
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

    const validatedFields = signInSchema.safeParse({
      universityId: formUniversityId,
      password: formPassword,
    });

    if (!validatedFields.success) {
      setError(validatedFields.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
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
        `Authentication error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden bg-background">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary/90 p-12 text-primary-foreground relative border-r border-border/10">
        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="bg-background/20 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-white/10">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AASTU Exit System</span>
        </div>

        {/* Hero Text */}
        <div className="z-10 max-w-lg space-y-4">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
            Welcome <br />
            <span className="text-secondary">Back!</span>
          </h2>
          <p className="text-primary-foreground/90 text-lg leading-relaxed font-light">
            Access your clearance status, manage assets, and track your exit progress in real-time.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-primary-foreground/60 font-medium">
          <p>© {new Date().getFullYear()} AASTU Student Services</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto bg-background">

        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-foreground">AASTU</span>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign In
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <SignInForm onSubmit={onSubmit} isLoading={isLoading} error={error} />

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
            >
              Sign up
              <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
