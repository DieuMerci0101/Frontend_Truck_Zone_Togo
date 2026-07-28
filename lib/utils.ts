export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    chauffeur: "Chauffeur",
    proprietaire: "Propriétaire",
    mecanicien: "Mécanicien",
    admin: "Administrateur",
  };
  return labels[role] || role;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    disponible: "bg-green-100 text-green-800",
    en_mission: "bg-yellow-100 text-yellow-800",
    indisponible: "bg-red-100 text-red-800",
    occupe: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    pourvue: "bg-blue-100 text-blue-800",
    expiree: "bg-gray-100 text-gray-800",
    declare: "bg-orange-100 text-orange-800",
    en_cours: "bg-yellow-100 text-yellow-800",
    traite: "bg-green-100 text-green-800",
    cloture: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
