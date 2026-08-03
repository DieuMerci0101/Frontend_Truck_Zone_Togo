"use client";

import { useEffect, useRef, useState } from "react";

export interface MechanicMarkerData {
  id: string;
  lat: number;
  lng: number;
  nom: string;
  photo?: string | null;
  telephone?: string | null;
  specialites?: string[];
  distance_km?: number | null;
  disponibilite?: string;
}

interface MechanicsLiveMapProps {
  center: { lat: number; lng: number } | null;
  mechanics?: MechanicMarkerData[];
  height?: string;
  zoom?: number;
  userDraggable?: boolean;
  onUserMove?: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER = { lat: 6.1319, lng: 1.2228 };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(nom: string): string {
  return nom
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const USER_PIN = `
<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 1C9.8 1 4 6.8 4 14c0 9 13 19 13 19s13-10 13-19c0-7.2-5.8-13-13-13z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <circle cx="17" cy="14" r="5" fill="#ffffff"/>
</svg>`;

const MECANICIEN_PIN = `
<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 1C9.8 1 4 6.8 4 14c0 9 13 19 13 19s13-10 13-19c0-7.2-5.8-13-13-13z" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
  <path d="M12 14h10M17 9v10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

function popupHtml(m: MechanicMarkerData): string {
  const nom = escapeHtml(m.nom || "Mécanicien");
  const specs = (m.specialites || []).slice(0, 3).map(escapeHtml).join(" · ") || "Généraliste";
  const photo = m.photo
    ? `<img src="${escapeHtml(m.photo)}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;"/>`
    : `<div style="width:40px;height:40px;border-radius:50%;background:#dcfce7;color:#166534;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">${initials(m.nom)}</div>`;
  const distance =
    m.distance_km != null
      ? `<div style="font-size:11px;color:#16a34a;font-weight:700;margin:6px 0;">≈ ${m.distance_km.toFixed(1)} km de vous</div>`
      : "";
  const contact = m.telephone
    ? `<a href="tel:${escapeHtml(m.telephone)}" style="flex:1;text-align:center;background:#16a34a;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:9px 10px;border-radius:8px;">Contacter</a>`
    : "";
  return `
    <div style="min-width:200px;font-family:Arial,sans-serif;">
      <div style="display:flex;gap:10px;align-items:center;">
        ${photo}
        <div style="min-width:0;">
          <div style="font-weight:700;font-size:13px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nom}</div>
          <div style="font-size:11px;color:#6b7280;">${specs}</div>
        </div>
      </div>
      ${distance}
      <div style="display:flex;gap:6px;">
        ${contact}
        <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" rel="noreferrer" style="flex:1;text-align:center;background:#f3f4f6;color:#374151;text-decoration:none;font-size:12px;font-weight:600;padding:9px 10px;border-radius:8px;">Itinéraire</a>
      </div>
    </div>
  `;
}

export default function MechanicsLiveMap({
  center,
  mechanics = [],
  height = "h-72",
  zoom = 12,
  userDraggable = false,
  onUserMove,
}: MechanicsLiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const mechanicLayerRef = useRef<any>(null);
  const draggedByUser = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let L: any;
    let cancelled = false;
    let onResize: (() => void) | null = null;

    async function init() {
      L = await import("leaflet");
      await import("leaflet/dist/leaflet.css" as string);
      if (cancelled || !containerRef.current || mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const start = center || mechanics[0] || DEFAULT_CENTER;
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
        dragging: true,
      });

      // Recalcule la taille de la carte après le rendu du conteneur
      // (essentiel sur mobile : défilement, clavier, rotation).
      setTimeout(() => map.invalidateSize(), 150);
      onResize = () => map.invalidateSize();
      window.addEventListener("resize", onResize);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mechanicLayerRef.current = L.layerGroup().addTo(map);

      if (center) {
        const userIcon = L.divIcon({
          className: "",
          html: USER_PIN,
          iconSize: [34, 34],
          iconAnchor: [17, 32],
          popupAnchor: [0, -30],
        });
        userMarkerRef.current = L.marker([center.lat, center.lng], {
          icon: userIcon,
          draggable: userDraggable,
        }).addTo(map);
        if (userDraggable) {
          userMarkerRef.current.on("dragend", () => {
            const p = userMarkerRef.current.getLatLng();
            draggedByUser.current = true;
            if (onUserMove) onUserMove(p.lat, p.lng);
          });
        }
      }

      mapRef.current = map;
      setReady(true);
    }

    init();

    return () => {
      cancelled = true;
      if (onResize) window.removeEventListener("resize", onResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        mechanicLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcule la taille de la carte dès qu'elle est prête (conteneur dimensionné).
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [ready]);

  // Rendu des marqueurs mécaniciens (reconstruit à chaque changement).
  useEffect(() => {
    if (!ready || !mapRef.current || !mechanicLayerRef.current) return;
    let L: any;
    let cancelled = false;

    async function render() {
      if (cancelled || !mapRef.current || !mechanicLayerRef.current) return;
      L = await import("leaflet");
      const layer = mechanicLayerRef.current;
      layer.clearLayers();

      mechanics.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: MECANICIEN_PIN,
          iconSize: [34, 34],
          iconAnchor: [17, 32],
          popupAnchor: [0, -30],
        });
        const marker = L.marker([m.lat, m.lng], { icon });
        marker.bindPopup(popupHtml(m));
        layer.addLayer(marker);
      });

      if (!draggedByUser.current) {
        const pts: [number, number][] = mechanics.map((m) => [m.lat, m.lng]);
        if (center) pts.push([center.lat, center.lng]);
        if (pts.length > 0) {
          try {
            mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15 });
          } catch {
            /* ignore */
          }
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [ready, mechanics, center]);

  // Déplacement du marqueur utilisateur (position externe ou polling).
  useEffect(() => {
    if (!ready || !mapRef.current || !userMarkerRef.current || !center) return;
    userMarkerRef.current.setLatLng([center.lat, center.lng]);
    if (!draggedByUser.current) {
      mapRef.current.panTo([center.lat, center.lng]);
    }
  }, [ready, center]);

  return <div ref={containerRef} className={`${height} w-full rounded-xl z-0`} />;
}
