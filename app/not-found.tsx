import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center truck-pattern overflow-x-hidden">
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-bold leading-none text-white/10">404</h1>
        <div className="mt-[-2rem] sm:mt-[-3rem] lg:mt-[-4rem]">
          <Truck className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-4 sm:mb-6 text-orange-400" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Page non trouvée</h2>
          <p className="text-blue-200 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 min-h-[44px]">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
