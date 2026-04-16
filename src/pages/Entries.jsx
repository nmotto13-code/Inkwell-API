import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApi } from "@/api/inkwellApi";
import { TRACKS, MOOD_OPTIONS } from "@/lib/trackConfig";
import { format } from "date-fns";
import { Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Entries() {
  const api = useApi();
  const [entries, setEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTracks, setFilterTracks] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [all, allJournals] = await Promise.all([
        api.listPages(),
        api.listJournals(),
      ]);
      setEntries(all);
      setJournals(allJournals);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = entries.filter((e) => {
    const matchesSearch = !searchQuery ||
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesTrack = filterTracks.length === 0 || filterTracks.includes(e.track);
    return matchesSearch && matchesTrack;
  });

  const allTracks = [...new Set(entries.map(e => e.track).filter(Boolean))];

  const toggleTrack = (trackId) => {
    setFilterTracks(prev =>
      prev.includes(trackId) ? prev.filter(t => t !== trackId) : [...prev, trackId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
        Your entries
      </h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries…"
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm hover:border-primary/20 transition-all min-w-[140px] justify-between"
          >
            <span className="text-muted-foreground">
              {filterTracks.length === 0 ? "All tracks" : `${filterTracks.length} selected`}
            </span>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[180px] space-y-0.5">
              <button
                onClick={() => { setFilterTracks([]); setDropdownOpen(false); }}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", filterTracks.length === 0 ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary")}
              >
                All tracks
              </button>
              {allTracks.map(trackId => {
                const track = TRACKS[trackId];
                if (!track) return null;
                const Icon = track.icon;
                const selected = filterTracks.includes(trackId);
                return (
                  <button
                    key={trackId}
                    onClick={() => toggleTrack(trackId)}
                    className={cn("w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors", selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary")}
                  >
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", track.bgColor)}>
                      <Icon className={cn("w-2.5 h-2.5", track.color)} />
                    </div>
                    {track.name}
                    {selected && <span className="ml-auto text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            {entries.length === 0 ? "No entries yet. Start writing!" : "No entries match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const track = TRACKS[entry.track];
            const Icon = track?.icon;
            const mood = MOOD_OPTIONS.find(m => m.id === entry.mood);
            const journal = journals.find(j => j.id === entry.journal_id);

            return (
              <Link
                key={entry.id}
                to={`/pages/${entry.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {track && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", track.bgColor)}>
                          <Icon className={cn("w-2.5 h-2.5", track.color)} />
                        </div>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", track.color)}>{track.name}</span>
                      </div>
                    )}
                    {journal && (
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {journal.cover_emoji} {journal.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.title || (entry.content ? entry.content.slice(0, 60) : "Untitled")}
                      </p>
                      {entry.is_private && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </div>
                    {entry.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {entry.content.slice(0, 120)}
                      </p>
                    )}
                    {entry.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.entry_date), "MMM d")}
                    </span>
                    {mood && <span className="text-sm mt-1">{mood.emoji}</span>}
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
