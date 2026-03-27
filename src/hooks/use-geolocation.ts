'use client';

import { useState, useCallback, useEffect } from 'react';

interface GeoLocation {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('浏览器不支持定位');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);

        // Try reverse geocoding
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&language=zh`
          );
          const data = await res.json();
          if (data.features?.length > 0) {
            const name = data.features[0].place_name;
            setLocation({ latitude, longitude, locationName: name });
          }
        } catch {
          // Geocoding failed, location coords still available
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, error, loading, requestLocation };
}
