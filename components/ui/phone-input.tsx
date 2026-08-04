"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { countryService } from "@/services/country.service";
import type { Country } from "@/types";
import { cn } from "@/lib/cn";

const DEFAULT_COUNTRY_CODE = "TG";

function getFlagEmoji(country: Country): string {
  return country.flag_emoji || "🌍";
}

interface PhoneInputProps {
  /** Numéro complet au format E.164 (ex: "+22870118993") */
  value: string;
  onChange: (fullNumber: string) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export function PhoneInput({
  value,
  onChange,
  error,
  disabled,
  id,
}: PhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selected, setSelected] = useState<Country | null>(null);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chargement de la liste des pays actifs depuis l'API.
  useEffect(() => {
    let mounted = true;
    countryService
      .getCountries()
      .then((list) => {
        if (!mounted) return;
        setCountries(list);
        const togo = list.find((c) => c.code === DEFAULT_COUNTRY_CODE);
        setSelected(togo || list[0] || null);
      })
      .catch(() => {
        if (mounted) setCountries([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Synchronisation avec la valeur fournie par le formulaire.
  useEffect(() => {
    if (countries.length === 0) return;
    const match = countries.find((c) => value.startsWith(c.phone_code));
    if (match && match.code !== selected?.code) {
      setSelected(match);
    }
    if (selected && value.startsWith(selected.phone_code)) {
      setNational(value.slice(selected.phone_code.length));
    } else if (!match) {
      setNational(value.replace(/^\+\d+/, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, countries]);

  // Fermeture du dropdown au clic extérieur.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.trim().toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone_code.includes(q)
    );
  }, [countries, search]);

  const emitChange = (country: Country | null, nationalNumber: string) => {
    const cleaned = nationalNumber.replace(/\D/g, "");
    onChange(country ? `${country.phone_code}${cleaned}` : cleaned);
  };

  const handleSelectCountry = (country: Country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    emitChange(country, national);
  };

  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setNational(digits);
    emitChange(selected, digits);
  };

  const handlePhoneCodeClick = () => {
    if (!disabled) setOpen((v) => !v);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-stretch rounded-lg border bg-white transition-colors overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent",
          error ? "border-red-400" : "border-slate-200"
        )}
      >
        {/* Sélecteur de pays (drapeau + indicatif verrouillé) */}
        <button
          type="button"
          onClick={handlePhoneCodeClick}
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-2 pl-3 pr-2 border-r border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors min-w-[118px] sm:min-w-[130px] text-left"
        >
          {loading ? (
            <span className="text-xs text-slate-400">Chargement…</span>
          ) : (
            <>
              <span className="text-base leading-none">
                {selected ? getFlagEmoji(selected) : "🌍"}
              </span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {selected ? selected.phone_code : "+..."}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            </>
          )}
        </button>

        {/* Saisie du numéro national */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled || loading}
          value={national}
          onChange={handleNationalChange}
          onFocus={() => setOpen(false)}
          placeholder={selected ? "70118993" : "Numéro de téléphone"}
          className="flex-1 min-w-0 px-3 py-3 bg-white text-sm focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Menu déroulant des pays */}
      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays…"
              className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">
                Aucun pays trouvé
              </li>
            )}
            {filtered.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected?.code === country.code}
                  onClick={() => handleSelectCountry(country)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-amber-50",
                    selected?.code === country.code && "bg-amber-50/70"
                  )}
                >
                  <span className="text-base leading-none">{getFlagEmoji(country)}</span>
                  <span className="flex-1 min-w-0 text-slate-800 truncate">
                    {country.name}
                  </span>
                  <span className="text-slate-500 font-medium tabular-nums">
                    {country.phone_code}
                  </span>
                  {selected?.code === country.code && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
        <Phone className="h-3 w-3" />
        Indicatif {selected ? `${selected.phone_code} ${selected.name}` : ""} verrouillé — saisissez la suite de votre numéro.
      </p>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
