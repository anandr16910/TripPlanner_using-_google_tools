'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { suggestActivitiesAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { InterestBasedActivitySuggestionsOutput } from '@/ai/flows/interest-based-activity-suggestions';

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
      {t('get_suggestions_button')}
    </Button>
  );
}

export type SuggesterState = {
    result: InterestBasedActivitySuggestionsOutput | null;
    errors: { [key: string]: string[] } | null;
} | null;


interface ActivitySuggesterProps {
  onLocationChange: (location: string) => void;
  parentState: SuggesterState;
  setParentState: Dispatch<SetStateAction<SuggesterState>>;
}

export default function ActivitySuggester({ onLocationChange, parentState, setParentState }: ActivitySuggesterProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const suggestActivitiesActionWithDispatch = async (prevState: any, formData: FormData) => {
    const location = formData.get('location') as string;
    onLocationChange(location);
    const result = await suggestActivitiesAction(prevState, formData);
    setParentState(result);
    return result;
  };
  
  const [state, dispatch] = useFormState(suggestActivitiesActionWithDispatch, parentState);

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
        <CardTitle className="font-headline">{t('activity_suggester_tab')}</CardTitle>
        <CardDescription>{t('activity_suggester_description')}</CardDescription>
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
                <Label htmlFor="interests">{t('interests_label')}</Label>
                <Input id="interests" name="interests" placeholder={t('interests_placeholder')} />
                {state?.errors?.interests && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interests[0]}</p>}
              </div>
              <SubmitButton />
            </div>

            {state?.result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <Star className="h-5 w-5" /> {t('suggested_activities_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {state.result.activities.map((activity, index) => (
                    <Badge key={index} variant="secondary" className="text-base px-3 py-1">
                      {activity}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
