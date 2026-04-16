import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { TRACKS, MOOD_OPTIONS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { ArrowLeft, Lock, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEntry(id).then(data => {
      setEntry(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Entry not found</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Go home</Button>
      </div>
    );
  }

  const track = TRACKS[entry.track];
  const Icon = track?.icon;
  const mood = MOOD_OPTIONS.find(m => m.id === entry.mood);

  const handleDelete = async () => {
    await api.deleteEntry(entry.id);
    navigate("/entries");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          {track && (
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", track.bgColor)}>
              <Icon className={cn("w-3.5 h-3.5", track.color)} />
            </div>
          )}
          <span className="text-xs text-muted-foreground">{track?.name}</span>
          {entry.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
          {entry.title || "Untitled entry"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy · h:mm a")}
        </p>
      </div>

      {mood && (
        <div className="flex items-center gap-2">
          <span className="text-xl">{mood.emoji}</span>
          <span className="text-sm text-muted-foreground">Feeling {mood.label.toLowerCase()}</span>
        </div>
      )}

      {entry.gratitude_items?.filter(Boolean).length > 0 && (
        <div className="space-y-2">
          {entry.gratitude_items.filter(Boolean).map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-secondary">
              <span className="text-accent font-heading font-medium">{i + 1}.</span>
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}

      {entry.goals?.filter(g => g.goal).length > 0 && (
        <div className="space-y-3">
          {entry.goals.filter(g => g.goal).map((g, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">{g.goal}</p>
              {g.progress && <p className="text-sm text-muted-foreground">{g.progress}</p>}
              {g.next_steps && <p className="text-xs text-primary">Next: {g.next_steps}</p>}
            </div>
          ))}
        </div>
      )}

      {entry.habits?.filter(h => h.name).length > 0 && (
        <div className="space-y-2">
          {entry.habits.filter(h => h.name).map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
              <span className={cn("w-4 h-4 rounded border", h.completed ? "bg-primary border-primary" : "border-border")} />
              <div>
                <p className={cn("text-sm", h.completed ? "text-foreground" : "text-muted-foreground")}>{h.name}</p>
                {h.notes && <p className="text-xs text-muted-foreground">{h.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {entry.content && (
        <div className={cn(
          "prose prose-sm max-w-none text-foreground leading-relaxed",
          entry.track === "creative_writing" && "font-heading text-lg"
        )}>
          {entry.content.split("\n").map((line, i) => (
            <p key={i} className={line ? "" : "h-4"}>{line}</p>
          ))}
        </div>
      )}

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
          <Tag className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
          {entry.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
