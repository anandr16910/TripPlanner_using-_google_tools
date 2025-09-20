'use client';

import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import type { Location } from '@/app/page';

interface MapProps {
  locations: Location[];
}

export default function Map({ locations }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground p-4">
          <p className="font-semibold">Could not load map.</p>
          <p className="text-sm">
            Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.
          </p>
        </div>
      </div>
    );
  }

  const center = locations.length > 0 ? locations[0] : { lat: 20.5937, lng: 78.9629 };

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={locations.length > 0 ? 10 : 5}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="trip-planner-map"
      >
        {locations.map((loc, index) => (
          <Marker key={index} position={loc} title={loc.name} />
        ))}
      </GoogleMap>
    </APIProvider>
  );
}
