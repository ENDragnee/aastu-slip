import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorDisplay } from "@/components/auth/auth-error";
import Link from "next/link";

export function SignInForm({
  onSubmit,
  isLoading = false,
  error = "",
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <AuthErrorDisplay error={error} />}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="universityId">University Id</Label>
          <Input id="universityId" name="universityId" placeholder="ETS0000/00" type="text" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" placeholder="••••••••" type="password" required disabled={isLoading} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
