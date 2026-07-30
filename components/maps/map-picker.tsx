"use client";

import LeafletMap from "./leaflet-map";

interface MapPickerProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

export default function MapPicker({
  lat,
  lng,
  onPositionChange,
  height = "h-64",
}: MapPickerProps) {
  return (
    <LeafletMap
      lat={lat}
      lng={lng}
      height={height}
      interactive={true}
      onPositionChange={onPositionChange}
    />
  );
}
