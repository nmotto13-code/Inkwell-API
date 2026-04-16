import { useState } from "react";
import { TRACKS } from "@/lib/trackConfig";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddTrackModal({ open, onClose, enrolledTracks, onSave }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const availableTracks = Object.values(TRACKS).filter(t => !enrolledTracks.includes(t.id));

  const toggleTrack = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
    onClose();
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-medium">Add a journaling track</DialogTitle>
        </DialogHeader>

        {availableTracks.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">You're enrolled in all available tracks!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableTracks.map((track) => {
              const Icon = track.icon;
              const isSelected = selected.includes(track.id);
              return (
                <button
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className={cn(
                    "relative text-left p-4 rounded-xl border transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", track.bgColor)}>
                    <Icon className={cn("w-4 h-4", track.color)} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{track.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{track.description}</p>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={selected.length === 0 || saving}
            className="px-6"
          >
            {saving ? "Adding…" : `Add ${selected.length > 0 ? selected.length : ""} track${selected.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
