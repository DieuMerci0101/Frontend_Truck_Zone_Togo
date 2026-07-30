"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isVerificationPage = pathname === "/dashboard/verification";

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 min-h-screen fixed inset-y-0 left-0">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32 bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
            <div className="space-y-2 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 lg:ml-64">
          <div className="h-14 sm:h-16 bg-white border-b border-gray-200 shadow-sm" />
          <div className="p-3 sm:p-4 lg:p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerificationPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-64">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
