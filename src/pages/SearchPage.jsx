import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { TRACKS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const api = useApi();
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.listEntries().then((data) => {
      setEntries(data);
      setLoaded(true);
    });
  }, []);

  const results = query.trim()
    ? entries.filter((e) =>
        e.title?.toLowerCase().includes(query.toLowerCase()) ||
        e.content?.toLowerCase().includes(query.toLowerCase()) ||
        e.tags?.some(t => t.includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
        Search
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your journal…"
          className="pl-10 text-lg py-6 bg-card border-border"
          autoFocus
        />
      </div>

      {query.trim() && results.length === 0 && loaded && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No entries found for "{query}"
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          {results.map((entry) => {
            const track = TRACKS[entry.track];
            const Icon = track?.icon;
            return (
              <Link
                key={entry.id}
                to={`/entries/${entry.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  {track && (
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center", track.bgColor)}>
                      <Icon className={cn("w-3 h-3", track.color)} />
                    </div>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {entry.title || (entry.content ? entry.content.slice(0, 60) : "Untitled")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                  {track?.name} · {format(new Date(entry.entry_date), "MMM d, yyyy")}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {!query.trim() && loaded && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Search by keywords, tags, or anything you remember writing.
          </p>
        </div>
      )}
    </div>
  );
}
