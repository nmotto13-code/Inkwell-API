import { useState, useEffect } from "react";
import { useApi } from "@/api/inkwellApi";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { Plus, Flame, BookOpen, PenLine, Trophy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalCard from "../components/progress/GoalCard";
import AddGoalDialog from "../components/progress/AddGoalDialog";
import JournalCalendar from "../components/progress/JournalCalendar";
import { cn } from "@/lib/utils";

const ACHIEVEMENTS = [
  { id: "first_entry", emoji: "✍️", name: "First Words", desc: "Write your first entry", check: (pages) => pages.length >= 1 },
  { id: "ten_entries", emoji: "📚", name: "Getting Going", desc: "Write 10 entries", check: (pages) => pages.length >= 10 },
  { id: "fifty_entries", emoji: "🏆", name: "Dedicated Writer", desc: "Write 50 entries", check: (pages) => pages.length >= 50 },
  { id: "three_streak", emoji: "🔥", name: "On Fire", desc: "3-day streak", check: (pages, streak) => streak >= 3 },
  { id: "seven_streak", emoji: "⚡", name: "Week Warrior", desc: "7-day streak", check: (pages, streak) => streak >= 7 },
  { id: "thirty_streak", emoji: "🌟", name: "Monthly Master", desc: "30-day streak", check: (pages, streak) => streak >= 30 },
  { id: "multi_track", emoji: "🎨", name: "Explorer", desc: "Write in 3 different tracks", check: (pages) => new Set(pages.map(p => p.track)).size >= 3 },
  { id: "gratitude_10", emoji: "🙏", name: "Grateful Heart", desc: "10 gratitude entries", check: (pages) => pages.filter(p => p.track === "gratitude").length >= 10 },
  { id: "dream_5", emoji: "🌙", name: "Dream Catcher", desc: "5 dream journal entries", check: (pages) => pages.filter(p => p.track === "dream_journal").length >= 5 },
];

function calcStreak(pages) {
  if (!pages.length) return 0;
  const days = [...new Set(pages.map(p => format(parseISO(p.entry_date), "yyyy-MM-dd")))].sort().reverse();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = differenceInCalendarDays(parseISO(days[i - 1]), parseISO(days[i]));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function calcProgress(goal, pages) {
  switch (goal.target_type) {
    case "entries_count": return pages.length;
    case "streak_days": return calcStreak(pages);
    case "track_entries": return pages.filter(p => p.track === goal.track).length;
    case "words_written": return pages.reduce((acc, p) => acc + (p.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    default: return 0;
  }
}

export default function Progress() {
  const api = useApi();
  const [pages, setPages] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [allPages, allGoals] = await Promise.all([
        api.listPages(),
        api.listGoals(),
      ]);
      setPages(allPages);
      setGoals(allGoals);
      setLoading(false);
    };
    load();
  }, []);

  const streak = calcStreak(pages);
  const totalWords = pages.reduce((acc, p) => acc + (p.content?.split(/\s+/).filter(Boolean).length || 0), 0);
  const tracksUsed = new Set(pages.map(p => p.track)).size;
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(pages, streak));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">Progress</h1>
        <Button variant="outline" size="sm" onClick={() => setCalendarOpen(true)} className="gap-1.5">
          <CalendarDays className="w-4 h-4" /> View Calendar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "Day streak", value: streak, color: "text-orange-500", bg: "bg-orange-50" },
          { icon: BookOpen, label: "Total entries", value: pages.length, color: "text-primary", bg: "bg-primary/5" },
          { icon: PenLine, label: "Words written", value: totalWords.toLocaleString(), color: "text-accent", bg: "bg-accent/10" },
          { icon: Trophy, label: "Tracks active", value: tracksUsed, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <p className="text-xl font-heading font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-medium">Your goals</h2>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add goal
          </Button>
        </div>
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground text-sm mb-3">No goals yet. Set one to track your progress.</p>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>Add your first goal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={calcProgress(goal, pages)}
                onDelete={(id) => setGoals(prev => prev.filter(g => g.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-medium mb-4">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedAchievements.find(u => u.id === a.id);
            return (
              <div key={a.id} className={cn(
                "rounded-xl border p-4 text-center transition-all",
                unlocked ? "border-primary/20 bg-primary/5" : "border-border bg-card opacity-50"
              )}>
                <span className={cn("text-3xl block mb-2", !unlocked && "grayscale")}>{a.emoji}</span>
                <p className={cn("text-sm font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>{a.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                {unlocked && <p className="text-[10px] text-primary mt-1.5 font-medium">Unlocked ✓</p>}
              </div>
            );
          })}
        </div>
      </div>

      <AddGoalDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={(g) => setGoals(prev => [g, ...prev])} />
      <JournalCalendar pages={pages} open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </div>
  );
}
