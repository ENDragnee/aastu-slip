"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, GraduationCap, ChevronLeft } from "lucide-react";

import { SignUpForm } from "@/components/auth/sign-up-form"; // Ensure this path is correct
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
      // Optional: Add a toast notification here
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message ?? "Something went wrong. Please try again.");
    },
  });

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden bg-background">

      {/* Left Panel - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

        {/* Logo Area */}
        <div className="flex items-center gap-2 z-10">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AASTU Exit System</span>
        </div>

        {/* Hero Content */}
        <div className="z-10 max-w-md">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            Streamline your
            <span className="text-secondary block mt-1">University Checkout.</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Manage your dormitory, library, and property clearances in one centralized digital platform.
          </p>
        </div>

        {/* Footer Area */}
        <div className="z-10 flex items-center gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} AASTU Student Services</p>
        </div>
      </div>

      {/* Right Panel - Form (Scrollable) */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">

        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden w-full max-w-lg mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-foreground">AASTU</span>
          </div>
        </div>

        {/* Back Button */}
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Get Started
            </h2>
            <p className="text-muted-foreground mt-2">
              Create your account to begin the clearance process.
            </p>
          </div>

          <SignUpForm
            onSubmit={(data) => mutation.mutateAsync(data)}
            isLoading={mutation.isPending}
            error={error}
          />

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth?view=signin"
                className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </p>

            <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:underline hover:text-foreground">Terms of Service</Link>
              <span>&bull;</span>
              <Link href="/privacy" className="hover:underline hover:text-foreground">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
