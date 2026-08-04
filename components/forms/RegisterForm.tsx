"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { setToken, setUser, setRefreshToken, setTokenCookie, setUserCookie } from "@/lib/auth";
import { API_URL } from "@/constants";

const ROLES = [
  { value: "chauffeur", label: "Chauffeur", icon: "🚛", desc: "Conduire & livrer" },
  { value: "proprietaire", label: "Propriétaire", icon: "💼", desc: "Gérer mes camions" },
  { value: "mecanicien", label: "Mécanicien", icon: "🔧", desc: "Réparer & dépanner" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Veuillez sélectionner votre rôle");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom_complet: nomComplet,
          email,
          telephone,
          password,
          confirm_password: confirmPassword,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur d'inscription");
      }

      // Auto-login after registration
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        setToken(loginData.access_token);
        setRefreshToken(loginData.refresh_token);
        setUser(loginData.user);
        setTokenCookie(loginData.access_token);
        setUserCookie(loginData.user);
      }

      const rolePath: Record<string, string> = {
        chauffeur: "/dashboard/chauffeur",
        proprietaire: "/dashboard/proprietaire",
        mecanicien: "/dashboard/mecanicien",
      };

      router.push(rolePath[selectedRole] || "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Je suis... *
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

      {/* Nom complet */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nom complet
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={nomComplet}
            onChange={(e) => setNomComplet(e.target.value)}
            className="input-field pl-11"
            placeholder="Jean Dupont"
            minLength={2}
            required
          />
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

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Téléphone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="input-field pl-11"
            placeholder="+228 90 12 34 56"
            minLength={8}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Mot de passe
        </label>
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
        <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`input-field pl-11 pr-11 ${
              confirmPassword && !passwordsMatch
                ? "border-red-300 focus:ring-red-500"
                : passwordsMatch
                ? "border-green-300 focus:ring-green-500"
                : ""
            }`}
            placeholder="••••••••"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {confirmPassword && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
            {passwordsMatch && <Check className="h-3 w-3" />}
            {passwordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Créer mon compte"
        )}
      </button>

      {/* Links */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
