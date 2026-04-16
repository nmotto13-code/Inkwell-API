import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getCurrentRailwayAccessToken } from '@/shared/auth/session';
import { railwayApiRequest } from '@/shared/data/railwayApiClient';

import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import AddChildScreen from '@/components/onboarding/AddChildScreen';
import ModeSelectionScreen from '@/components/onboarding/ModeSelectionScreen';
import PlayOnboardingScreen from '@/components/onboarding/PlayOnboardingScreen';
import EatOnboardingScreen from '@/components/onboarding/EatOnboardingScreen';
import SleepOnboardingScreen from '@/components/onboarding/SleepOnboardingScreen';
import MilestonesOnboardingScreen from '@/components/onboarding/MilestonesOnboardingScreen';
import ReadyScreen from '@/components/onboarding/ReadyScreen';

const STEPS = {
  WELCOME: 'welcome',
  ADD_CHILD: 'add_child',
  MODE_SELECT: 'mode_select',
  PLAY: 'play',
  EAT: 'eat',
  SLEEP: 'sleep',
  MILESTONES: 'milestones',
  READY: 'ready',
};

const MODE_STEP_MAP = {
  play: STEPS.PLAY,
  eat: STEPS.EAT,
  sleep: STEPS.SLEEP,
  milestones: STEPS.MILESTONES,
};

const VALID_MODES = Object.keys(MODE_STEP_MAP);

const normalizeModes = (modes) =>
  Array.from(
    new Set(
      (Array.isArray(modes) ? modes : [])
        .map((mode) => String(mode || '').trim())
        .filter((mode) => VALID_MODES.includes(mode))
    )
  );

const buildStepList = (selectedModes) => [
  STEPS.WELCOME,
  STEPS.ADD_CHILD,
  STEPS.MODE_SELECT,
  ...normalizeModes(selectedModes).map((mode) => MODE_STEP_MAP[mode]).filter(Boolean),
  STEPS.READY,
];

export default function MobileOnboarding() {
  const navigate = useNavigate();
  const {
    checkAppState,
    markMobileOnboardingComplete,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
  } = useAuth();
  const hasRetriedAuthRef = useRef(false);

  const [localData, setLocalData] = useState({
    child: null,
    selectedModes: [],
    play: null,
    eat: null,
    sleep: null,
    milestones: null,
  });
  const [stepList, setStepList] = useState([STEPS.WELCOME, STEPS.ADD_CHILD, STEPS.MODE_SELECT]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasToken = Boolean(getCurrentRailwayAccessToken());

  const currentStep = stepList[stepIndex];
  const totalSteps = stepList.length;
  const showProgress = currentStep !== STEPS.WELCOME && currentStep !== STEPS.READY;
  const progressStep = stepIndex;
  const progressTotal = Math.max(totalSteps - 2, 1);
  const childName = localData.child?.name || null;

  const goNext = () => setStepIndex((index) => Math.min(index + 1, stepList.length - 1));
  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));

  const handleWelcome = () => {
    setErrorMessage('');
    goNext();
  };

  const handleAddChild = (childData) => {
    setErrorMessage('');
    setLocalData((data) => ({ ...data, child: childData || null }));
    goNext();
  };

  const handleModeSelect = (modes) => {
    setErrorMessage('');
    const normalizedModes = normalizeModes(modes);
    const nextStepList = buildStepList(normalizedModes);
    setLocalData((data) => ({ ...data, selectedModes: normalizedModes }));
    setStepList(nextStepList);
    setStepIndex((index) => index + 1);
  };

  const handleModeData = (mode, data) => {
    setErrorMessage('');
    setLocalData((current) => ({ ...current, [mode]: data || null }));
    goNext();
  };

  const onboardingSummary = useMemo(
    () => ({
      child: localData.child,
      selectedModes: normalizeModes(localData.selectedModes),
      play: localData.play,
      eat: localData.eat,
      sleep: localData.sleep,
      milestones: localData.milestones,
    }),
    [localData]
  );

  const handleFinish = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const nonBlockingErrors = [];
      const childPayload = {
        ...(onboardingSummary.child || {}),
      };
      if (onboardingSummary.eat?.known_allergens?.length) {
        childPayload.known_allergens = onboardingSummary.eat.known_allergens;
      }
      if (onboardingSummary.milestones?.developmental_focus?.length) {
        childPayload.developmental_focus = onboardingSummary.milestones.developmental_focus;
      }

      if (childPayload?.name && childPayload?.birthdate) {
        try {
          await railwayApiRequest('/children', {
            method: 'POST',
            body: childPayload,
          });
        } catch (error) {
          nonBlockingErrors.push(error?.message || 'Unable to save child profile.');
        }
      }

      const parsedGoal = Number(onboardingSummary.play?.daily_play_goal_minutes);
      if (Number.isFinite(parsedGoal) && parsedGoal > 0) {
        try {
          await railwayApiRequest('/users/me/settings', {
            method: 'PATCH',
            body: {
              daily_play_goal_minutes: parsedGoal,
            },
          });
        } catch (error) {
          nonBlockingErrors.push(error?.message || 'Unable to save daily play goal.');
        }
      }

      await railwayApiRequest('/users/me/mobile-onboarding', {
        method: 'PATCH',
        body: {
          mobile_onboarding_complete: true,
          selected_modes: onboardingSummary.selectedModes,
          onboarding_preferences: {
            selected_modes: onboardingSummary.selectedModes,
            play: onboardingSummary.play || null,
            eat: onboardingSummary.eat || null,
            sleep: onboardingSummary.sleep || null,
            milestones: onboardingSummary.milestones || null,
          },
        },
      });

      markMobileOnboardingComplete();
      // Wait 500ms to allow database transaction to fully commit before refreshing user data
      // This prevents a race condition where checkAppState() fetches stale data
      await new Promise((resolve) => setTimeout(resolve, 500));
      await checkAppState();
      if (nonBlockingErrors.length > 0) {
        // Non-blocking failures should never trap a user in onboarding.
        console.warn('Onboarding completed with non-blocking save errors', nonBlockingErrors);
      }
      navigate('/mobile/home', { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to finish onboarding right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasRetriedAuthRef.current) return;
    if (!hasToken) return;
    if (isAuthenticated) return;
    if (isLoadingAuth || isLoadingPublicSettings) return;
    hasRetriedAuthRef.current = true;
    checkAppState();
  }, [checkAppState, hasToken, isAuthenticated, isLoadingAuth, isLoadingPublicSettings]);

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-loja-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && hasToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-loja-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/mobile/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-loja-cream via-white to-loja-cream-200/30">
      {showProgress ? (
        <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-safe">
          <div className="max-w-sm mx-auto pt-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-loja-blue rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progressStep / progressTotal) * 100}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {progressStep} / {progressTotal}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className={showProgress ? 'pt-10' : ''}>
        <AnimatePresence mode="wait">
          {currentStep === STEPS.WELCOME ? (
            <WelcomeScreen key="welcome" onContinue={handleWelcome} />
          ) : null}

          {currentStep === STEPS.ADD_CHILD ? (
            <AddChildScreen
              key="add_child"
              onContinue={handleAddChild}
              onBack={goBack}
              onSkip={() => handleAddChild(null)}
            />
          ) : null}

          {currentStep === STEPS.MODE_SELECT ? (
            <ModeSelectionScreen
              key="mode_select"
              onContinue={handleModeSelect}
              onBack={goBack}
              onSkip={() => handleModeSelect([])}
              childName={childName}
            />
          ) : null}

          {currentStep === STEPS.PLAY ? (
            <PlayOnboardingScreen
              key="play"
              onContinue={(data) => handleModeData('play', data)}
              onBack={goBack}
              onSkip={() => handleModeData('play', { skipped: true })}
              childName={childName}
            />
          ) : null}

          {currentStep === STEPS.EAT ? (
            <EatOnboardingScreen
              key="eat"
              onContinue={(data) => handleModeData('eat', data)}
              onBack={goBack}
              onSkip={() => handleModeData('eat', { skipped: true })}
              childName={childName}
            />
          ) : null}

          {currentStep === STEPS.SLEEP ? (
            <SleepOnboardingScreen
              key="sleep"
              onContinue={(data) => handleModeData('sleep', data)}
              onBack={goBack}
              onSkip={() => handleModeData('sleep', { skipped: true })}
              childName={childName}
            />
          ) : null}

          {currentStep === STEPS.MILESTONES ? (
            <MilestonesOnboardingScreen
              key="milestones"
              onContinue={(data) => handleModeData('milestones', data)}
              onBack={goBack}
              onSkip={() => handleModeData('milestones', { skipped: true })}
              childName={childName}
            />
          ) : null}

          {currentStep === STEPS.READY ? (
            <ReadyScreen key="ready" onStart={handleFinish} selectedModes={localData.selectedModes} />
          ) : null}
        </AnimatePresence>
      </div>

      {errorMessage ? (
        <div className="px-6 pb-4">
          <div className="max-w-sm mx-auto text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
            {errorMessage}
          </div>
        </div>
      ) : null}

      {isSubmitting ? (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            Saving your setup...
          </div>
        </div>
      ) : null}
    </div>
  );
}
