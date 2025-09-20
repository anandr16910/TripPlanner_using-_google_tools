'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { adaptItineraryAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, Dispatch, SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AdjustItineraryOutput } from '@/ai/flows/real-time-itinerary-adaptation';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {t('adapt_itinerary_button')}
    </Button>
  );
}

export type AdapterState = {
    result: AdjustItineraryOutput | null;
    errors: { [key: string]: string[] } | null;
} | null;

interface RealTimeAdapterProps {
  parentState: AdapterState;
  setParentState: Dispatch<SetStateAction<AdapterState>>;
}

export default function RealTimeAdapter({ parentState, setParentState }: RealTimeAdapterProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const adaptItineraryActionWithDispatch = async (prevState: any, formData: FormData) => {
    const result = await adaptItineraryAction(prevState, formData);
    setParentState(result);
    return result;
  };

  const [state, dispatch] = useFormState(adaptItineraryActionWithDispatch, parentState);

  useEffect(() => {
    if (state?.errors?._form) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.errors._form.join(', '),
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('real_time_adapter_tab')}</CardTitle>
        <CardDescription>{t('itinerary_display_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <input type="hidden" name="language" value={language} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="itinerary">{t('current_itinerary_label')}</Label>
                <Textarea id="itinerary" name="itinerary" placeholder={t('current_itinerary_placeholder')} className="h-32" />
                {state?.errors?.itinerary && <p className="text-sm font-medium text-destructive mt-1">{state.errors.itinerary[0]}</p>}
              </div>
              <div>
                <Label htmlFor="weather">{t('weather_label')}</Label>
                <Input id="weather" name="weather" placeholder={t('weather_placeholder')} />
              </div>
              <div>
                <Label htmlFor="traffic">{t('traffic_label')}</Label>
                <Input id="traffic" name="traffic" placeholder={t('traffic_placeholder')} />
              </div>
              <div>
                <Label htmlFor="events">{t('events_label')}</Label>
                <Input id="events" name="events" placeholder={t('events_placeholder')} />
              </div>
              <SubmitButton />
            </div>
            {state?.result && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">{t('adjusted_itinerary_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {state.result.adjustedItinerary}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">{t('reasoning_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {state.result.reasoning}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
