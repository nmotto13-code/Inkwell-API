import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function NewEntry() {
  const navigate = useNavigate();
  const api = useApi();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTrack = urlParams.get("track");

  const [user, setUser] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(preselectedTrack || "");
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
    Preferences.get({ key: "user_profile" }).then(({ value }) => {
      setUser(value ? JSON.parse(value) : {});
    });
  }, []);

  const update = (key, value) => setEntry((prev) => ({ ...prev, [key]: value }));
  const tracks = user?.enrolled_tracks || [];

  const handleSave = async () => {
    setSaving(true);
    await api.createEntry({
      ...entry,
      track: selectedTrack,
      entry_date: new Date().toISOString(),
    });
    setSaving(false);
    navigate("/");
  };

  if (!selectedTrack) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
            Start writing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a track for this entry</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tracks.map((trackId) => {
            const track = TRACKS[trackId];
            if (!track) return null;
            const Icon = track.icon;
            return (
              <button
                key={trackId}
                onClick={() => setSelectedTrack(trackId)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", track.bgColor)}>
                  <Icon className={cn("w-4 h-4", track.color)} />
                </div>
                <p className="text-sm font-medium text-foreground">{track.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const track = TRACKS[selectedTrack];
  const Icon = track?.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => preselectedTrack ? navigate(-1) : setSelectedTrack("")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          {track && (
            <>
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", track.bgColor)}>
                <Icon className={cn("w-3.5 h-3.5", track.color)} />
              </div>
              <span className="text-sm text-muted-foreground">{track.name}</span>
            </>
          )}
        </div>
      </div>

      <AIPromptSuggestion
        track={selectedTrack}
        user={user}
        onAccept={(prompt) => {
          update("prompt_used", prompt);
          update("content", prompt + "\n\n");
        }}
        onSkip={() => {}}
      />

      <Input
        value={entry.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Title (optional)"
        className="text-lg font-heading bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
      />

      {selectedTrack === "emotional_wellness" && (
        <MoodSelector value={entry.mood} onChange={(v) => update("mood", v)} />
      )}
      {selectedTrack === "gratitude" && (
        <GratitudeForm items={entry.gratitude_items} onChange={(v) => update("gratitude_items", v)} />
      )}
      {selectedTrack === "productivity" && (
        <GoalsForm goals={entry.goals} onChange={(v) => update("goals", v)} />
      )}
      {selectedTrack === "habit_tracking" && (
        <HabitsForm habits={entry.habits} onChange={(v) => update("habits", v)} />
      )}
      {selectedTrack === "dream_journal" && (
        <Input
          value={entry.dream_time}
          onChange={(e) => update("dream_time", e.target.value)}
          placeholder="When did you have this dream? (e.g., last night, during a nap)"
          className="bg-card border-border"
        />
      )}

      <Textarea
        value={entry.content}
        onChange={(e) => update("content", e.target.value)}
        placeholder={
          selectedTrack === "creative_writing"
            ? "Let your imagination wander…"
            : selectedTrack === "dream_journal"
            ? "Describe your dream while it's still fresh…"
            : selectedTrack === "family"
            ? "What's on your mind about family today?"
            : "Write freely…"
        }
        rows={selectedTrack === "creative_writing" ? 16 : 8}
        className={cn(
          "bg-card border-border resize-none",
          selectedTrack === "creative_writing" && "font-heading text-lg leading-relaxed"
        )}
      />

      <div className="rounded-xl border border-border p-4">
        <TagInput tags={entry.tags} onChange={(v) => update("tags", v)} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Switch checked={entry.is_private} onCheckedChange={(v) => update("is_private", v)} />
          <Lock className="w-3.5 h-3.5" />
          Private
        </label>
        <Button onClick={handleSave} disabled={saving} className="px-8">
          {saving ? "Saving…" : "Save entry"}
        </Button>
      </div>
    </div>
  );
}
