import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnnuaireMecaniciensPage() {
  const mecaniciens = [
    { nom: "Amadou Méca", specialite: "Mécanique générale", localisation: "Lomé - Agoè", disponibilite: "Disponible", tarif: "Payant" },
    { nom: "Kossi Motors", specialite: "Électricité auto", localisation: "Kara - Centre-ville", disponibilite: "Disponible", tarif: "Sur devis" },
    { nom: "Fatima Express", specialite: "Pneumatique", localisation: "Sokodé - Marché central", disponibilite: "Occupé", tarif: "Gratuit" },
    { nom: "Ibrahim Pro", specialite: "Carrosserie & Soudure", localisation: "Atakpamé - Zone industrielle", disponibilite: "Disponible", tarif: "Payant" },
    { nom: "Youssouf Auto", specialite: "Diagnostic électronique", localisation: "Lomé - Bè", disponibilite: "Disponible", tarif: "Payant" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-800">Togo Truck Connect</h1>
          <div className="flex gap-4">
            <a href="/(auth)/login" className="text-blue-700 hover:underline">Connexion</a>
            <a href="/(auth)/register" className="text-blue-700 hover:underline">Inscription</a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Annuaire des mécaniciens</h2>
        <div className="mb-6 flex gap-4">
          <input type="text" placeholder="Rechercher un mécanicien..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Toutes spécialités</option>
            <option>Mécanique générale</option>
            <option>Électricité auto</option>
            <option>Pneumatique</option>
            <option>Carrosserie</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mecaniciens.map((m) => (
            <Card key={m.nom}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{m.nom[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{m.nom}</h3>
                  <p className="text-sm text-gray-500">{m.specialite}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{m.localisation}</p>
              <div className="flex items-center justify-between">
                <Badge variant={m.disponibilite === "Disponible" ? "success" : "warning"}>
                  {m.disponibilite}
                </Badge>
                <span className="text-sm text-gray-500">{m.tarif}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
