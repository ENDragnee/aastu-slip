"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  onSearch: (code: string) => void;
  isLoading: boolean;
}

export function SearchSection({ onSearch, isLoading }: SearchSectionProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      onSearch(code.trim());
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Gateway Check</h2>
        <p className="text-muted-foreground">Enter the 6-digit exit code to verify items.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Exit Code (e.g. 009770)"
            className="pl-10 h-12 text-lg tracking-widest font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
        </Button>
      </form>
    </div>
  );
}
