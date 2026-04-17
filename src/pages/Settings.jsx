import { useState } from 'react';

import { useAuth0 } from '@auth0/auth0-react';

import { useApi } from '@/api/inkwellApi';
import { useAuth } from '@/lib/AuthContext';
import { TRACKS } from '@/lib/trackConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Settings() {
  const api = useApi();
  const { logout } = useAuth0();
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [tracks, setTracks] = useState(profile?.enrolled_tracks || []);
  const [saving, setSaving] = useState(false);

  const toggleTrack = (trackId) => {
    setTracks((current) => (
      current.includes(trackId)
        ? current.filter((value) => value !== trackId)
        : [...current, trackId]
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await api.updateProfile({
      first_name: firstName,
      enrolled_tracks: tracks,
      onboarding_completed: true,
    });
    await refreshProfile();
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Update your profile and journal track access.</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="text-sm font-medium text-slate-700" htmlFor="settings-first-name">
          First name
        </label>
        <Input
          id="settings-first-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-medium text-slate-700">Enabled tracks</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.values(TRACKS).map((track) => {
            const selected = tracks.includes(track.id);
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => toggleTrack(track.id)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                <p className="font-medium">{track.name}</p>
                <p className={cn('mt-1 text-xs', selected ? 'text-slate-200' : 'text-slate-500')}>
                  {track.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
