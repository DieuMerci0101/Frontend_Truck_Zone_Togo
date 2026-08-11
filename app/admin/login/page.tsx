"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Session administrateur déjà active : on ne réaffiche pas la page de
  // connexion, on redirige directement vers le dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (String(user.role).toLowerCase() === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Le provider met à jour le state `user` du contexte AVANT la
      // redirection : le garde-fou du layout ne peut donc plus nous
      // renvoyer vers /admin/login (clignotement / retour en arrière).
      await adminLogin({ email, password });
    } catch (err: any) {
      const message = err?.message || "Erreur de connexion";
      setError(
        /timeout/i.test(message)
          ? "Le serveur met trop de temps à répondre (démarrage en cours ?). Veuillez réessayer dans quelques instants."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block"
          >
            Retour à la connexion
          </Link>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Espace Administrateur
          </h1>
          <p className="text-slate-500 mt-1">
            Connectez-vous pour gérer la plateforme
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email administrateur
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@togotruck.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connexion au serveur en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
          {loading && (
            <p className="text-xs text-slate-500 text-center">
              Veuillez patienter, le serveur peut prendre quelques secondes pour
              démarrer.
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Accès réservé aux administrateurs autorisés
          </p>
        </div>
      </div>
    </div>
  );
}
