import { FolderOpen, Layers, Target, Plus, MoreHorizontal, Sparkles, Settings, Flame, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type Props = {
  currentView: "dashboard" | "workspace" | "daily-goal";
  selectedNoteId: string | null;
  activeFilterKind: "all" | "favorites" | "collection";
  notesCount: number;
  todayFocusSeconds?: number;
  dailyGoalHours?: number;
  onNavigateCourses: () => void;
  onNavigateNotes: () => void;
  onNavigateEditor: () => void;
  onNavigateDailyGoal: () => void;
  onCreateNote: () => void;
  onOpenMoreSheet: () => void;
  onOpenSettings?: () => void;
};

export function MobileBottomDock({
  currentView,
  selectedNoteId,
  activeFilterKind,
  notesCount,
  todayFocusSeconds = 0,
  dailyGoalHours = 2.0,
  onNavigateCourses,
  onNavigateNotes,
  onNavigateEditor,
  onNavigateDailyGoal,
  onCreateNote,
  onOpenMoreSheet,
  onOpenSettings,
}: Props) {
  const isDashboard = currentView === "dashboard";
  const isDailyGoal = currentView === "daily-goal";
  const isNotesList = currentView === "workspace" && !selectedNoteId;
  const isEditor = currentView === "workspace" && !!selectedNoteId;

  const goalSeconds = Math.max(60, dailyGoalHours * 3600);
  const progressPct = Math.min(100, Math.round((todayFocusSeconds / goalSeconds) * 100));

  return (
    <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-3 z-40 md:hidden select-none">
      <nav className="glass-panel relative flex items-center justify-around rounded-3xl border border-white/15 bg-black/60 px-2 py-2.5 gap-0.5 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">
        {/* Interactive Top Pull / Swipe-Up Handle for Settings */}
        <div
          onClick={() => {
            haptic("medium");
            if (onOpenSettings) onOpenSettings();
          }}
          className="absolute -top-3.5 inset-x-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none py-1 group pointer-events-auto"
          title="Swipe up for Settings"
        >
          <div className="h-1.5 w-14 rounded-full bg-white/35 transition-all duration-300 group-hover:bg-primary group-hover:w-16 group-active:w-20 group-active:bg-primary shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        </div>
        {/* Tab 1: Courses */}
        <button
          type="button"
          onClick={() => {
            haptic("light");
            onNavigateCourses();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2 px-3 transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer",
            isDashboard
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
            isDashboard ? "bg-primary/20 text-primary shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]" : "bg-transparent"
          )}>
            <FolderOpen className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[0.65rem] uppercase tracking-wide font-semibold">Courses</span>
        </button>

        {/* Tab 2: Notes List */}
        <button
          type="button"
          onClick={() => {
            haptic("light");
            onNavigateNotes();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2 px-3 transition-all duration-200 active:scale-90 relative touch-manipulation cursor-pointer",
            isNotesList
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl transition-all relative",
            isNotesList ? "bg-primary/20 text-primary shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)]" : "bg-transparent"
          )}>
            <Layers className="h-[18px] w-[18px]" />
            {notesCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground px-1 font-mono">
                {notesCount > 99 ? "99+" : notesCount}
              </span>
            ) : null}
          </div>
          <span className="text-[0.65rem] uppercase tracking-wide font-semibold">Notes</span>
        </button>

        {/* Center: FAB New Note */}
        <div className="relative -top-4">
          <button
            type="button"
            aria-label="Create note"
            onClick={() => {
              haptic("heavy");
              onCreateNote();
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground shadow-[0_8px_28px_-4px_hsl(var(--primary)/0.8)] ring-4 ring-background transition-transform duration-200 hover:scale-105 active:scale-90 touch-manipulation cursor-pointer"
          >
            <Plus className="h-7 w-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Daily Study Goal (Replaced Old Starred Interface) */}
        <button
          type="button"
          onClick={() => {
            haptic("light");
            onNavigateDailyGoal();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2 px-3 transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer",
            isDailyGoal
              ? "text-amber-400 font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl transition-all relative",
            isDailyGoal ? "bg-amber-400/20 text-amber-400 shadow-[0_0_12px_-2px_rgba(251,191,36,0.6)]" : "bg-transparent"
          )}>
            <Target className="h-[18px] w-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 text-[0.58rem] font-bold text-black px-1 font-mono">
              {progressPct}%
            </span>
          </div>
          <span className="text-[0.65rem] uppercase tracking-wide font-semibold">Goal</span>
        </button>

        {/* Tab 4: More / Quick Tools */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            haptic("medium");
            onOpenMoreSheet();
          }}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2 px-3 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer relative z-10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-transparent hover:bg-white/[0.08]">
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[0.65rem] uppercase tracking-wide font-semibold">Tools</span>
        </button>
      </nav>
    </div>
  );
}
