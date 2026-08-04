import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-10 sm:py-14 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
            backgroundImage:
              "url('/images/image 5.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
          Prêt à rejoindre la plateforme ?
        </h2>
        <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto">
          Créez votre compte gratuitement et accédez à l&apos;ensemble des services.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm min-h-[44px]"
          >
            Commencer dès maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 hover:border-white/60 transition-colors min-h-[44px]"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    </section>
  );
}
