"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorDisplay } from "@/components/auth/auth-error";
import { cn } from "@/lib/utils";

export function SignInForm({
  onSubmit,
  isLoading = false,
  error = "",
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="bg-primary/5 p-6 sm:p-8 text-center border-b border-border/50">
          <div className="mx-auto bg-background h-12 w-12 rounded-full flex items-center justify-center shadow-sm text-primary mb-4 ring-1 ring-border">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Enter your credentials to access your account.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <AuthErrorDisplay error={error} />
              </div>
            )}

            <div className="space-y-4">
              {/* University ID Field */}
              <div className="space-y-2">
                <Label htmlFor="universityId">University ID</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="universityId"
                    name="universityId"
                    placeholder="ETSxxxx/xx"
                    type="text"
                    required
                    disabled={isLoading}
                    className="pl-9 bg-background focus-visible:ring-primary transition-shadow"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hover:underline"
                    tabIndex={-1} // Prevent tabbing to this before the input
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    className="pl-9 pr-10 bg-background focus-visible:ring-primary transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:text-primary"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full font-bold text-base h-11 mt-2 shadow-md transition-all",
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
