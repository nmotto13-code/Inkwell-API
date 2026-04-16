import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { TRACKS, MOOD_OPTIONS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { ArrowLeft, PenLine, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function JournalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [journal, setJournal] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getJournal(id).then(data => {
      if (data) {
        setJournal(data);
        setPages((data.pages || []).slice().sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)));
      }
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

  if (!journal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Journal not found</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Go home</Button>
      </div>
    );
  }

  const track = TRACKS[journal.track];
  const Icon = track?.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Link to={`/journals/${id}/new`}>
          <Button size="sm" className="gap-1.5">
            <PenLine className="w-3.5 h-3.5" /> New page
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          {track && (
            <div className={cn("w-5 h-5 rounded flex items-center justify-center", track.bgColor)}>
              <Icon className={cn("w-3 h-3", track.color)} />
            </div>
          )}
          <span className="text-xs text-muted-foreground">{track?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{journal.cover_emoji || "📓"}</span>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">{journal.name}</h1>
            {journal.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{journal.description}</p>
            )}
          </div>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-3">No pages yet. Start writing!</p>
          <Link to={`/journals/${id}/new`}>
            <Button className="gap-2"><PenLine className="w-4 h-4" /> Write first page</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </p>
          {pages.map((page, i) => {
            const mood = MOOD_OPTIONS.find(m => m.id === page.mood);
            return (
              <Link
                key={page.id}
                to={`/pages/${page.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Page {pages.length - i}</span>
                      {page.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {page.title || (page.content ? page.content.slice(0, 70) + "…" : "Untitled page")}
                    </p>
                    {page.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{page.content.slice(0, 120)}</p>
                    )}
                    {page.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {page.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-xs text-muted-foreground">{format(new Date(page.entry_date), "MMM d")}</span>
                    {mood && <span className="text-base">{mood.emoji}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
