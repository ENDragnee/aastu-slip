"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"

import Link from "next/link"
import { SignInForm } from "@/components/auth/sign-in-form"
import { useRouter } from "next/navigation"
import { z } from "zod"

export function SignInView() {

  const [isLoading, setIsLoading] = useState(Boolean);
  const [error, setError] = useState(String);
  const router = useRouter();

  const signInSchema = z.object({
    universityId: z.string().min(4).regex(/^ets\d{4}\/\d+$/i,
      "Invalid format. Expected ETS0000/00"),
    password: z.string().min(8)
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formUniversityId = formData.get("universityId") as string;
    const formPassword = formData.get("password") as string;

    const validatedFields = signInSchema.safeParse({
      universityId: formUniversityId,
      password: formPassword
    })
    if (!validatedFields.success) {
      setError("Please enter a proper value");
      setIsLoading(false)
    }
    else {
      try {
        const universityId = validatedFields.data?.universityId
        const password = validatedFields.data?.password
        const result = await signIn('credentials', {
          universityId,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Incorrect University Id or Password");
        }
        else if (result?.ok) {
          router.push("/dashboard")
        }
        else {
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
    }
  }
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex flex-1 bg-menu-background relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-menu-primary opacity-10" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-menu-primary opacity-10" />
            <div className="relative z-10 text-center space-y-6 p-12">
              <h2 className="text-6xl font-bold tracking-[0.3em] uppercase" style={{ color: "var(--menu-secondary)" }}>
                Welcome Back
              </h2>
              <p className="text-xl tracking-wider uppercase" style={{ color: "var(--menu-secondary)" }}>
                Keep Making Your Life Easy
              </p>
              <div className="pt-8">
                <div className="inline-block px-8 py-4" style={{ backgroundColor: "var(--menu-primary)" }}>
                  <span className="font-bold tracking-wider uppercase text-white">Menu Collection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2 mb-8">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ backgroundColor: "var(--menu-primary)" }}
                >
                  <span className="text-white font-bold text-xl">KK</span>
                </div>
                <span
                  className="text-2xl font-bold tracking-[0.2em] uppercase"
                  style={{ color: "var(--menu-secondary)" }}
                >
                  YELLOW
                </span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--menu-secondary)" }}>
              Welcome Back
            </h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <SignInForm onSubmit={onSubmit} isLoading={isLoading} error={error} />

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">{"Don't have an account?"}</span>
            <Link
              href="/auth?view=signup"
              className="font-medium hover:underline underline-offset-4"
              style={{ color: "var(--menu-primary)" }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInView
