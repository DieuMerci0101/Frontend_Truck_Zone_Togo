"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1f2937",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "12px 16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#16a34a",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
