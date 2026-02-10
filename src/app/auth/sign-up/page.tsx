"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, GraduationCap, ChevronLeft } from "lucide-react";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { SignUpInput } from "@/lib/validators/sign-up";
import { Button } from "@/components/ui/button";

const createUser = async (data: SignUpInput) => {
  const res = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      firstName: data.firstName.toLowerCase(),
      lastName: data.lastName.toLowerCase(),
      universityId: data.universityId.toLowerCase(),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create account");
  }
  return res.json();
};

export default function SignUpView() {
  const [error, setError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message ?? "Something went wrong. Please try again.");
    },
  });

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden bg-background">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-bl from-primary to-primary/90 p-12 text-primary-foreground relative border-r border-border/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />

        <div className="flex items-center gap-3 z-10">
          <div className="bg-background/20 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-white/10">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AASTU Exit System</span>
        </div>

        <div className="z-10 max-w-lg space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Start your <br />
            <span className="text-secondary">Journey.</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg leading-relaxed font-light">
            Create an account to streamline your university clearance. Manage dormitory, library, and property checkouts digitally.
          </p>
        </div>

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

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 text-center sm:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Get Started
            </h2>
            <p className="text-muted-foreground text-sm">
              Create your account to begin the clearance process.
            </p>
          </div>

          <SignUpForm
            onSubmit={(data) => mutation.mutateAsync(data)}
            isLoading={mutation.isPending}
            error={error}
          />

          <div className="mt-8 text-center space-y-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </p>

            <div className="flex justify-center gap-6 text-xs text-muted-foreground/70">
              <Link href="/terms" className="hover:text-foreground transition-colors hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
