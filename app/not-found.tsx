import Link from "next/link";
import BackButton from "@/components/ui/back-button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center truck-pattern overflow-x-hidden">
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-bold leading-none text-white/10">404</h1>
        <div className="mt-[-2rem] sm:mt-[-3rem] lg:mt-[-4rem]">
          <img
            src="/logo1.jpeg"
            alt="Togo Truck Connect"
            className="h-12 w-auto sm:h-14 lg:h-16 mx-auto mb-4 sm:mb-6 object-contain rounded-xl"
          />
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Page non trouvée</h2>
          <p className="text-blue-200 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <BackButton fallback="/" label="Retour à l'accueil" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold text-base" />
        </div>
      </div>
    </div>
  );
}
