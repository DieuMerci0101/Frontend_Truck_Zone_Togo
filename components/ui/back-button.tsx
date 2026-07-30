"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  fallback = "/",
  label = "Retour",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoBack}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm transition-colors",
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
