"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";

export interface MechanicPosition {
  lat: number;
  lng: number;
}

interface MechanicLocationContextValue {
  position: MechanicPosition | null;
  isActive: boolean;
  gpsLoading: boolean;
  lastUpdatedAt: string | null;
  activate: () => void;
  deactivate: () => void;
  updatePosition: (lat: number, lng: number, options?: { silent?: boolean }) => void;
  refresh: () => void;
}

const MechanicLocationContext = createContext<MechanicLocationContextValue | null>(null);

export function MechanicLocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMechanic = user?.role === "mecanicien";

  const [position, setPosition] = useState<MechanicPosition | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const persist = useCallback(
    async (lat: number, lng: number) => {
      await mecanicienService.updateLocation(lat, lng);
      setIsActive(true);
      setLastUpdatedAt(new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ["mecanicien", "profile"] });
    },
    [queryClient]
  );

  const refresh = useCallback(() => {
    if (!isMechanic) return;
    mecanicienService
      .getMyProfile()
      .then((p) => {
        if (p.localisation_lat && p.localisation_lng) {
          setPosition({ lat: p.localisation_lat, lng: p.localisation_lng });
        }
        setIsActive(!!p.position_active);
        setLastUpdatedAt(p.position_updated_at || null);
      })
      .catch(() => {});
  }, [isMechanic]);

  useEffect(() => {
    if (isMechanic) refresh();
  }, [isMechanic, refresh]);

  const updatePosition = useCallback(
    (lat: number, lng: number, options?: { silent?: boolean }) => {
      setPosition({ lat, lng });
      persist(lat, lng)
        .then(() => {
          if (!options?.silent) toast.success("Position enregistrée");
        })
        .catch(() => {
          if (!options?.silent) toast.error("Erreur lors de l'enregistrement de la position");
        });
    },
    [persist]
  );

  const activate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        mecanicienService
          .activateLocation(lat, lng)
          .then(() => {
            setIsActive(true);
            setLastUpdatedAt(new Date().toISOString());
            toast.success("Position activée — vous êtes visible par les chauffeurs");
          })
          .catch(() => toast.error("Impossible d'activer la position"))
          .finally(() => setGpsLoading(false));
      },
      () => {
        toast.error("Impossible de récupérer la position");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const deactivate = useCallback(() => {
    mecanicienService
      .deactivateLocation()
      .then(() => {
        setIsActive(false);
        toast.success("Position désactivée");
      })
      .catch(() => toast.error("Erreur lors de la désactivation"));
  }, []);

  // Actualisation automatique toutes les 30 s tant que la position est active.
  useEffect(() => {
    if (!isMechanic || !isActive) return;
    const interval = setInterval(() => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition({ lat, lng });
          mecanicienService
            .updateLocation(lat, lng)
            .then(() => setLastUpdatedAt(new Date().toISOString()))
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [isMechanic, isActive]);

  // Désactive la position au démontage (déconnexion / sortie du dashboard).
  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (isActiveRef.current) {
        mecanicienService.deactivateLocation().catch(() => {});
      }
    };
  }, []);

  return (
    <MechanicLocationContext.Provider
      value={{ position, isActive, gpsLoading, lastUpdatedAt, activate, deactivate, updatePosition, refresh }}
    >
      {children}
    </MechanicLocationContext.Provider>
  );
}

export function useMechanicLocation(): MechanicLocationContextValue {
  const ctx = useContext(MechanicLocationContext);
  if (!ctx) {
    throw new Error("useMechanicLocation doit être utilisé dans MechanicLocationProvider");
  }
  return ctx;
}
