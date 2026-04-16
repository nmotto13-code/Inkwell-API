import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import TagInput from "../components/entry/TagInput";
import { ArrowLeft, Lock, Feather } from "lucide-react";

export default function FreeWrite() {
  const navigate = useNavigate();
  const api = useApi();
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState({
    title: "",
    content: "",
    tags: [],
    is_private: false,
  });

  const update = (key, value) => setEntry(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await api.createFreeWritePage({
      ...entry,
      entry_date: new Date().toISOString(),
    });
    setSaving(false);
    navigate("/entries");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Feather className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">Free Write</h1>
          <p className="text-xs text-muted-foreground">No track, no structure — just words.</p>
        </div>
      </div>

      <Input
        value={entry.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Title (optional)"
        className="text-lg font-heading bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
        autoFocus
      />

      <Textarea
        value={entry.content}
        onChange={(e) => update("content", e.target.value)}
        placeholder="Write whatever's on your mind…"
        rows={16}
        className="bg-card border-border resize-none"
      />

      <div className="rounded-xl border border-border p-4">
        <TagInput tags={entry.tags} onChange={(v) => update("tags", v)} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Switch checked={entry.is_private} onCheckedChange={(v) => update("is_private", v)} />
          <Lock className="w-3.5 h-3.5" /> Private
        </label>
        <Button onClick={handleSave} disabled={saving} className="px-8">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
