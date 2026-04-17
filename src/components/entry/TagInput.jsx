import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TagInput({ tags = [], onChange }) {
  const [value, setValue] = useState('');

  const addTag = () => {
    const next = value.trim();
    if (!next) return;
    if (!tags.includes(next)) {
      onChange([...(tags || []), next]);
    }
    setValue('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag"
        />
        <Button variant="outline" onClick={addTag}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(tags || []).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tags.filter((value) => value !== tag))}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
          >
            {tag} ×
          </button>
        ))}
      </div>
    </div>
  );
}
