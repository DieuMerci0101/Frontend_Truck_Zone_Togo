"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user && user.role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Redirection vers l&apos;espace administrateur…</p>
      </div>
    </div>
  );
}
