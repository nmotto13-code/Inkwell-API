import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import { useApi } from "@/api/inkwellApi";
import { TRACKS } from "@/lib/trackConfig";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WriteDialog({ open, onClose }) {
  const navigate = useNavigate();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [{ value }, all] = await Promise.all([
        Preferences.get({ key: "user_profile" }),
        api.listJournals(),
      ]);
      setUser(value ? JSON.parse(value) : {});
      setJournals(all);
    };
    load();
  }, [open]);

  const handleClose = () => {
    setSelectedTrack(null);
    onClose();
  };

  const goToNewPage = (journalId) => {
    handleClose();
    navigate(`/journals/${journalId}/new`);
  };

  const goToNewJournal = (trackId) => {
    handleClose();
    navigate(`/journals/new?track=${trackId}`);
  };

  const goToNewTrack = () => {
    handleClose();
    navigate("/settings");
  };

  const enrolledTracks = user?.enrolled_tracks || [];
  const journalTracks = [...new Set(journals.map(j => j.track).filter(Boolean))];
  const tracks = [...new Set([...enrolledTracks, ...journalTracks])];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedTrack && (
              <button onClick={() => setSelectedTrack(null)} className="text-muted-foreground hover:text-foreground mr-1">
                ←
              </button>
            )}
            <DialogTitle className="font-heading text-lg font-medium">
              {selectedTrack ? TRACKS[selectedTrack]?.name : "Start writing"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-2 mt-1">
          {!selectedTrack ? (
            <>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase px-1">Your tracks</p>
              {tracks.map((trackId) => {
                const track = TRACKS[trackId];
                if (!track) return null;
                const Icon = track.icon;
                const trackJournals = journals.filter(j => j.track === trackId);
                return (
                  <button
                    key={trackId}
                    onClick={() => setSelectedTrack(trackId)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all text-left"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", track.bgColor)}>
                      <Icon className={cn("w-4 h-4", track.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{track.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {trackJournals.length} {trackJournals.length === 1 ? "journal" : "journals"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">›</span>
                  </button>
                );
              })}
              <button
                onClick={goToNewTrack}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Plus className="w-4 h-4" /> Add new track
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase px-1">Choose a journal</p>
              {journals.filter(j => j.track === selectedTrack).map((journal) => (
                <button
                  key={journal.id}
                  onClick={() => goToNewPage(journal.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all text-left"
                >
                  <span className="text-2xl">{journal.cover_emoji || "📓"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{journal.name}</p>
                    {journal.description && (
                      <p className="text-xs text-muted-foreground">{journal.description}</p>
                    )}
                  </div>
                </button>
              ))}
              <button
                onClick={() => goToNewJournal(selectedTrack)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Plus className="w-4 h-4" /> Add new journal
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
