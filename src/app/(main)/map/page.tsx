'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import { MoodBadge } from '@/components/mood-card/mood-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getMoodConfig } from '@/lib/constants';
import type { MapPin } from '@/types/card';
import type { MoodType } from '@/types/mood';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const [viewport, setViewport] = useState({
    longitude: 116.4,
    latitude: 39.9,
    zoom: 3,
  });

  const fetchPins = useCallback(async (bounds?: { north: number; south: number; east: number; west: number }) => {
    try {
      const params = bounds
        ? `?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}`
        : '';
      const res = await fetch(`/api/map/pins${params}`);
      const data = await res.json();
      setPins(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoveEnd = useCallback(
    (evt: any) => {
      setViewport(evt.viewState);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const bounds = evt.target.getBounds();
        if (!bounds) return;
        fetchPins({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }, 300);
    },
    [fetchPins]
  );

  return (
    <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-56px)] relative">
      <Map
        {...viewport}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {pins.map((pin) => {
          const config = getMoodConfig(pin.mood);
          return (
            <Marker
              key={pin.id}
              longitude={pin.longitude}
              latitude={pin.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected(pin);
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-125 shadow-md"
                style={{
                  backgroundColor: `${config.color}30`,
                  borderColor: config.color,
                }}
              >
                <span className="text-sm">{config.emoji}</span>
              </div>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            anchor="bottom"
            onClose={() => setSelected(null)}
            closeButton={false}
            className="mood-popup"
          >
            <a
              href={`/card/${selected.id}`}
              className="block w-32 rounded-md overflow-hidden"
            >
              <img
                src={selected.thumbnail_url}
                alt=""
                className="w-full aspect-square object-cover"
              />
              <div className="p-2 bg-background-raised">
                <MoodBadge mood={selected.mood} size="sm" />
              </div>
            </a>
          </Popup>
        )}
      </Map>

      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background-raised/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border text-xs text-text-secondary">
          加载中...
        </div>
      )}
    </div>
  );
}
