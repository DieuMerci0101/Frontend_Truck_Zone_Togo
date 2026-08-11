"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { countryService } from "@/services/country.service";
import type { Country } from "@/types";
import { cn } from "@/lib/cn";

// ── Liste de secours (fallback) ───────────────────────────────────────────
// Permet au sélecteur de fonctionner MÊME si l'API Render est en cours de
// démarrage (cold start) ou indisponible : plus jamais "Aucun pays trouvé".
const FALLBACK_ROWS: Array<[string, string, string, string]> = [
  // 54 pays d'Afrique
  ["DZ", "Algérie", "+213", "🇩🇿"],
  ["AO", "Angola", "+244", "🇦🇴"],
  ["BJ", "Bénin", "+229", "🇧🇯"],
  ["BW", "Botswana", "+267", "🇧🇼"],
  ["BF", "Burkina Faso", "+226", "🇧🇫"],
  ["BI", "Burundi", "+257", "🇧🇮"],
  ["CV", "Cap-Vert", "+238", "🇨🇻"],
  ["CM", "Cameroun", "+237", "🇨🇲"],
  ["CF", "République centrafricaine", "+236", "🇨🇫"],
  ["TD", "Tchad", "+235", "🇹🇩"],
  ["KM", "Comores", "+269", "🇰🇲"],
  ["CG", "Congo", "+242", "🇨🇬"],
  ["CD", "RD Congo", "+243", "🇨🇩"],
  ["CI", "Côte d'Ivoire", "+225", "🇨🇮"],
  ["DJ", "Djibouti", "+253", "🇩🇯"],
  ["EG", "Égypte", "+20", "🇪🇬"],
  ["GQ", "Guinée équatoriale", "+240", "🇬🇶"],
  ["ER", "Érythrée", "+291", "🇪🇷"],
  ["SZ", "Eswatini", "+268", "🇸🇿"],
  ["ET", "Éthiopie", "+251", "🇪🇹"],
  ["GA", "Gabon", "+241", "🇬🇦"],
  ["GM", "Gambie", "+220", "🇬🇲"],
  ["GH", "Ghana", "+233", "🇬🇭"],
  ["GN", "Guinée", "+224", "🇬🇳"],
  ["GW", "Guinée-Bissau", "+245", "🇬🇼"],
  ["KE", "Kenya", "+254", "🇰🇪"],
  ["LS", "Lesotho", "+266", "🇱🇸"],
  ["LR", "Liberia", "+231", "🇱🇷"],
  ["LY", "Libye", "+218", "🇱🇾"],
  ["MG", "Madagascar", "+261", "🇲🇬"],
  ["MW", "Malawi", "+265", "🇲🇼"],
  ["ML", "Mali", "+223", "🇲🇱"],
  ["MR", "Mauritanie", "+222", "🇲🇷"],
  ["MU", "Maurice", "+230", "🇲🇺"],
  ["MA", "Maroc", "+212", "🇲🇦"],
  ["MZ", "Mozambique", "+258", "🇲🇿"],
  ["NA", "Namibie", "+264", "🇳🇦"],
  ["NE", "Niger", "+227", "🇳🇪"],
  ["NG", "Nigeria", "+234", "🇳🇬"],
  ["RW", "Rwanda", "+250", "🇷🇼"],
  ["ST", "Sao Tomé-et-Principe", "+239", "🇸🇹"],
  ["SN", "Sénégal", "+221", "🇸🇳"],
  ["SC", "Seychelles", "+248", "🇸🇨"],
  ["SL", "Sierra Leone", "+232", "🇸🇱"],
  ["SO", "Somalie", "+252", "🇸🇴"],
  ["ZA", "Afrique du Sud", "+27", "🇿🇦"],
  ["SS", "Soudan du Sud", "+211", "🇸🇸"],
  ["SD", "Soudan", "+249", "🇸🇩"],
  ["TZ", "Tanzanie", "+255", "🇹🇿"],
  ["TG", "Togo", "+228", "🇹🇬"],
  ["TN", "Tunisie", "+216", "🇹🇳"],
  ["UG", "Ouganda", "+256", "🇺🇬"],
  ["ZM", "Zambie", "+260", "🇿🇲"],
  ["ZW", "Zimbabwe", "+263", "🇿🇼"],
  // Principaux pays internationaux
  ["FR", "France", "+33", "🇫🇷"],
  ["BE", "Belgique", "+32", "🇧🇪"],
  ["CH", "Suisse", "+41", "🇨🇭"],
  ["LU", "Luxembourg", "+352", "🇱🇺"],
  ["DE", "Allemagne", "+49", "🇩🇪"],
  ["IT", "Italie", "+39", "🇮🇹"],
  ["ES", "Espagne", "+34", "🇪🇸"],
  ["PT", "Portugal", "+351", "🇵🇹"],
  ["NL", "Pays-Bas", "+31", "🇳🇱"],
  ["GB", "Royaume-Uni", "+44", "🇬🇧"],
  ["US", "États-Unis", "+1", "🇺🇸"],
  ["CA", "Canada", "+1", "🇨🇦"],
  ["CN", "Chine", "+86", "🇨🇳"],
  ["JP", "Japon", "+81", "🇯🇵"],
  ["IN", "Inde", "+91", "🇮🇳"],
  ["AE", "Émirats arabes unis", "+971", "🇦🇪"],
  ["SA", "Arabie saoudite", "+966", "🇸🇦"],
  ["TR", "Turquie", "+90", "🇹🇷"],
  ["RU", "Russie", "+7", "🇷🇺"],
  ["BR", "Brésil", "+55", "🇧🇷"],
  ["AR", "Argentine", "+54", "🇦🇷"],
  ["MX", "Mexique", "+52", "🇲🇽"],
  ["AU", "Australie", "+61", "🇦🇺"],
];

const FALLBACK_COUNTRIES: Country[] = FALLBACK_ROWS.map(([code, name, phone_code, flag_emoji]) => ({
  id: `fb-${code}`,
  name,
  code,
  phone_code,
  flag_emoji,
  is_active: true,
}));

// Longueurs valides (nombre de chiffres) du numéro national par pays.
// [min, max] — nombre de chiffres SAUF l'indicatif international.
const NATIONAL_LENGTH: Record<string, [number, number]> = {
  TG: [8, 8],
  BJ: [8, 8],
  GH: [8, 9],
  CI: [8, 10],
  NG: [7, 10],
  SN: [9, 9],
  BF: [8, 8],
  CM: [9, 9],
  ML: [8, 8],
  NE: [8, 8],
  GN: [8, 8],
  MR: [8, 8],
  SL: [8, 8],
  LR: [7, 8],
  GM: [7, 7],
  CV: [7, 7],
  GA: [8, 8],
  CG: [9, 9],
  CD: [9, 9],
  AO: [9, 9],
  MZ: [9, 9],
  MG: [9, 9],
  MW: [7, 9],
  ZM: [9, 9],
  ZW: [9, 9],
  TZ: [9, 9],
  KE: [9, 9],
  UG: [9, 9],
  ET: [9, 9],
  EG: [8, 9],
  MA: [9, 9],
  DZ: [9, 9],
  TN: [8, 8],
  LY: [9, 9],
  TD: [8, 8],
  CF: [8, 8],
  DJ: [8, 8],
  RW: [9, 9],
  BI: [8, 8],
  SO: [7, 9],
  SD: [9, 9],
  SS: [9, 9],
  BW: [7, 8],
  KM: [7, 7],
  ER: [7, 7],
  SZ: [7, 7],
  LS: [8, 8],
  MU: [8, 8],
  NA: [9, 9],
  ST: [7, 7],
  SC: [7, 7],
  ZA: [9, 9],
  FR: [9, 9],
  BE: [8, 8],
  CH: [9, 9],
  LU: [6, 9],
  DE: [6, 11],
  IT: [8, 10],
  ES: [9, 9],
  PT: [9, 9],
  NL: [9, 9],
  GB: [9, 10],
  US: [10, 10],
  CA: [10, 10],
  CN: [8, 11],
  JP: [9, 10],
  IN: [10, 10],
  AE: [9, 9],
  SA: [9, 9],
  TR: [10, 10],
  RU: [10, 10],
  BR: [10, 11],
  AR: [8, 10],
  MX: [10, 10],
  AU: [9, 9],
};

const DEFAULT_NATIONAL_LENGTH: [number, number] = [6, 13];

function getFlagEmoji(country: Country): string {
  return country.flag_emoji || "🌍";
}

/** Vérifie que le numéro national saisi correspond au format du pays. */
export function isValidNationalNumber(country: Country | null, national: string): boolean {
  if (!country) return false;
  const digits = national.replace(/\D/g, "");
  if (digits.length === 0) return false;
  const [min, max] = NATIONAL_LENGTH[country.code] || DEFAULT_NATIONAL_LENGTH;
  return digits.length >= min && digits.length <= max;
}

export interface PhoneChangeMeta {
  /** Pays sélectionné (ou null si aucun). */
  country: Country | null;
  /** Numéro national saisi (chiffres uniquement). */
  national: string;
  /** Numéro complet : indicatif + numéro national (ou numéro seul sans pays). */
  fullNumber: string;
  /** Pays sélectionné ET nombre de chiffres conforme au pays. */
  isValid: boolean;
}

interface PhoneInputProps {
  /** Numéro complet au format E.164 (ex: "+22870118993"). */
  value: string;
  onChange: (fullNumber: string, meta: PhoneChangeMeta) => void;
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
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [selected, setSelected] = useState<Country | null>(null);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Au chargement, la liste de secours est déjà affichée : le sélecteur
  // fonctionne immédiatement. L'API vient ensuite rafraîchir la liste.
  // AUCUN pays n'est pré-sélectionné ni verrouillé par défaut.
  useEffect(() => {
    let mounted = true;
    countryService
      .getCountries()
      .then((list) => {
        if (!mounted) return;
        const serverList =
          Array.isArray(list) && list.length > 0 ? list : FALLBACK_COUNTRIES;
        setCountries(serverList);
      })
      .catch(() => {
        // L'API est injoignable (cold start Render...) : la liste de secours
        // reste en place, aucun blocage pour l'utilisateur.
        if (mounted) setCountries(FALLBACK_COUNTRIES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Liste affichée : tri alphabétique (A → Z) + recherche temps réel.
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );
  }, [countries]);

  const filtered = useMemo(() => {
    const base = sortedCountries;
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone_code.includes(q)
    );
  }, [sortedCountries, search]);

  // Synchronisation avec la valeur fournie par le formulaire : si la valeur
  // commence par l'indicatif d'un pays connu, ce pays est sélectionné.
  useEffect(() => {
    const match = countries.find((c) => value.startsWith(c.phone_code));
    if (match && match.code !== selected?.code) {
      setSelected(match);
    }
    if (selected && value.startsWith(selected.phone_code)) {
      setNational(value.slice(selected.phone_code.length));
    } else if (match) {
      setNational(value.slice(match.phone_code.length));
    } else {
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

  const emitChange = (country: Country | null, nationalNumber: string) => {
    const cleaned = nationalNumber.replace(/\D/g, "");
    const fullNumber = country ? `${country.phone_code}${cleaned}` : cleaned;
    onChange(fullNumber, {
      country,
      national: cleaned,
      fullNumber,
      isValid: isValidNationalNumber(country, cleaned),
    });
  };

  const handleSelectCountry = (country: Country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    setTouched(false);
    emitChange(country, national);
  };

  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setNational(digits);
    setTouched(true);
    emitChange(selected, digits);
  };

  const handlePhoneCodeClick = () => {
    if (!disabled) setOpen((v) => !v);
  };

  // Validation du format selon le pays sélectionné.
  const digits = national.replace(/\D/g, "");
  const [minDigits, maxDigits] = selected
    ? NATIONAL_LENGTH[selected.code] || DEFAULT_NATIONAL_LENGTH
    : DEFAULT_NATIONAL_LENGTH;
  const isTooLong = digits.length > maxDigits;
  const isTooShort = digits.length > 0 && digits.length < minDigits;
  const hasCountryFormatIssue = !!selected && (isTooLong || (isTooShort && touched));
  const phoneValid = !!selected && digits.length > 0 && !isTooLong && digits.length >= minDigits;

  const showFormatError = hasCountryFormatIssue || error || (!!selected && touched && digits.length === 0);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-stretch rounded-lg border bg-white transition-colors overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent",
          showFormatError ? "border-red-400" : "border-slate-200"
        )}
      >
        {/* Sélecteur de pays (drapeau + indicatif), libre : aucun pays verrouillé */}
        <button
          type="button"
          onClick={handlePhoneCodeClick}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-2 pl-3 pr-2 border-r border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors min-w-[150px] sm:min-w-[170px] text-left"
        >
          <span className="text-base leading-none">
            {selected ? getFlagEmoji(selected) : "🌍"}
          </span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums truncate",
              selected ? "text-slate-700" : "text-slate-400"
            )}
          >
            {selected ? `${selected.phone_code}` : "Choisir"}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </button>

        {/* Saisie du numéro national */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={national}
          onChange={handleNationalChange}
          onFocus={() => setOpen(false)}
          onBlur={() => setTouched(true)}
          placeholder={selected ? "70 11 89 93" : "Sélectionnez un pays puis saisissez"}
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
        {selected
          ? `Indicatif ${selected.phone_code} (${selected.name}) — saisissez la suite de votre numéro.`
          : "Sélectionnez un pays : son indicatif est ajouté automatiquement."}
      </p>
      {showFormatError && (
        <p className="mt-1 text-xs text-red-500 font-medium">
          {error ||
            "Veuillez saisir un numéro de téléphone valide pour le pays sélectionné."}
        </p>
      )}
    </div>
  );
}
