const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = (ENV_API_URL || "https://truck-zone-togo.onrender.com").replace(/\/+$/, "");
export const API_URL = API_BASE_URL;
export const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Togo Truck Connect";

export const ROLES = {
  chauffeur: "Chauffeur",
  proprietaire: "Propriétaire",
  mecanicien: "Mécanicien",
  admin: "Administrateur",
} as const;

export const CATEGORIES_PERMIS = ["C", "CE", "D"] as const;

export const DISPONIBILITE_CHAUFFEUR = {
  disponible: "Disponible",
  en_mission: "En mission",
  indisponible: "Indisponible",
} as const;

export const TYPE_TRANSPORT = [
  "marchandises",
  "conteneurs",
  "vehicules_lourds",
  "transport_personnes",
  "produits_dangereux",
  "frigorifique",
  "autre",
] as const;

export const ZONES_CIRCULATION = [
  "Lomé",
  "Kara",
  "Sokodé",
  "Kpalimé",
  "Atakpamé",
  "Bassar",
  "Dapaong",
  "Mango",
  "National",
  "International",
  "CEDEAO",
] as const;

export const TYPE_ACTIVITE = {
  transport: "Transport",
  logistique: "Logistique",
  btp: "BTP",
  agriculture: "Agriculture",
  minier: "Minier",
  autre: "Autre",
} as const;

export const TYPE_CAMION = {
  porteur: "Porteur",
  semi_remorque: "Semi-remorque",
  benne: "Benne",
  citerne: "Citerne",
  frigorifique: "Frigorifique",
  bache: "Bâché",
  plateau: "Plateau",
  benne_soulevable: "Benne soulevable",
  autre: "Autre",
} as const;

export const ETAT_CAMION = {
  bon_etat: "Bon état",
  excellent: "Excellent",
  bon: "Bon",
  use: "Usé",
  en_reparation: "En réparation",
} as const;

export const ETAT_CAMION_SELECTABLE = {
  excellent: "Excellent",
  bon: "Bon",
  use: "Usé",
  en_reparation: "En réparation",
} as const;

export const TYPE_CONTRAT = {
  CDD: "CDD",
  CDI: "CDI",
  "Mission ponctuelle": "Mission ponctuelle",
} as const;

export const TYPE_DOCUMENT = {
  permis: "Permis",
  cni: "CNI",
  certificat: "Certificat",
  assurance: "Assurance",
} as const;

export const STATUT_DOCUMENT = {
  en_attente: "En attente",
  valide: "Validé",
  rejete: "Rejeté",
} as const;

export const TARIFICATION_MECANICIEN = {
  Gratuit: "Gratuit",
  Payant: "Payant",
  "Sur devis": "Sur devis",
} as const;

export const DISPONIBILITE_MECANICIEN = {
  disponible: "Disponible",
  occupe: "Occupé",
  indisponible: "Indisponible",
} as const;

export const SPECIALITES_MECANICIEN = [
  "Moteur",
  "Boîte de vitesses",
  "Freins",
  "Pneumatiques",
  "Électricité",
  "Carrosserie",
  "Climatisation",
  "Diesel",
  "Hydraulique",
  "Soudure",
] as const;

export const TYPE_PANNE = {
  Mécanique: "Mécanique",
  Pneumatique: "Pneumatique",
  Électricité: "Électricité",
  Carrosserie: "Carrosserie",
  Autre: "Autre",
} as const;

export const URGENCE = {
  Faible: "Faible",
  Moyenne: "Moyenne",
  Haute: "Haute",
  Critique: "Critique",
} as const;

export const STATUT_ASSISTANCE = {
  en_attente: "En attente",
  pris_en_charge: "Pris en charge",
  assignee: "Assignée",
  en_cours: "En cours",
  terminee: "Terminée",
} as const;

export const TYPE_INCIDENT = {
  Accident: "Accident",
  Panne: "Panne",
  Emboutiillage: "Emboutiillage",
  "Route dégradée": "Route dégradée",
  Autre: "Autre",
} as const;

export const GRAVITE_INCIDENT = {
  Faible: "Faible",
  Moyenne: "Moyenne",
  Grave: "Grave",
  Mortel: "Mortel",
} as const;

export const STATUT_INCIDENT = {
  declare: "Déclaré",
  en_cours: "En cours",
  traite: "Traité",
  cloture: "Clôturé",
} as const;

export const TYPE_NOTIFICATION = {
  message: "Message",
  incident: "Incident",
  assistance: "Assistance",
  document: "Document",
  systeme: "Système",
  admin: "Admin",
} as const;

export const DROPDOWN_DASHBOARD_ROUTES: Record<string, string> = {
  chauffeur: "/dashboard/chauffeur",
  proprietaire: "/dashboard/proprietaire",
  mecanicien: "/dashboard/mecanicien",
  admin: "/dashboard/admin",
};
