import { Input } from '@/components/ui/input';

export default function GoalsForm({ goals = [], onChange }) {
  const nextGoals = goals.length > 0 ? goals : [{ goal: '', progress: '', next_steps: '' }];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Goal Check-in</p>
      {nextGoals.map((goal, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-4">
          <Input
            value={goal.goal || ''}
            onChange={(event) => {
              const updated = [...nextGoals];
              updated[index] = { ...updated[index], goal: event.target.value };
              onChange(updated);
            }}
            placeholder="Goal"
          />
          <Input
            value={goal.progress || ''}
            onChange={(event) => {
              const updated = [...nextGoals];
              updated[index] = { ...updated[index], progress: event.target.value };
              onChange(updated);
            }}
            placeholder="Current progress"
          />
          <Input
            value={goal.next_steps || ''}
            onChange={(event) => {
              const updated = [...nextGoals];
              updated[index] = { ...updated[index], next_steps: event.target.value };
              onChange(updated);
            }}
            placeholder="Next step"
          />
        </div>
      ))}
    </div>
  );
}
