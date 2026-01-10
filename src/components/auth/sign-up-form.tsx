"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  CreditCard,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorDisplay } from "@/components/auth/auth-error";
import { signUpSchema, SignUpInput } from "@/lib/validators/sign-up";
import { cn } from "@/lib/utils"; // Assuming you have this utility from shadcn

export function SignUpForm({
  onSubmit,
  isLoading = false,
  error = "",
}: {
  onSubmit: (data: SignUpInput) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl border border-border/50 overflow-hidden">

        {/* Header Section */}
        <div className="bg-primary/5 p-6 sm:p-8 text-center border-b border-border/50">
          <div className="mx-auto bg-background h-12 w-12 rounded-full flex items-center justify-center shadow-sm text-primary mb-4 ring-1 ring-border">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Create an Account
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Enter your details below to register your profile.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <AuthErrorDisplay error={error} />
              </div>
            )}

            {/* Name Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register("firstName")}
                    disabled={isLoading}
                    className="pl-9 bg-background focus-visible:ring-primary"
                  />
                </div>
                {errors.firstName && <p className="text-destructive text-xs font-medium pl-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    disabled={isLoading}
                    className="pl-9 bg-background focus-visible:ring-primary"
                  />
                </div>
                {errors.lastName && <p className="text-destructive text-xs font-medium pl-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* University ID */}
            <div className="space-y-2">
              <Label htmlFor="universityId">University ID</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="universityId"
                  placeholder="ETS/xxxx/xx"
                  {...register("universityId")}
                  disabled={isLoading}
                  className="pl-9 bg-background focus-visible:ring-primary"
                />
              </div>
              {errors.universityId && <p className="text-destructive text-xs font-medium pl-1">{errors.universityId.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu.et"
                  {...register("email")}
                  disabled={isLoading}
                  className="pl-9 bg-background focus-visible:ring-primary"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs font-medium pl-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="+251 911 22 33 44"
                  {...register("phoneNumber")}
                  disabled={isLoading}
                  className="pl-9 bg-background focus-visible:ring-primary"
                />
              </div>
              {errors.phoneNumber && <p className="text-destructive text-xs font-medium pl-1">{errors.phoneNumber.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isLoading}
                  className="pl-9 pr-10 bg-background focus-visible:ring-primary"
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
              {errors.password && <p className="text-destructive text-xs font-medium pl-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="pl-9 pr-10 bg-background focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs font-medium pl-1">{errors.confirmPassword.message}</p>
              )}
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
