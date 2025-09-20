'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';
import ChatWidget from '@/components/chat-widget';
import Map from '@/components/map';
import ItineraryGenerator, { ItineraryState } from '@/components/features/itinerary-generator';
import RealTimeAdapter, { AdapterState } from '@/components/features/real-time-adapter';
import Recommender, { RecommenderState } from '@/components/features/recommender';
import ActivitySuggester, { SuggesterState } from '@/components/features/activity-suggester';
import { useLanguage } from '@/contexts/language-context';

export type Location = {
  lat: number;
  lng: number;
  name: string;
};

async function geocodeAddress(address: string): Promise<Location | null> {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng, name: data.results[0].formatted_address };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export default function Home() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<Location[]>([
    { lat: 28.6139, lng: 77.209, name: 'New Delhi' },
  ]);

  const [itineraryState, setItineraryState] = useState<ItineraryState>({ itinerary: null, errors: null });
  const [adapterState, setAdapterState] = useState<AdapterState>({ result: null, errors: null });
  const [recommenderState, setRecommenderState] = useState<RecommenderState>({ result: null, errors: null });
  const [suggesterState, setSuggesterState] = useState<SuggesterState>({ result: null, errors: null });

  const handleLocationChange = useCallback(async (locationName: string) => {
    if (locationName) {
      const newLocation = await geocodeAddress(locationName);
      if (newLocation) {
        setLocations([newLocation]);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="itinerary">{t('itinerary_generator_tab')}</TabsTrigger>
                <TabsTrigger value="adapter">{t('real_time_adapter_tab')}</TabsTrigger>
                <TabsTrigger value="recommender">{t('recommender_tab')}</TabsTrigger>
                <TabsTrigger value="suggester">{t('activity_suggester_tab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="itinerary">
                <ItineraryGenerator onLocationChange={handleLocationChange} parentState={itineraryState} setParentState={setItineraryState} />
              </TabsContent>
              <TabsContent value="adapter">
                <RealTimeAdapter parentState={adapterState} setParentState={setAdapterState} />
              </TabsContent>
              <TabsContent value="recommender">
                <Recommender onLocationChange={handleLocationChange} parentState={recommenderState} setParentState={setRecommenderState} />
              </TabsContent>
              <TabsContent value="suggester">
                <ActivitySuggester onLocationChange={handleLocationChange} parentState={suggesterState} setParentState={setSuggesterState} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1 h-[400px] lg:h-auto rounded-lg overflow-hidden shadow-lg border">
            <Map locations={locations} />
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
