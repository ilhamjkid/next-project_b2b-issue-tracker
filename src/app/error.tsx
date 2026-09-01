"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({ retry }: { retry: () => void }) {
  return (
    <div className="w-full max-w-115 min-h-screen flex flex-col justify-center items-center gap-4 p-4 mx-auto">
      <AlertCircle className="w-24 h-24 text-error text-center" />
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-semibold text-2xl sm:text-3xl">Something Went Wrong</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          An unexpected server error occurred on our end. Please refresh the page or try again
          later.
        </p>
      </div>
      <Button onClick={() => retry()} variant="outline" size="lg" className="font-semibold">
        Try again
      </Button>
    </div>
  );
}
