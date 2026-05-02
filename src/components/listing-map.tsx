"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { env } from "@/lib/env";

type Props = {
    lng: number;
    lat: number;
    zoom?: number;
    className?: string;
};

/**
 * Single-point listing map. We use MapTiler's streets style if a key is set,
 * otherwise fall back to OSM Carto so dev still renders something.
 */
export function ListingMap({ lng, lat, zoom = 15, className }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!ref.current || mapRef.current) return;

        const styleUrl = env.app.maptilerKey
            ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${env.app.maptilerKey}`
            : {
                version: 8 as const,
                sources: {
                    osm: {
                        type: "raster" as const,
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "© OpenStreetMap",
                    },
                },
                layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
            };

        const map = new maplibregl.Map({
            container: ref.current,
            style: styleUrl,
            center: [lng, lat],
            zoom,
        });
        new maplibregl.Marker({ color: "#059669" }).setLngLat([lng, lat]).addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [lng, lat, zoom]);

    return <div ref={ref} className={className ?? "h-72 w-full rounded-lg overflow-hidden"} />;
}
