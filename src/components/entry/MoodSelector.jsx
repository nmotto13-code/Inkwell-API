import { MOOD_OPTIONS } from '@/lib/trackConfig';
import { cn } from '@/lib/utils';

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Mood</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(mood.id)}
            className={cn(
              'rounded-xl border px-3 py-3 text-left text-sm transition-colors',
              value === mood.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
            )}
          >
            <div className="text-lg">{mood.emoji}</div>
            <div className="mt-1">{mood.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
