"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function ParametresPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role) {
      const role = String(user.role).toLowerCase();
      router.replace(
        role === "admin" ? "/admin/dashboard/profil" : `/dashboard/${role}/profil`
      );
    }
  }, [user, router]);

  return null;
}
