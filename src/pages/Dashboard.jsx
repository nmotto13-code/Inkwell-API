import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { useApi } from "@/api/inkwellApi";
import { TRACKS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AddTrackModal from "../components/dashboard/AddTrackModal";
import TrackDialog from "../components/dashboard/TrackDialog";
import { Link } from "react-router-dom";

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function TrackTile({ trackId, journals, pages, onClick }) {
  const track = TRACKS[trackId];
  if (!track) return null;
  const Icon = track.icon;

  const trackPages = pages
    .filter(p => p.track === trackId)
    .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  const lastPage = trackPages[0];
  const journalCount = journals.filter(j => j.track === trackId).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", track.bgColor)}>
          <Icon className={cn("w-5 h-5", track.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{track.name}</p>
          <p className="text-xs text-muted-foreground">{journalCount} {journalCount === 1 ? "journal" : "journals"}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      {lastPage ? (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Recent Entry</p>
          <p className="text-xs text-muted-foreground truncate">
            {lastPage.title || lastPage.content?.slice(0, 60) || "Untitled"}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No entries yet</p>
      )}
    </button>
  );
}

export default function Dashboard() {
  const api = useApi();
  const [profile, setProfile] = useState(null);
  const [journals, setJournals] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);

  const load = async () => {
    const [{ value }, allJournals, allPages] = await Promise.all([
      Preferences.get({ key: "user_profile" }),
      api.listJournals(),
      api.listPages(),
    ]);
    setProfile(value ? JSON.parse(value) : {});
    setJournals(allJournals);
    setPages(allPages);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddTracks = async (newTrackIds) => {
    const current = profile?.enrolled_tracks || [];
    const updated = [...new Set([...current, ...newTrackIds])];
    const updatedProfile = { ...profile, enrolled_tracks: updated };
    await Preferences.set({ key: "user_profile", value: JSON.stringify(updatedProfile) });
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const enrolledTracks = profile?.enrolled_tracks || [];
  const journalTracks = [...new Set(journals.map(j => j.track).filter(Boolean))];
  const tracks = [...new Set([...enrolledTracks, ...journalTracks])];
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{today}</p>
          <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
            {getGreeting(profile?.first_name || "there")}
          </h1>
        </div>
        <Button
          onClick={() => setAddTrackOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 mt-1"
        >
          <Plus className="w-4 h-4" /> Add Track
        </Button>
      </div>

      {/* Tracks grid */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="font-heading text-xl text-muted-foreground">No tracks yet</p>
          <p className="text-sm text-muted-foreground">Add a track to start organizing your journals.</p>
          <Button onClick={() => setAddTrackOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add your first track
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tracks.map(trackId => (
            <TrackTile
              key={trackId}
              trackId={trackId}
              journals={journals}
              pages={pages}
              onClick={() => setActiveTrack(trackId)}
            />
          ))}
        </div>
      )}

      <TrackDialog
        trackId={activeTrack}
        journals={journals}
        pages={pages}
        open={!!activeTrack}
        onClose={() => setActiveTrack(null)}
      />

      <AddTrackModal
        open={addTrackOpen}
        onClose={() => setAddTrackOpen(false)}
        enrolledTracks={tracks}
        onSave={handleAddTracks}
      />
    </div>
  );
}
