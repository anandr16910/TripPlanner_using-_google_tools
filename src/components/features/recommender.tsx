'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getRecommendationsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bed, Car, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AccommodationAndTransportRecommendationsOutput } from '@/ai/flows/accommodation-and-transport-recommendations';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {t('get_recommendations_button')}
    </Button>
  );
}

export type RecommenderState = {
  result: AccommodationAndTransportRecommendationsOutput | null;
  errors: { [key: string]: string[] } | null;
} | null;

interface RecommenderProps {
  onLocationChange: (location: string) => void;
  parentState: RecommenderState;
  setParentState: Dispatch<SetStateAction<RecommenderState>>;
}

export default function Recommender({ onLocationChange, parentState, setParentState }: RecommenderProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const getRecommendationsActionWithDispatch = async (prevState: any, formData: FormData) => {
    const location = formData.get('location') as string;
    onLocationChange(location);
    const result = await getRecommendationsAction(prevState, formData);
    setParentState(result);
    return result;
  };

  const [state, dispatch] = useFormState(getRecommendationsActionWithDispatch, parentState);

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
        <CardTitle className="font-headline">{t('recommender_tab')}</CardTitle>
        <CardDescription>{t('recommender_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={dispatch} className="space-y-4">
          <input type="hidden" name="language" value={language} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">{t('destination_label')}</Label>
                <Input id="location" name="location" placeholder={t('destination_placeholder')} />
                {state?.errors?.location && <p className="text-sm font-medium text-destructive mt-1">{state.errors.location[0]}</p>}
              </div>
              <div>
                <Label htmlFor="preferences">{t('preferences_label')}</Label>
                <Input id="preferences" name="preferences" placeholder={t('preferences_placeholder')} />
              </div>
              <SubmitButton />
            </div>

            {state?.result && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      <Bed className="h-5 w-5" /> {t('accommodation_title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {state.result.accommodationRecommendations}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      <Car className="h-5 w-5" /> {t('transport_title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {state.result.transportRecommendations}
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
