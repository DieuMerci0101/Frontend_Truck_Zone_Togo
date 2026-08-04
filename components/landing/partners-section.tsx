"use client";

const partners = [
  "Togo Transport",
  "LogiGo",
  "CamionExpress",
  "RouteSafe",
  "FreightTogo",
  "AfricaHaul",
];

export default function PartnersSection() {
  return (
    <section className="py-8 sm:py-10 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Ils nous font confiance
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Rejoint par des entreprises de transport au Togo
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          {partners.map((partner) => (
            <div
              key={partner}
              className="border border-slate-200 rounded-lg px-5 py-3 min-w-[140px] text-center"
            >
              <span className="text-sm font-bold text-slate-400">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
