"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function ParametresPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role) {
      router.replace(`/dashboard/${user.role}/profil`);
    }
  }, [user, router]);

  return null;
}
