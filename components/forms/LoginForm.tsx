"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { setTokenCookie, setUserCookie } from "@/lib/auth";
import { API_URL } from "@/constants";

const ROLES = [
  { value: "chauffeur", label: "Chauffeur", icon: "🚛", desc: "Conduire & livrer" },
  { value: "proprietaire", label: "Propriétaire", icon: "💼", desc: "Gérer mes camions" },
  { value: "mecanicien", label: "Mécanicien", icon: "🔧", desc: "Réparer & dépanner" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur de connexion");
      }

      // Vérifier que le rôle correspond
      if (selectedRole && data.user.role !== selectedRole) {
        throw new Error(`Ce compte n'est pas un ${ROLES.find(r => r.value === selectedRole)?.label}`);
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Cookies pour le middleware Next.js
      setTokenCookie(data.access_token);
      setUserCookie(data.user);

      const rolePath: Record<string, string> = {
        chauffeur: "/dashboard/chauffeur",
        proprietaire: "/dashboard/proprietaire",
        mecanicien: "/dashboard/mecanicien",
      };

      router.push(rolePath[data.user.role] || "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Je suis...
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedRole === role.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{role.icon}</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">{role.label}</p>
              <p className="text-xs text-gray-500">{role.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field pl-11"
            placeholder="votre@email.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-gray-700">
            Mot de passe
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pl-11 pr-11"
            placeholder="••••••••"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </button>

      {/* Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            S&apos;inscrire
          </Link>
        </p>
        <Link
          href="/admin/login"
          className="text-xs text-gray-400 hover:text-gray-600 font-medium inline-block"
        >
          Espace administrateur
        </Link>
      </div>
    </form>
  );
}
