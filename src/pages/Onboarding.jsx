import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Preferences } from '@capacitor/preferences';

import { useApi } from '@/api/inkwellApi';
import { useAuth } from '@/lib/AuthContext';
import { TRACKS } from '@/lib/trackConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Onboarding() {
  const api = useApi();
  const navigate = useNavigate();
  const { profile, markOnboardingComplete, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [selectedTracks, setSelectedTracks] = useState(profile?.enrolled_tracks || []);
  const [saving, setSaving] = useState(false);

  const toggleTrack = (trackId) => {
    setSelectedTracks((current) => (
      current.includes(trackId)
        ? current.filter((value) => value !== trackId)
        : [...current, trackId]
    ));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const nextProfile = await api.updateProfile({
      first_name: firstName,
      enrolled_tracks: selectedTracks,
      onboarding_completed: true,
    });
    await Preferences.set({ key: 'user_profile', value: JSON.stringify(nextProfile) });
    await markOnboardingComplete(nextProfile);
    await refreshProfile();
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Onboarding</p>
        <h1 className="text-3xl font-semibold text-slate-900">Set up your journal workspace</h1>
        <p className="text-sm text-slate-600">
          Pick the tracks you want available now. You can add or remove them later in settings.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="text-sm font-medium text-slate-700" htmlFor="first-name">
          First name
        </label>
        <Input
          id="first-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="What should InkWell call you?"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-medium text-slate-700">Choose your starting tracks</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.values(TRACKS).map((track) => {
            const Icon = track.icon;
            const selected = selectedTracks.includes(track.id);
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => toggleTrack(track.id)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all',
                  selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                )}
              >
                <div className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
                  selected ? 'bg-white/10' : track.bgColor
                )}>
                  <Icon className={cn('h-5 w-5', selected ? 'text-white' : track.color)} />
                </div>
                <p className="text-sm font-semibold">{track.name}</p>
                <p className={cn('mt-1 text-xs', selected ? 'text-slate-200' : 'text-slate-500')}>
                  {track.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving || selectedTracks.length === 0}>
          {saving ? 'Saving...' : 'Finish Setup'}
        </Button>
      </div>
    </div>
  );
}
