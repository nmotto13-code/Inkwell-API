import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function HabitsForm({ habits = [], onChange }) {
  const nextHabits = habits.length > 0 ? habits : [{ name: '', completed: false, notes: '' }];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Habit Check-in</p>
      {nextHabits.map((habit, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-4">
          <Input
            value={habit.name || ''}
            onChange={(event) => {
              const updated = [...nextHabits];
              updated[index] = { ...updated[index], name: event.target.value };
              onChange(updated);
            }}
            placeholder="Habit name"
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={Boolean(habit.completed)}
              onCheckedChange={(checked) => {
                const updated = [...nextHabits];
                updated[index] = { ...updated[index], completed: checked };
                onChange(updated);
              }}
            />
            <span className="text-sm text-slate-600">Completed today</span>
          </div>
          <Input
            value={habit.notes || ''}
            onChange={(event) => {
              const updated = [...nextHabits];
              updated[index] = { ...updated[index], notes: event.target.value };
              onChange(updated);
            }}
            placeholder="Notes"
          />
        </div>
      ))}
    </div>
  );
}
