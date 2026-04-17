import { Sparkles } from "lucide-react";

// Reflection feature disabled — no LLM backend configured
export default function ReflectionCard({ userName, entries }) {
  if (!entries || entries.length < 3) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-accent tracking-wide uppercase">Reflection</span>
      </div>
      <p className="text-sm text-muted-foreground">Reflection feature coming soon</p>
    </div>
  );
}
