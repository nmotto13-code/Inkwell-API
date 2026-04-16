import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { TRACKS, MOOD_OPTIONS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { ArrowLeft, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function PageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [page, setPage] = useState(null);
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const pageData = await api.getPage(id).catch(() => null);
      if (pageData) {
        setPage(pageData);
        if (pageData.journal_id) {
          const journalData = await api.getJournal(pageData.journal_id).catch(() => null);
          setJournal(journalData);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Page not found</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const track = TRACKS[page.track];
  const Icon = track?.icon;
  const mood = MOOD_OPTIONS.find(m => m.id === page.mood);

  const handleDelete = async () => {
    await api.deletePage(page.id);
    navigate(`/journals/${page.journal_id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/journals/${page.journal_id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {journal?.name || "Journal"}
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this page?</AlertDialogTitle>
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
            <div className={cn("w-5 h-5 rounded flex items-center justify-center", track.bgColor)}>
              <Icon className={cn("w-3 h-3", track.color)} />
            </div>
          )}
          <span className="text-xs text-muted-foreground">{track?.name}</span>
          {page.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
          {page.title || "Untitled page"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(page.entry_date), "EEEE, MMMM d, yyyy · h:mm a")}
        </p>
      </div>

      {mood && (
        <div className="flex items-center gap-2">
          <span className="text-xl">{mood.emoji}</span>
          <span className="text-sm text-muted-foreground">Feeling {mood.label.toLowerCase()}</span>
        </div>
      )}

      {page.gratitude_items?.filter(Boolean).length > 0 && (
        <div className="space-y-2">
          {page.gratitude_items.filter(Boolean).map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-secondary">
              <span className="text-accent font-heading font-medium">{i + 1}.</span>
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}

      {page.goals?.filter(g => g.goal).length > 0 && (
        <div className="space-y-3">
          {page.goals.filter(g => g.goal).map((g, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-1">
              <p className="text-sm font-medium">{g.goal}</p>
              {g.progress && <p className="text-sm text-muted-foreground">{g.progress}</p>}
              {g.next_steps && <p className="text-xs text-primary">Next: {g.next_steps}</p>}
            </div>
          ))}
        </div>
      )}

      {page.habits?.filter(h => h.name).length > 0 && (
        <div className="space-y-2">
          {page.habits.filter(h => h.name).map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
              <span className={cn("w-4 h-4 rounded border shrink-0", h.completed ? "bg-primary border-primary" : "border-border")} />
              <div>
                <p className={cn("text-sm", h.completed ? "text-foreground" : "text-muted-foreground")}>{h.name}</p>
                {h.notes && <p className="text-xs text-muted-foreground">{h.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {page.content && (
        <div className={cn("leading-relaxed text-foreground", page.track === "creative_writing" ? "font-heading text-lg" : "text-sm")}>
          {page.content.split("\n").map((line, i) => (
            <p key={i} className={line ? "mb-2" : "mb-4"}>{line}</p>
          ))}
        </div>
      )}

      {page.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
          {page.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
