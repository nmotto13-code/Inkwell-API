import { useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://inkwell-api-production-91d6.up.railway.app';
const AUDIENCE = 'https://api.inkwell.app';

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const request = useCallback(async (method, path, body) => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: AUDIENCE },
    });
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(text || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }, [getAccessTokenSilently]);

  return useMemo(() => ({
    // User profile (Railway API — not used for local onboarding data)
    getProfile: () => request('GET', '/api/users/me'),
    updateProfile: (data) => request('POST', '/api/users/me', data),

    // Journals
    listJournals: () => request('GET', '/api/journals'),
    getJournal: (id) => request('GET', `/api/journals/${id}`),
    createJournal: (data) => request('POST', '/api/journals', data),
    deleteJournal: (id) => request('DELETE', `/api/journals/${id}`),

    // Pages
    listPages: () => request('GET', '/api/pages'),
    getPage: (id) => request('GET', `/api/pages/${id}`),
    createPage: (journalId, data) => request('POST', `/api/journals/${journalId}/pages`, data),
    updatePage: (id, data) => request('PUT', `/api/pages/${id}`, data),
    deletePage: (id) => request('DELETE', `/api/pages/${id}`),

    // Free Write — auto-creates a "Free Write" journal if none exists
    createFreeWritePage: async (data) => {
      const journals = await request('GET', '/api/journals');
      let journal = journals.find(
        (j) => j.name === 'Free Write' && j.track === 'creative_writing'
      );
      if (!journal) {
        journal = await request('POST', '/api/journals', {
          name: 'Free Write',
          track: 'creative_writing',
          cover_emoji: '✍️',
        });
      }
      return request('POST', `/api/journals/${journal.id}/pages`, data);
    },

    // Journal entries (standalone, not in a journal)
    listEntries: () => request('GET', '/api/entries'),
    getEntry: (id) => request('GET', `/api/entries/${id}`),
    createEntry: (data) => request('POST', '/api/entries', data),
    deleteEntry: (id) => request('DELETE', `/api/entries/${id}`),

    // Journaling goals
    listGoals: () => request('GET', '/api/goals'),
    createGoal: (data) => request('POST', '/api/goals', data),
    updateGoal: (id, data) => request('PUT', `/api/goals/${id}`, data),
    deleteGoal: (id) => request('DELETE', `/api/goals/${id}`),
  }), [request]);
}
