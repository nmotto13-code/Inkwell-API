import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { railwayApiRequest } from '@/shared/data/railwayApiClient';

export default function MobileWelcome() {
  const { checkAppState, markMobileOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const continueToApp = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await railwayApiRequest('/users/me/mobile-onboarding', {
        method: 'PATCH',
        body: { mobile_onboarding_complete: true },
      });
      markMobileOnboardingComplete();
      // Wait 500ms to allow database transaction to fully commit before refreshing user data
      // This prevents a race condition where checkAppState() fetches stale data
      await new Promise((resolve) => setTimeout(resolve, 500));
      await checkAppState();
      navigate('/mobile/home', { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to finish onboarding right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-loja-cream-50 via-white to-loja-gold/20 flex items-start justify-center p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] overflow-y-auto">
      <Card className="mobile-card w-full max-w-md shadow-md mt-2 mb-4">
        <CardContent className="p-5 space-y-4">
          <p className="text-lg font-semibold text-loja-blue">Welcome to BabyLoja Mobile</p>
          <p className="text-sm text-slate-600">
            This mobile experience is optimized for fast daily logging and supportive insights.
          </p>
          <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
            <li>Use Quick Add to log play, meal, and sleep in seconds.</li>
            <li>Use Insights to review trends without judgement.</li>
            <li>Your data stays synced securely to your BabyLoja cloud backend.</li>
          </ul>
          <Button className="w-full mt-1 bg-gradient-to-r from-loja-gold to-amber-300 hover:from-loja-gold hover:to-amber-200 text-loja-blue" onClick={continueToApp} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
