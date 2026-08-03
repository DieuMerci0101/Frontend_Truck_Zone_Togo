"use client";

import { useEffect, useRef } from "react";

interface LeafletMapProps {
  lat: number;
  lng: number;
  height?: string;
  zoom?: number;
  interactive?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
  lat,
  lng,
  height = "h-64",
  zoom = 13,
  interactive = true,
  onPositionChange,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let L: any;
    let map: any;
    let marker: any;

    async function init() {
      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css" as string);

      if (!containerRef.current || mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: interactive,
        zoomControl: interactive,
        dragging: interactive,
      });

      // Recalcule la taille de la carte une fois le conteneur rendu,
      // indispensable sur mobile (défilement/rotation) pour un affichage complet.
      setTimeout(() => map.invalidateSize(), 150);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      marker = L.marker([lat, lng], { draggable: interactive }).addTo(map);

      if (interactive && onPositionChange) {
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onPositionChange(pos.lat, pos.lng);
        });
        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          onPositionChange(e.latlng.lat, e.latlng.lng);
        });
      }

      mapRef.current = map;
      markerRef.current = marker;
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng, zoom, interactive, onPositionChange]);

  return <div ref={containerRef} className={`${height} w-full rounded-xl z-0`} />;
}
