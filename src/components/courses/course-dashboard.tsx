import { useState, useMemo } from "react";
import {
  FolderOpen,
  Folder,
  FileText,
  Plus,
  ArrowRight,
  Settings,
  LogOut,
  Trash2,
  Sparkles,
  BookOpen,
  Search,
  RefreshCw,
  Radio,
  Check,
  UserCheck,
  Star,
  Clock,
  Flame,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { COURSE_ACCENTS, formatDate, type Course, type CourseAccent, type Note } from "@/lib/notes";
import { haptic } from "@/lib/haptics";

const ACCENT_STYLES: Record<
  CourseAccent,
  { bg: string; border: string; text: string; glow: string; dot: string }
> = {
  sky: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    text: "text-sky-400",
    glow: "shadow-[0_0_24px_-6px_rgba(56,189,248,0.7)]",
    dot: "bg-sky-400",
  },
  violet: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-400",
    glow: "shadow-[0_0_24px_-6px_rgba(167,139,250,0.7)]",
    dot: "bg-violet-400",
  },
  amber: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-[0_0_24px_-6px_rgba(251,191,36,0.7)]",
    dot: "bg-amber-400",
  },
  emerald: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-[0_0_24px_-6px_rgba(52,211,153,0.7)]",
    dot: "bg-emerald-400",
  },
  rose: {
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-[0_0_24px_-6px_rgba(251,113,133,0.7)]",
    dot: "bg-rose-400",
  },
  cyan: {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-[0_0_24px_-6px_rgba(34,211,238,0.7)]",
    dot: "bg-cyan-400",
  },
};

type Props = {
  courses: Course[];
  notes: Note[];
  onOpenCourse: (id: string) => void;
  onAddCourse: (name: string, description?: string, color?: CourseAccent, category?: string) => void;
  onDeleteCourse: (id: string) => void;
  onOpenSettings: () => void;
  onOpenMenu?: () => void;
  onQuickNewNote?: () => void;
  onOpenNote?: (noteId: string, courseId?: string) => void;
  onOpenAllNotes?: () => void;
  onOpenFavorites?: () => void;
  onStartFocus?: () => void;
  todayFocusSeconds?: number;
  dailyGoalHours?: number;
  realtimeStatus?: "connected" | "connecting" | "offline";
  isSyncing?: boolean;
  onRefresh?: () => void;
  onOpenAuth?: () => void;
};

export function CourseDashboard({
  courses,
  notes,
  onOpenCourse,
  onAddCourse,
  onDeleteCourse,
  onOpenSettings,
  onOpenMenu,
  onOpenNote,
  onOpenAllNotes,
  onOpenFavorites,
  onStartFocus,
  todayFocusSeconds = 0,
  dailyGoalHours = 2,
  realtimeStatus = "connected",
  isSyncing = false,
  onRefresh,
  onOpenAuth,
}: Props) {
  const { user, signOut } = useAuth();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<CourseAccent>("sky");
  const [category, setCategory] = useState("");
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const meta = user?.user_metadata as { username?: string; full_name?: string } | null;
  const name = meta?.username || meta?.full_name || user?.email?.split("@")[0] || "Student";

  // Feature 7: Time-of-Day Contextual Dynamic Greeting
  const greetingInfo = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: `Good Morning, ${name}!`,
        subtitle: "Ready for your morning study sprint?",
        pill: "Morning Sprint ☀️",
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        greeting: `Good Afternoon, ${name}!`,
        subtitle: "Keep your study momentum going strong.",
        pill: "Deep Focus ⚡",
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        greeting: `Good Evening, ${name}!`,
        subtitle: "Review your key takeaways and active recall.",
        pill: "Evening Review 🌙",
      };
    }
    return {
      greeting: `Night Owl, ${name}!`,
      subtitle: "Late-night deep work and quiet retention.",
      pill: "Night Owl 🦉",
    };
  }, [name]);

  // Feature 1: Top 4 most recently updated notes for "Continue Studying"
  const recentNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  }, [notes]);

  // Focus calculations for Feature 2
  const goalSeconds = Math.max(60, dailyGoalHours * 3600);
  const progressPct = Math.min(100, Math.round((todayFocusSeconds / goalSeconds) * 100));
  const todayMinutes = Math.floor(todayFocusSeconds / 60);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["all", ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [courses, searchQuery, selectedCategory]);

  const submit = () => {
    if (!title.trim()) return;
    haptic("success");
    onAddCourse(title, description, selectedColor, category);
    setTitle("");
    setDescription("");
    setSelectedColor("sky");
    setCategory("");
    setAdding(false);
  };

  const confirmDelete = () => {
    if (!deletingCourse) return;
    haptic("warning");
    onDeleteCourse(deletingCourse.id);
    setDeletingCourse(null);
  };

  const totalNotes = notes.length;
  const favNotes = notes.filter((n) => n.favorite).length;

  return (
    <main className="app-backdrop relative isolate min-h-[100dvh] w-full overflow-x-hidden pb-[calc(7rem+env(safe-area-inset-bottom,0px))] text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/[0.14] blur-[140px]" />
        <div className="absolute top-[26rem] -right-56 h-[38rem] w-[38rem] rounded-full bg-violet-500/[0.09] blur-[140px]" />
        <div className="absolute bottom-0 -left-56 h-[34rem] w-[34rem] rounded-full bg-emerald-500/[0.08] blur-[130px]" />
      </div>
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-8 sm:py-9 lg:px-12 lg:py-12">
        <header className="animate-panel-in mb-7 flex items-center justify-between sm:mb-10">
          <button type="button" aria-label="Open study tools" onClick={() => { haptic("medium"); onOpenMenu?.(); }} className="group flex items-center gap-3 rounded-2xl text-left transition-transform active:scale-[0.98]">
            <span className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-primary/45 bg-gradient-to-br from-primary/45 via-primary/20 to-emerald-500/30 text-primary shadow-[0_0_34px_-4px_hsl(var(--primary)/0.85)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-extrabold tracking-tight text-foreground">NewLumino</span>
              <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Study studio</span>
            </span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" aria-label="Refresh dashboard" onClick={() => onRefresh?.()} className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/35 hover:bg-white/[0.09] hover:text-foreground active:scale-95 sm:flex">
              <RefreshCw className={["h-3.5 w-3.5", isSyncing ? "animate-spin" : ""].join(" ")} /> Sync
            </button>
            <span className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-[0.68rem] font-bold text-muted-foreground">
              <span className={["h-2 w-2 rounded-full", realtimeStatus === "connected" ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]" : realtimeStatus === "connecting" ? "bg-amber-400 animate-pulse" : "bg-white/30"].join(" ")} />
              <span className="hidden sm:inline">{realtimeStatus === "connected" ? "Synced" : realtimeStatus === "connecting" ? "Syncing" : "Offline"}</span>
            </span>
            <button type="button" aria-label="Settings" onClick={onOpenSettings} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-muted-foreground transition-all hover:border-primary/35 hover:bg-white/[0.09] hover:text-foreground active:scale-95"><Settings className="h-4 w-4" /></button>
            {user ? <button type="button" aria-label="Log out" onClick={() => void signOut()} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive active:scale-95 sm:flex"><LogOut className="h-4 w-4" /></button> : null}
          </div>
        </header>

        <section className="animate-panel-in grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.14] bg-white/[0.055] p-6 shadow-[0_32px_85px_-45px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:rounded-[2.5rem] sm:p-9">
            <div aria-hidden="true" className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.7rem] font-extrabold tracking-wide text-primary">{greetingInfo.pill}</span>
              <h1 className="mt-4 max-w-3xl text-[2.15rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-foreground sm:mt-5 sm:text-5xl lg:text-[4rem]">{greetingInfo.greeting}</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{greetingInfo.subtitle}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => { haptic("medium"); onStartFocus?.(); }} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[0_18px_35px_-16px_hsl(var(--primary)/0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-16px_hsl(var(--primary)/0.85)] active:translate-y-0 active:scale-[0.98]"><Zap className="h-4 w-4" />Begin focus session</button>
                <button type="button" onClick={() => onQuickNewNote?.()} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:border-white/25 hover:bg-white/[0.1] active:scale-[0.98]"><Plus className="h-4 w-4" />Quick note</button>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/[0.14] bg-gradient-to-br from-white/[0.09] to-white/[0.025] p-6 shadow-[0_28px_70px_-45px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:p-7">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-400/[0.12] blur-3xl" />
            <div className="relative flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300"><Flame className="h-5 w-5" /></span><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Today</span></div>
            <div className="relative mt-7">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Focus progress</p>
              <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-extrabold tracking-tight text-foreground">{progressPct}%</span><span className="mb-1 text-xs font-semibold text-muted-foreground">{todayMinutes} min logged</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.09]"><div className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)] transition-all duration-700" style={{ width: String(progressPct) + "%" }} /></div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">A {dailyGoalHours}-hour goal, one uninterrupted block at a time.</p>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          <button type="button" onClick={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })} className="group rounded-[1.45rem] border border-white/10 bg-white/[0.045] p-4 text-left shadow-[0_18px_38px_-32px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.075] active:scale-[0.98] sm:p-5"><FolderOpen className="h-5 w-5 text-primary transition-transform group-hover:scale-110" /><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{courses.length}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Active courses</p></button>
          <button type="button" onClick={() => onOpenAllNotes?.()} className="group rounded-[1.45rem] border border-white/10 bg-white/[0.045] p-4 text-left shadow-[0_18px_38px_-32px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1 hover:border-cyan-400/35 hover:bg-white/[0.075] active:scale-[0.98] sm:p-5"><BookOpen className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110" /><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{totalNotes}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Notes captured</p></button>
          <button type="button" onClick={() => onOpenFavorites?.()} className="group rounded-[1.45rem] border border-white/10 bg-white/[0.045] p-4 text-left shadow-[0_18px_38px_-32px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1 hover:border-amber-400/35 hover:bg-white/[0.075] active:scale-[0.98] sm:p-5"><Star className="h-5 w-5 text-amber-300 transition-transform group-hover:scale-110" /><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{favNotes}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Saved favorites</p></button>
          <button type="button" onClick={() => onStartFocus?.()} className="group rounded-[1.45rem] border border-primary/20 bg-primary/[0.08] p-4 text-left shadow-[0_18px_38px_-32px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-primary/[0.13] active:scale-[0.98] sm:p-5"><Clock className="h-5 w-5 text-primary transition-transform group-hover:scale-110" /><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{todayMinutes}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Minutes focused</p></button>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5"><div><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-primary">Pick up where you left off</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Continue studying</h2></div><button type="button" onClick={() => onOpenAllNotes?.()} className="hidden items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-foreground sm:inline-flex">View library <ArrowRight className="h-4 w-4" /></button></div>
          {recentNotes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentNotes.map((note, index) => {
                const course = courses.find((c) => c.id === note.courseId);
                const accent = course ? (ACCENT_STYLES[course.color] ?? ACCENT_STYLES.sky) : ACCENT_STYLES.sky;
                return <button key={note.id} type="button" onClick={() => { haptic("light"); onOpenNote?.(note.id, note.courseId || undefined); }} style={{ animationDelay: String(index * 55) + "ms" }} className="group animate-card-in min-h-[180px] rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 text-left shadow-[0_18px_40px_-32px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.075] active:scale-[0.985]">
                  <div className="flex items-start justify-between gap-3"><span className={["inline-flex max-w-[80%] items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[0.64rem] font-bold", accent.border, accent.bg, accent.text].join(" ")}><span className={["h-1.5 w-1.5 shrink-0 rounded-full", accent.dot].join(" ")} /><span className="truncate">{course?.name || "General"}</span></span>{note.favorite ? <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" /> : null}</div>
                  <div className="mt-5"><h3 className="line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-foreground">{note.title || "Untitled Note"}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{note.body?.replace(/[#*>_-]/g, "").slice(0, 110) || "Add a note to start your study trail."}</p></div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[0.68rem] font-semibold text-muted-foreground"><span>{formatDate(note.updatedAt)}</span><span className="flex items-center gap-1 text-primary">Resume <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></div>
                </button>;
              })}
            </div>
          ) : <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.025] p-8 text-center sm:p-10"><FileText className="mx-auto h-6 w-6 text-muted-foreground/60" /><p className="mt-3 text-sm font-bold text-foreground">Your study trail starts here.</p><button type="button" onClick={() => onQuickNewNote?.()} className="mt-4 text-sm font-extrabold text-primary hover:text-foreground">Create your first note</button></div>}
        </section>

        <section id="library" className="mt-12 scroll-mt-6 sm:mt-16">
          <div className="flex flex-col gap-5 border-b border-white/[0.1] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-primary">Your workspace</p><h2 className="mt-1 text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl">Course library</h2><p className="mt-2 text-sm text-muted-foreground">A focused home for every subject, idea, and project.</p></div><button type="button" onClick={() => { haptic("medium"); setAdding(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-[0_18px_35px_-16px_hsl(var(--primary)/0.7)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"><Plus className="h-4 w-4" />New course</button></div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full max-w-lg"><span className="sr-only">Search courses</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your course library..." className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-foreground shadow-[0_14px_32px_-26px_rgba(0,0,0,0.9)] outline-none transition-all placeholder:text-muted-foreground/55 focus:border-primary/55 focus:bg-white/[0.08]" /></label>
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">{categories.map((cat) => <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={["shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold capitalize transition-all", selectedCategory === cat ? "border-primary/35 bg-primary/15 text-primary shadow-[0_8px_20px_-14px_hsl(var(--primary)/0.9)]" : "border-white/10 bg-white/[0.035] text-muted-foreground hover:border-white/20 hover:bg-white/[0.07] hover:text-foreground"].join(" ")}>{cat}</button>)}</div>
          </div>

          {filteredCourses.length > 0 ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c, index) => {
              const courseNotes = notes.filter((n) => n.courseId === c.id);
              const last = courseNotes.length > 0 ? Math.max(...courseNotes.map((n) => n.updatedAt)) : c.updatedAt || c.createdAt;
              const style = ACCENT_STYLES[c.color] ?? ACCENT_STYLES.sky;
              return <article key={c.id} className="group relative">
                <button type="button" onClick={() => { haptic("light"); onOpenCourse(c.id); }} style={{ animationDelay: String(index * 45) + "ms" }} className="animate-card-in flex min-h-[255px] w-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 text-left shadow-[0_20px_46px_-34px_rgba(0,0,0,0.95)] transition-all hover:-translate-y-1.5 hover:border-primary/35 hover:bg-white/[0.075] hover:shadow-[0_32px_62px_-38px_rgba(0,0,0,1)] active:scale-[0.985]">
                  <div className="flex items-start justify-between gap-3 pr-9"><span className={["flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", style.border, style.bg, style.text, style.glow].join(" ")}><Folder className="h-5 w-5" /></span><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.65rem] font-bold tabular-nums text-muted-foreground"><FileText className="h-3 w-3" />{courseNotes.length} {courseNotes.length === 1 ? "note" : "notes"}</span></div>
                  <div className="mt-5"><h3 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">{c.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.description || "A new space for your focused work and ideas."}</p></div>
                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-4"><span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem] font-bold capitalize", style.border, style.bg, style.text].join(" ")}><span className={["h-1.5 w-1.5 rounded-full", style.dot].join(" ")} />{c.category || c.color}</span><span className="text-xs font-semibold text-muted-foreground">{last ? "Edited " + formatDate(last) : "No notes yet"}</span></div>
                </button>
                <button type="button" aria-label={"Delete " + c.name} onClick={() => setDeletingCourse(c)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-muted-foreground/70 opacity-100 backdrop-blur-md transition-all hover:border-destructive/40 hover:bg-destructive/15 hover:text-destructive active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </article>;
            })}
          </div> : <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.025] p-10 text-center"><FolderOpen className="mx-auto h-7 w-7 text-muted-foreground/55" /><h3 className="mt-4 text-lg font-extrabold text-foreground">No courses found</h3><p className="mt-2 text-sm text-muted-foreground">{searchQuery ? "Try a different search or category." : "Create your first course to organise your notes."}</p><button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setAdding(true); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"><Plus className="h-4 w-4" />Create course</button></div>}
        </section>
      {/* ═══════════════════════════════════════════════════════════════
          New Course Modal — Responsive Bottom Sheet on Mobile / Centered on Desktop
      ═══════════════════════════════════════════════════════════════ */}
      {adding ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-md">
          <div className="glass-panel animate-panel-in w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/15 max-h-[90dvh] overflow-y-auto scroll-sleek pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-7">
            {/* Mobile Drag Indicator Pill */}
            <div className="sm:hidden mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
            
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              New Course Folder
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Creates a synchronized course in the shared backend across NewLumino and Fluid Glass Studio.
            </p>

            <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground/80 mb-1.5 font-semibold">
                  Course Title
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. CS50P — Python, Biology 101, Linear Algebra"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground/80 mb-1.5 font-semibold">
                  Description (optional)
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. Programming in Python, lectures, and active recall notes"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground/80 mb-2 font-semibold">
                  Accent Color
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COURSE_ACCENTS.map((acc) => {
                    const st = ACCENT_STYLES[acc];
                    const isSelected = selectedColor === acc;
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setSelectedColor(acc)}
                        className={`flex items-center sm:flex-col justify-center sm:justify-center gap-2 sm:gap-1.5 rounded-xl border p-2.5 sm:p-2 text-center transition ${
                          isSelected
                            ? `${st.border} ${st.bg} scale-102 sm:scale-105 shadow-md`
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full ${st.dot} flex items-center justify-center shrink-0`}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        <span className="text-[0.68rem] sm:text-[0.6rem] capitalize text-foreground/80 font-medium">
                          {acc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] uppercase tracking-wider text-muted-foreground/80 mb-1.5 font-semibold">
                  Category Tag
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. Programming, Science, Design"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground touch-manipulation cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!title.trim()}
                className="rounded-xl border border-white/10 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal - Responsive Sheet */}
      {deletingCourse ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-md">
          <div className="glass-panel animate-panel-in w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-destructive/20 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Delete &ldquo;{deletingCourse.name}&rdquo;?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This permanently removes this course folder and every note contained inside from the shared cloud database. This will also update Fluid Glass Studio in real time.
            </p>
            <div className="mt-5 sm:mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground touch-manipulation cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl border border-destructive/40 bg-destructive px-5 py-2.5 text-xs font-semibold text-destructive-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
