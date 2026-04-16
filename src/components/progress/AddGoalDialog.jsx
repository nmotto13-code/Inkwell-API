import { useState } from "react";
import { useApi } from "@/api/inkwellApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRACKS } from "@/lib/trackConfig";

const TARGET_TYPES = [
  { id: "entries_count", label: "Total entries written", unit: "entries" },
  { id: "streak_days", label: "Day streak", unit: "days" },
  { id: "track_entries", label: "Entries in a specific track", unit: "entries" },
  { id: "words_written", label: "Words written", unit: "words" },
];

export default function AddGoalDialog({ open, onClose, onCreated }) {
  const api = useApi();
  const [form, setForm] = useState({ title: "", description: "", target_type: "entries_count", target_value: 10, track: "" });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, target_value: Number(form.target_value) };
    if (data.target_type !== "track_entries") delete data.track;
    const created = await api.createGoal(data);
    setSaving(false);
    onCreated(created);
    onClose();
    setForm({ title: "", description: "", target_type: "entries_count", target_value: 10, track: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading font-medium">New goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Goal title" />
          <Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Why does this matter? (optional)" rows={2} className="resize-none" />

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Goal type</p>
            <div className="grid grid-cols-2 gap-2">
              {TARGET_TYPES.map(t => (
                <button key={t.id} onClick={() => update("target_type", t.id)}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${form.target_type === t.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {form.target_type === "track_entries" && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Track</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(TRACKS).map(([id, t]) => (
                  <button key={id} onClick={() => update("track", id)}
                    className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${form.track === id ? "border-primary bg-primary/5" : "border-border text-muted-foreground"}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Target ({TARGET_TYPES.find(t => t.id === form.target_type)?.unit})
            </p>
            <Input type="number" min={1} value={form.target_value} onChange={e => update("target_value", e.target.value)} className="w-32" />
          </div>

          <Button onClick={handleSave} disabled={saving || !form.title} className="w-full">
            {saving ? "Saving…" : "Add goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
