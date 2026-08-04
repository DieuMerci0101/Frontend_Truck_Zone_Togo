"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

const CRITERIA: Array<{ id: string; label: string; test: (pwd: string) => boolean }> = [
  { id: "length", label: "Au moins 8 caractères", test: (pwd) => pwd.length >= 8 },
  { id: "upper", label: "Au moins une lettre majuscule (A-Z)", test: (pwd) => /[A-Z]/.test(pwd) },
  { id: "lower", label: "Au moins une lettre minuscule (a-z)", test: (pwd) => /[a-z]/.test(pwd) },
  { id: "digit", label: "Au moins un chiffre (0-9)", test: (pwd) => /\d/.test(pwd) },
  { id: "special", label: "Au moins un caractère spécial (@, #, $, !, &, *…)", test: (pwd) => /[^A-Za-z0-9]/.test(pwd) },
];

export function getPasswordChecks(password: string): boolean[] {
  return CRITERIA.map((c) => c.test(password));
}

export function isPasswordStrong(password: string): boolean {
  return password.length > 0 && CRITERIA.every((c) => c.test(password));
}

export function PasswordStrength({ password }: { password: string }) {
  const active = password.length > 0;

  return (
    <ul className="mt-2 space-y-1.5">
      {CRITERIA.map((crit) => {
        const ok = crit.test(password);
        return (
          <li
            key={crit.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              !active ? "text-slate-400" : ok ? "text-green-600" : "text-red-500"
            )}
          >
            {ok ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-red-500" />
            )}
            <span>{crit.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
