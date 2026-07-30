"use client";

import LeafletMap from "./leaflet-map";

interface MapViewProps {
  lat: number;
  lng: number;
  height?: string;
  zoom?: number;
}

export default function MapView({
  lat,
  lng,
  height = "h-48",
  zoom = 13,
}: MapViewProps) {
  return (
    <LeafletMap
      lat={lat}
      lng={lng}
      height={height}
      zoom={zoom}
      interactive={false}
    />
  );
}
