import { Input } from '@/components/ui/input';

export default function GratitudeForm({ items = [], onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Gratitude List</p>
      {[0, 1, 2].map((index) => (
        <Input
          key={index}
          value={items[index] || ''}
          onChange={(event) => {
            const next = [...items];
            next[index] = event.target.value;
            onChange(next);
          }}
          placeholder={`Something you appreciate #${index + 1}`}
        />
      ))}
    </div>
  );
}
