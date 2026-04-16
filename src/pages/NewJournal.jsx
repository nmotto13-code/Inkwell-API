import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import { useApi } from "@/api/inkwellApi";
import { TRACKS } from "@/lib/trackConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = ["📓", "📔", "📒", "📕", "📗", "📘", "📙", "✏️", "🖊️", "🌿", "🌸", "🌙", "☀️", "💭", "🔮"];

export default function NewJournal() {
  const navigate = useNavigate();
  const api = useApi();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTrack = urlParams.get("track");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📓");
  const [selectedTrack, setSelectedTrack] = useState(preselectedTrack || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !selectedTrack) return;
    setSaving(true);

    // Ensure track is enrolled locally
    const { value } = await Preferences.get({ key: "user_profile" });
    const profile = value ? JSON.parse(value) : {};
    const enrolled = profile.enrolled_tracks || [];
    if (!enrolled.includes(selectedTrack)) {
      const updated = { ...profile, enrolled_tracks: [...enrolled, selectedTrack] };
      await Preferences.set({ key: "user_profile", value: JSON.stringify(updated) });
    }

    const journal = await api.createJournal({
      name: name.trim(),
      description: description.trim(),
      cover_emoji: selectedEmoji,
      track: selectedTrack,
    });
    setSaving(false);
    navigate(`/journals/${journal.id}`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">New Journal</h1>
        <p className="text-sm text-muted-foreground mt-1">A journal holds all the pages you write for a topic.</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Pick a cover</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setSelectedEmoji(e)}
              className={cn(
                "w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all",
                selectedEmoji === e ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Journal name"
        className="text-lg bg-card border-border"
        autoFocus
      />

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this journal about? (optional)"
        rows={2}
        className="bg-card border-border resize-none"
      />

      {!preselectedTrack && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Track</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(TRACKS).map(track => {
              const Icon = track.icon;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-left transition-all",
                    selectedTrack === track.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
                  )}
                >
                  <div className={cn("w-6 h-6 rounded flex items-center justify-center", track.bgColor)}>
                    <Icon className={cn("w-3.5 h-3.5", track.color)} />
                  </div>
                  <span className="text-sm">{track.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border flex justify-end">
        <Button onClick={handleSave} disabled={!name.trim() || !selectedTrack || saving} className="px-8">
          {saving ? "Creating…" : "Create journal"}
        </Button>
      </div>
    </div>
  );
}
