'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateItineraryAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('generating_itinerary_button')}...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          {t('generate_itinerary_button')}
        </>
      )}
    </Button>
  );
}

export type ItineraryState = {
  itinerary: string | null;
  errors: { [key: string]: string[] } | null;
} | null;

interface ItineraryGeneratorProps {
  onLocationChange: (location: string) => void;
  parentState: ItineraryState;
  setParentState: Dispatch<SetStateAction<ItineraryState>>;
}

export default function ItineraryGenerator({ onLocationChange, parentState, setParentState }: ItineraryGeneratorProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const generateItineraryActionWithDispatch = async (prevState: any, formData: FormData) => {
    const destination = formData.get('destination') as string;
    onLocationChange(destination);
    const result = await generateItineraryAction(prevState, formData);
    setParentState(result);
    return result;
  };
  
  const [state, dispatch] = useFormState(generateItineraryActionWithDispatch, parentState);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('itinerary_generator_tab')}</CardTitle>
          <CardDescription>{t('itinerary_generator_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={dispatch} className="space-y-4">
            <input type="hidden" name="language" value={language} />
             <div>
              <Label htmlFor="destination">{t('destination_label')}</Label>
              <Input id="destination" name="destination" placeholder={t('destination_placeholder')} />
              {state?.errors?.destination && <p className="text-sm font-medium text-destructive mt-1">{state.errors.destination[0]}</p>}
            </div>
            <div>
              <Label htmlFor="budget">{t('budget_label')}</Label>
              <Input id="budget" name="budget" placeholder={t('budget_placeholder')} />
              {state?.errors?.budget && <p className="text-sm font-medium text-destructive mt-1">{state.errors.budget[0]}</p>}
            </div>
            <div>
              <Label htmlFor="interests">{t('interests_label')}</Label>
              <Input id="interests" name="interests" placeholder={t('interests_placeholder')} />
              {state?.errors?.interests && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interests[0]}</p>}
            </div>
            <div>
              <Label htmlFor="duration">{t('duration_label')}</Label>
              <Input id="duration" name="duration" type="number" placeholder={t('duration_placeholder')} />
              {state?.errors?.duration && <p className="text-sm font-medium text-destructive mt-1">{state.errors.duration[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">{t('itinerary_display_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none h-96 overflow-y-auto rounded-md border p-4 bg-muted/50 whitespace-pre-wrap">
            {state?.itinerary ? (
              state.itinerary
            ) : (
              <p className="text-muted-foreground">{t('itinerary_placeholder')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
