import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800">Togo Truck Connect</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
