// ─── User ───────────────────────────────────────────
export type UserRole = "chauffeur" | "proprietaire" | "mecanicien" | "admin";

// ─── Pays / indicatifs internationaux ───────────────
export interface Country {
  id: string;
  name: string;
  code: string; // ISO 2 lettres (ex: "TG")
  phone_code: string; // indicatif E.164 (ex: "+228")
  flag_emoji?: string | null;
  is_active?: boolean;
}

export type VerificationStatusUser =
  | "pending_upload"
  | "pending_approval"
  | "approved"
  | "rejected";

export interface User {
  id: string;
  email: string;
  nom_complet: string;
  telephone: string;
  role: UserRole;
  photo_profil?: string | null;
  photo_profil_version?: number;
  date_naissance?: string | null;
  lieu_naissance?: string | null;
  adresse?: string | null;
  bio?: string | null;
  is_verified: boolean;
  is_active: boolean;
  verification_status?: VerificationStatusUser;
  verification_reject_motif?: string | null;
  created_at: string;
}

export interface UserRegister {
  nom_complet: string;
  email: string;
  password: string;
  confirm_password: string;
  /** Pays sélectionné (table `countries`). */
  country_id: string;
  /** Numéro national (hors indicatif) — l'indicatif est ajouté côté serveur. */
  phone_number: string;
  role: "chauffeur" | "proprietaire" | "mecanicien";
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface TokenRefresh {
  refresh_token: string;
}

export interface UserUpdate {
  nom_complet?: string;
  telephone?: string;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
}

export interface ForgotPassword {
  email: string;
}

export interface VerifyOTP {
  email: string;
  code: string;
}

export interface ResetPassword {
  email: string;
  code: string;
  new_password: string;
}

// ─── Chauffeur ──────────────────────────────────────
export type CategoriePermis = "C" | "CE" | "D";
export type DisponibiliteChauffeur = "disponible" | "en_mission" | "indisponible";

export interface ProfilChauffeur {
  id: string;
  user_id: string;
  numero_permis: string;
  categorie_permis: CategoriePermis;
  annees_experience: number;
  types_transport: string[];
  zones_circulation: string[];
  disponibilite: DisponibiliteChauffeur;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  // Joined data from API
  user?: User;
}

export interface ProfilChauffeurCreate {
  numero_permis: string;
  categorie_permis: CategoriePermis;
  annees_experience: number;
  types_transport: string[];
  zones_circulation: string[];
  disponibilite?: DisponibiliteChauffeur;
  bio?: string;
}

export interface ProfilChauffeurUpdate {
  numero_permis?: string;
  categorie_permis?: CategoriePermis;
  annees_experience?: number;
  types_transport?: string[];
  zones_circulation?: string[];
  disponibilite?: DisponibiliteChauffeur;
  bio?: string;
  photo_url?: string;
}

export interface DisponibiliteUpdate {
  disponibilite: DisponibiliteChauffeur;
}

// ─── Proprietaire ───────────────────────────────────
export type TypeActivite = "transport" | "logistique" | "btp" | "agriculture" | "minier" | "autre";

export interface ProfilProprietaire {
  id: string;
  user_id: string;
  nom_entreprise: string | null;
  type_activite: TypeActivite;
  adresse: string;
  localisation_lat: number | null;
  localisation_lng: number | null;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  user?: User;
}

export interface ProfilProprietaireUpdate {
  nom_entreprise?: string;
  type_activite?: TypeActivite;
  adresse?: string;
  localisation_lat?: number;
  localisation_lng?: number;
  bio?: string;
  photo_url?: string;
}

// ─── Camion ─────────────────────────────────────────
export type TypeCamion =
  | "porteur"
  | "semi_remorque"
  | "benne"
  | "citerne"
  | "frigorifique"
  | "bache"
  | "plateau"
  | "benne_soulevable"
  | "autre";

export type EtatCamion = "bon_etat" | "excellent" | "bon" | "use" | "en_reparation";

export interface ProprietaireInfo {
  id: string;
  user_id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  photo_profil?: string | null;
}

export interface Camion {
  id: string;
  proprietaire_id?: string | null;
  chauffeur_id?: string | null;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  type_camion: TypeCamion;
  capacite_charge: number;
  etat: EtatCamion;
  description: string | null;
  photo_principale_url: string | null;
  is_public: boolean;
  expires_at?: string | null;
  nb_essieux?: number | null;
  carburant?: string | null;
  boite_vitesse?: string | null;
  kilometrage?: number | null;
  localisation?: string | null;
  photos: CamionPhoto[];
  proprietaire_info?: ProprietaireInfo | null;
  created_at: string;
  proprietaire?: ProfilProprietaire;
  chauffeur?: ProfilChauffeur;
}

export interface CamionCreate {
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  type_camion: TypeCamion;
  capacite_charge: number;
  etat: EtatCamion;
  description?: string;
  is_public?: boolean;
  nb_essieux?: number;
  carburant?: string;
  boite_vitesse?: string;
  kilometrage?: number;
  localisation?: string;
}

export interface CamionUpdate {
  immatriculation?: string;
  marque?: string;
  modele?: string;
  annee?: number;
  type_camion?: TypeCamion;
  capacite_charge?: number;
  etat?: EtatCamion;
  description?: string;
  is_public?: boolean;
  nb_essieux?: number;
  carburant?: string;
  boite_vitesse?: string;
  kilometrage?: number;
  localisation?: string;
}

export interface CamionPhoto {
  id: string;
  camion_id: string;
  photo_url: string;
  est_principale: boolean;
  created_at: string;
}

// ─── Offre ──────────────────────────────────────────
export type TypeContrat = "CDD" | "CDI" | "Mission ponctuelle";
export type StatutOffre = "active" | "pourvue" | "expirée";

export interface Offre {
  id: string;
  proprietaire_id: string;
  proprietaire_info?: {
    nom_complet: string;
    nom_entreprise?: string;
    photo_profil?: string | null;
    telephone: string;
  } | null;
  titre: string;
  description: string;
  type_contrat: TypeContrat;
  salaire_propose: number;
  zone_travail: string;
  date_debut: string;
  camion_id: string | null;
  statut: StatutOffre;
  created_at: string;
  expires_at?: string | null;
  is_editable?: boolean;
  is_expired?: boolean;
}

export interface OffreCreate {
  titre: string;
  description: string;
  type_contrat: TypeContrat;
  salaire_propose: number;
  zone_travail: string;
  date_debut: string;
  camion_id?: string;
}

export interface OffreUpdate {
  titre?: string;
  description?: string;
  type_contrat?: TypeContrat;
  salaire_propose?: number;
  zone_travail?: string;
  date_debut?: string;
  camion_id?: string;
}

// ─── Mecanicien ─────────────────────────────────────
export type TarificationMecanicien = "Gratuit" | "Payant" | "Sur devis";
export type DisponibiliteMecanicien = "disponible" | "occupe" | "indisponible";
export type VerificationStatusMecanicien =
  | "pending_upload"
  | "pending_approval"
  | "approved"
  | "rejected";

export interface ProfilMecanicien {
  id: string;
  user_id: string;
  nom_complet?: string;
  specialites: string[];
  annees_experience: number;
  certifications: string[] | null;
  tarification: TarificationMecanicien;
  disponibilite: DisponibiliteMecanicien;
  localisation_lat: number | null;
  localisation_lng: number | null;
  rayon_intervention: number;
  bio: string | null;
  photo_url: string | null;
  proof_document_url?: string | null;
  verification_status?: VerificationStatusMecanicien;
  position_active?: boolean;
  position_updated_at?: string | null;
  created_at: string;
  user?: User;
}

export interface MecanicienActif {
  id: string;
  nom_complet: string;
  telephone: string | null;
  photo_url: string | null;
  specialites: string[];
  disponibilite: DisponibiliteMecanicien;
  localisation_lat: number | null;
  localisation_lng: number | null;
  position_active: boolean;
  position_updated_at: string | null;
  distance_km: number | null;
}

export interface ProfilMecanicienUpdate {
  specialites?: string[];
  annees_experience?: number;
  certifications?: string[];
  tarification?: TarificationMecanicien;
  localisation_lat?: number;
  localisation_lng?: number;
  rayon_intervention?: number;
  bio?: string;
  photo_url?: string;
  disponibilite?: DisponibiliteMecanicien;
}

// ─── Assistance ─────────────────────────────────────
export type TypePanne = "Mécanique" | "Pneumatique" | "Électricité" | "Carrosserie" | "Autre";
export type Urgence = "Faible" | "Moyenne" | "Haute" | "Critique";
export type StatutAssistance = "en_attente" | "pris_en_charge" | "assignee" | "en_cours" | "terminee";

export interface DemandeurInfo {
  id: string;
  nom_complet: string;
  photo_profil: string | null;
  role: string;
}

export interface MecanicienInfo {
  id: string;
  nom_complet: string;
  photo_profil: string | null;
}

export interface DeclarantInfo {
  id: string;
  nom_complet: string;
  photo_profil: string | null;
  role: string;
}

export interface Assistance {
  id: string;
  demandeur_id: string;
  demandeur_info?: DemandeurInfo | null;
  mecanicien_id: string | null;
  mecanicien_info?: MecanicienInfo | null;
  type_panne: TypePanne;
  description: string;
  urgence: Urgence;
  vehicule_description: string;
  statut: StatutAssistance;
  localisation_lat?: number | null;
  localisation_lng?: number | null;
  created_at: string;
}

export interface AssistanceCreate {
  type_panne: TypePanne;
  description: string;
  urgence: Urgence;
  localisation_lat: number;
  localisation_lng: number;
  vehicule_description: string;
}

export interface AssistanceUpdateStatut {
  statut: StatutAssistance;
}

// ─── Conversation / Messages ────────────────────────
export interface ConversationParticipant extends User {
  presence?: string | null;
}

export interface Conversation {
  id: string;
  type: "directe" | "groupe";
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  participants?: ConversationParticipant[];
}

export interface ConversationCreate {
  participant_id: string;
  premier_message?: string;
}

export type TypeMessage = "texte" | "image" | "fichier" | "audio";

export interface Message {
  id: string;
  conversation_id: string;
  expediteur_id: string;
  contenu: string;
  type: TypeMessage;
  media_url?: string | null;
  lu: boolean;
  created_at: string;
  expediteur_nom?: string | null;
  expediteur_avatar?: string | null;
  expediteur_role?: string | null;
}

export interface MessageCreate {
  contenu: string;
  type?: TypeMessage;
}

// ─── Incident ───────────────────────────────────────
export type TypeIncident = "Accident" | "Panne" | "Emboutiillage" | "Route dégradée" | "Autre";
export type GraviteIncident = "Faible" | "Moyenne" | "Grave" | "Mortel";
export type StatutIncident = "declare" | "en_cours" | "traite" | "cloture";

export interface Incident {
  id: string;
  declarant_id: string;
  declarant_info?: DeclarantInfo | null;
  type_incident: TypeIncident;
  date_incident: string;
  description: string;
  gravite: GraviteIncident;
  vehicules_impliques: string[] | null;
  victimes: boolean;
  nombre_victimes: number | null;
  statut: StatutIncident;
  localisation_lat?: number | null;
  localisation_lng?: number | null;
  photo_url?: string | null;
  created_at: string;
}

export interface IncidentCreate {
  type_incident: TypeIncident;
  date_incident: string;
  localisation_lat: number;
  localisation_lng: number;
  description: string;
  gravite: GraviteIncident;
  vehicules_impliques?: string[];
  victimes?: boolean;
  nombre_victimes?: number;
  temoin_contact?: string;
}

export interface IncidentUpdate {
  type_incident?: TypeIncident;
  description?: string;
  gravite?: GraviteIncident;
  victimes?: boolean;
  nombre_victimes?: number;
  statut?: StatutIncident;
}

export interface IncidentStatistiques {
  total: number;
  par_type: Record<string, number>;
  par_gravite: Record<string, number>;
  par_mois: Record<string, unknown>[];
}

export interface IncidentCommentaire {
  id: string;
  incident_id: string;
  auteur_id: string;
  contenu: string;
  created_at: string;
}

export interface IncidentCommentaireCreate {
  contenu: string;
}

// ─── Document ───────────────────────────────────────
export type TypeDocument =
  | "permis"
  | "cni"
  | "passeport"
  | "certificat"
  | "assurance"
  | "casier"
  | "rccm"
  | "patente"
  | "diplome"
  | "photo_identite";
export type StatutDocument = "en_attente" | "valide" | "rejete";

export interface Document {
  id: string;
  utilisateur_id: string;
  utilisateur_nom?: string;
  utilisateur_email?: string;
  utilisateur_role?: string;
  type_document: TypeDocument;
  fichier_url: string;
  statut: StatutDocument;
  commentaire_admin?: string;
  created_at: string;
  validated_at?: string;
}

// ─── Notification ───────────────────────────────────
export type TypeNotification = "message" | "incident" | "assistance" | "document" | "systeme" | "admin";

export interface Notification {
  id: string;
  destinataire_id: string;
  titre: string;
  contenu: string;
  type: TypeNotification;
  lu: boolean;
  lien: string | null;
  created_at: string;
}

export interface NotificationCreate {
  destinataire_id: string;
  titre: string;
  contenu: string;
  type?: TypeNotification;
  lien?: string;
}

// ─── Admin ──────────────────────────────────────────
export interface AdminStats {
  total_utilisateurs?: number;
  chauffeurs?: number;
  proprietaires?: number;
  mecaniciens?: number;
  admins?: number;
  [key: string]: number | undefined;
}

// ─── API Pagination ─────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
