import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import { useApi } from "@/api/inkwellApi";
import { TRACKS } from "@/lib/trackConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import AIPromptSuggestion from "../components/entry/AIPromptSuggestion";
import MoodSelector from "../components/entry/MoodSelector";
import GratitudeForm from "../components/entry/GratitudeForm";
import GoalsForm from "../components/entry/GoalsForm";
import HabitsForm from "../components/entry/HabitsForm";
import TagInput from "../components/entry/TagInput";
import { ArrowLeft, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewPage() {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [journal, setJournal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState({
    title: "",
    content: "",
    mood: "",
    gratitude_items: ["", "", ""],
    goals: [{ goal: "", progress: "", next_steps: "" }],
    habits: [{ name: "", completed: false, notes: "" }],
    tags: [],
    is_private: false,
    prompt_used: "",
    dream_time: "",
  });

  useEffect(() => {
    const load = async () => {
      const [{ value }, journalData] = await Promise.all([
        Preferences.get({ key: "user_profile" }),
        api.getJournal(journalId),
      ]);
      setUser(value ? JSON.parse(value) : {});
      if (journalData) setJournal(journalData);
    };
    load();
  }, [journalId]);

  const update = (key, value) => setEntry(prev => ({ ...prev, [key]: value }));
  const track = journal ? TRACKS[journal.track] : null;
  const Icon = track?.icon;

  const handleSave = async () => {
    setSaving(true);
    if (journal?.track) {
      const { value } = await Preferences.get({ key: "user_profile" });
      const profile = value ? JSON.parse(value) : {};
      const enrolled = profile.enrolled_tracks || [];
      if (!enrolled.includes(journal.track)) {
        await Preferences.set({
          key: "user_profile",
          value: JSON.stringify({ ...profile, enrolled_tracks: [...enrolled, journal.track] }),
        });
      }
    }
    await api.createPage(journalId, {
      ...entry,
      track: journal?.track,
      entry_date: new Date().toISOString(),
    });
    setSaving(false);
    navigate(`/journals/${journalId}`);
  };

  if (!journal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {journal.name}
        </button>
        {track && (
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", track.bgColor)}>
              <Icon className={cn("w-3.5 h-3.5", track.color)} />
            </div>
            <span className="text-sm text-muted-foreground">{track.name}</span>
          </div>
        )}
      </div>

      <AIPromptSuggestion
        track={journal.track}
        user={user}
        onAccept={(prompt) => { update("prompt_used", prompt); update("content", prompt + "\n\n"); }}
        onSkip={() => {}}
      />

      <Input
        value={entry.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Title (optional)"
        className="text-lg font-heading bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
      />

      {journal.track === "emotional_wellness" && (
        <MoodSelector value={entry.mood} onChange={(v) => update("mood", v)} />
      )}
      {journal.track === "gratitude" && (
        <GratitudeForm items={entry.gratitude_items} onChange={(v) => update("gratitude_items", v)} />
      )}
      {journal.track === "productivity" && (
        <GoalsForm goals={entry.goals} onChange={(v) => update("goals", v)} />
      )}
      {journal.track === "habit_tracking" && (
        <HabitsForm habits={entry.habits} onChange={(v) => update("habits", v)} />
      )}
      {journal.track === "dream_journal" && (
        <Input
          value={entry.dream_time}
          onChange={(e) => update("dream_time", e.target.value)}
          placeholder="When did you have this dream?"
          className="bg-card border-border"
        />
      )}

      <Textarea
        value={entry.content}
        onChange={(e) => update("content", e.target.value)}
        placeholder={
          journal.track === "creative_writing" ? "Let your imagination wander…" :
          journal.track === "dream_journal" ? "Describe your dream while it's still fresh…" :
          "Write freely…"
        }
        rows={journal.track === "creative_writing" ? 16 : 10}
        className={cn(
          "bg-card border-border resize-none",
          journal.track === "creative_writing" && "font-heading text-lg leading-relaxed"
        )}
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
          {saving ? "Saving…" : "Save page"}
        </Button>
      </div>
    </div>
  );
}
