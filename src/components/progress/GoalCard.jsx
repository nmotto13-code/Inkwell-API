import { useApi } from "@/api/inkwellApi";
import { Trash2, CheckCircle2 } from "lucide-react";
import { TRACKS } from "@/lib/trackConfig";
import { cn } from "@/lib/utils";

const TARGET_LABELS = {
  entries_count: "total entries",
  streak_days: "day streak",
  track_entries: "entries",
  words_written: "words written",
};

export default function GoalCard({ goal, progress, onDelete }) {
  const api = useApi();
  const pct = Math.min(100, Math.round((progress / goal.target_value) * 100));
  const isComplete = pct >= 100;
  const track = goal.track ? TRACKS[goal.track] : null;

  const handleDelete = async () => {
    await api.deleteGoal(goal.id);
    onDelete(goal.id);
  };

  return (
    <div className={cn("rounded-xl border p-4 space-y-3 transition-all", isComplete ? "border-primary/30 bg-primary/5" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isComplete && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            <p className={cn("text-sm font-medium", isComplete && "text-primary")}>{goal.title}</p>
          </div>
          {goal.description && <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>}
          {track && <p className="text-xs text-muted-foreground mt-0.5">Track: {track.name}</p>}
        </div>
        <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress} / {goal.target_value} {TARGET_LABELS[goal.target_type]}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isComplete ? "bg-primary" : "bg-primary/60")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
