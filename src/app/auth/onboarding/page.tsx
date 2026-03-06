"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      await axios.post("/api/auth/complete-onboarding", { token, password });
      toast({ title: "Success", description: "Account activated! Please login." });
      router.push("/auth/sign-in");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to set password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-8 text-center">Invalid Link</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "Activating..." : "Activate Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
