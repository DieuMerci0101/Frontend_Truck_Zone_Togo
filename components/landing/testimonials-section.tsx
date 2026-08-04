"use client";

const testimonials = [
  {
    name: "Kofi Agbeko",
    role: "Chauffeur",
    image: "/image13.jpeg",
    text: "Je trouve des missions facilement et le contact avec les propriétaires est direct et efficace. La plateforme a changé ma façon de travailler.",
  },
  {
    name: "Ama Dosseh",
    role: "Propriétaire",
    image: "/image14.jpeg",
    text: "J'ai recruté plusieurs chauffeurs grâce à la plateforme. La vérification des documents est un vrai plus pour la confiance.",
  },
  {
    name: "Kwame Mensah",
    role: "Mécanicien certifié",
    image: "/image15.jpeg",
    text: "Les demandes d'assistance arrivent directement sur mon compte. Mon activité a bien augmenté grâce aux interventions à proximité.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-8 sm:py-12 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Témoignages
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Ce que nos utilisateurs disent de la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-slate-200 rounded-xl p-6 sm:p-8 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
            >
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <img
                  src={t.image}
                  alt={`Photo de ${t.name}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-amber-200 shrink-0"
                />
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-sm text-amber-600">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
