"use client";

import { getUser, removeToken, removeUser, removeTokenCookie, removeUserCookie } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function Topbar() {
  const user = getUser();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    removeUser();
    removeTokenCookie();
    removeUserCookie();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
