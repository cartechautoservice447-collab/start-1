import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen,
  History,
  Timer,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  BarChart3,
  Activity,
  Clock,
  Sliders,
  Check,
  Palette,
  Eye,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Plus,
  GraduationCap,
  FolderPlus,
  User,
  Trash2,
} from 'lucide-react';
import { COURSES_DATA } from '../../data/coursesData';
import { CourseFolder, PerformanceMode } from '../../types/studio';
import {
  SHOWCASE_TEMPLATES,
  CLASSIC_TEMPLATES,
  ALL_TEMPLATES,
  BgTemplate,
  isOrbScene,
  isDarkOrbScene,
  isWhiteOrbScene,
  DEEP_BLACK_ORBS_URL,
  STUDIO_WHITE_ORBS_URL,
} from '../../data/backgroundTemplates';
import { StudioHeader } from './StudioHeader';
import { StudioBottomDock, DockTab } from './StudioBottomDock';
import { PomodoroModal } from './PomodoroModal';
import { StudyHubModal } from './StudyHubModal';
import { OverviewModal } from './OverviewModal';
import { CourseDetailModal } from './CourseDetailModal';
import { AiAssistantModal } from './AiAssistantModal';
import { AddCourseModal } from './AddCourseModal';
import { StudioWebGLBackground, GlassBoxDescriptor } from './StudioWebGLBackground';

// Dedicated localStorage key for persisting user-created courses
const CREATED_COURSES_STORAGE_KEY = 'liquid-glass-studio-created-courses';

const isValidCourseFolder = (item: unknown): item is CourseFolder => {
  if (!item || typeof item !== 'object') return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    c.id.length > 0 &&
    typeof c.title === 'string' &&
    typeof c.number === 'string' &&
    typeof c.instructor === 'string' &&
    typeof c.description === 'string' &&
    typeof c.color === 'string' &&
    typeof c.progress === 'number' &&
    typeof c.noteCount === 'number' &&
    Array.isArray(c.notes)
  );
};

const loadPersistedCreatedCourses = (): CourseFolder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREATED_COURSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const builtInIds = new Set(COURSES_DATA.map((c) => c.id));
    return parsed.filter((item): item is CourseFolder => isValidCourseFolder(item) && !builtInIds.has(item.id));
  } catch {
    return [];
  }
};

const savePersistedCreatedCourses = (coursesToSave: CourseFolder[]) => {
  if (typeof window === 'undefined') return;
  try {
    const builtInIds = new Set(COURSES_DATA.map((c) => c.id));
    const onlyUserCreated = coursesToSave.filter((c) => !builtInIds.has(c.id));
    localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(onlyUserCreated));
  } catch (err) {
    console.warn('Failed to save created courses to localStorage:', err);
  }
};

export interface StudioViewProps {
  currentBg: string;
  allTemplates?: BgTemplate[];
  onSelectBg?: (url: string) => void;
  glParams?: {
    thick?: number;
    bezel?: number;
    ior?: number;
    blur?: number;
    spec?: number;
    tint?: number;
    shadow?: number;
    dispersion?: number;
  };
  onReturnToClassic: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  currentBg,
  allTemplates = ALL_TEMPLATES,
  onSelectBg,
  glParams,
  onReturnToClassic,
}) => {
  // Performance mode state with localStorage persistence
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(() => {
    try {
      return (localStorage.getItem('liquid-glass-performance-mode') as PerformanceMode) || 'ultra';
    } catch {
      return 'ultra';
    }
  });

  const [activeTab, setActiveTab] = useState<DockTab>('home');

  // Modals state
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isStudyHubOpen, setIsStudyHubOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseFolder | null>(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  // User-created courses with localStorage persistence
  const [createdCourses, setCreatedCourses] = useState<CourseFolder[]>(() => {
    return loadPersistedCreatedCourses();
  });

  // Reconstruct full course list: user-created courses + built-in COURSES_DATA
  const courses = useMemo(() => {
    return [...createdCourses, ...COURSES_DATA];
  }, [createdCourses]);

  const userCreatedCourseIds = useMemo(() => {
    return createdCourses.map((c) => c.id);
  }, [createdCourses]);

  const handleAddNewCourse = (newCourse: CourseFolder) => {
    setCreatedCourses((prev) => {
      const next = [newCourse, ...prev.filter((c) => c.id !== newCourse.id)];
      savePersistedCreatedCourses(next);
      return next;
    });
  };

  const handleDeleteCreatedCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Built-in courses cannot be deleted
    const builtInIds = new Set(COURSES_DATA.map((c) => c.id));
    if (builtInIds.has(courseId)) return;

    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
    }

    setCreatedCourses((prev) => {
      const next = prev.filter((c) => c.id !== courseId);
      savePersistedCreatedCourses(next);
      return next;
    });
  };

  // Settings & Profile
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Optical tuning states for WebGL shader
  const [ior, setIor] = useState(glParams?.ior ?? 3.0);
  const [dispersion, setDispersion] = useState(glParams?.dispersion ?? 1.9);
  const [bezel, setBezel] = useState(glParams?.bezel ?? 55);
  const [blur, setBlur] = useState(glParams?.blur ?? 1.5);
  const [specular, setSpecular] = useState(glParams?.spec ?? 0.55);

  // Detect if current background is light/white to optimize contrast
  const isLightBg =
    isWhiteOrbScene(currentBg) ||
    currentBg.includes('1600585154340') ||
    currentBg.toLowerCase().includes('white') ||
    currentBg.includes('studio-white');

  // Refs for tracking card element coordinates during vertical scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const showcaseBarRef = useRef<HTMLDivElement>(null);
  const toolCard1Ref = useRef<HTMLDivElement>(null);
  const toolCard2Ref = useRef<HTMLDivElement>(null);
  const toolCard3Ref = useRef<HTMLDivElement>(null);
  const workspaceCardRef = useRef<HTMLDivElement>(null);
  const analyticsCardRef = useRef<HTMLDivElement>(null);
  const timelineCardRef = useRef<HTMLDivElement>(null);
  const addNewCourseBarRef = useRef<HTMLDivElement>(null);
  const createdCoursesSectionRef = useRef<HTMLDivElement>(null);
  const opticsCardRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLElement>(null);

  // Persist performance mode
  const handleTogglePerformance = (mode: PerformanceMode) => {
    setPerformanceMode(mode);
    try {
      localStorage.setItem('liquid-glass-performance-mode', mode);
    } catch {}
  };

  // Cached bounding box descriptors for WebGL multi-box exact liquid glass shader
  const cachedBoxesRef = useRef<GlassBoxDescriptor[]>([]);
  const isGeometryDirtyRef = useRef<boolean>(true);
  const lastScrollTopRef = useRef<number>(-1);
  const lastScrollLeftRef = useRef<number>(-1);
  const lastWinScrollYRef = useRef<number>(-1);
  const lastWinScrollXRef = useRef<number>(-1);

  // Recalculates cached bounding boxes for visible elements in the viewport.
  // Called ONLY on mount, scroll, resize, ResizeObserver size changes, or relevant layout state changes.
  const measureAndCacheBoxes = useCallback(() => {
    const list: GlassBoxDescriptor[] = [];
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;

    const pushBox = (id: string, el: HTMLElement | null, r: number, bezelRadius: number = 45) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      // Only pass boxes that are inside or near the viewport (-100 to window.innerHeight + 100)
      if (rect.bottom < -100 || rect.top > winHeight + 100) {
        return;
      }

      list.push({
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
        r,
        bezel: bezelRadius,
      });
    };

    const pushBoxById = (id: string, r: number, bezelRadius: number = 45) => {
      const el = document.getElementById(id);
      if (el) pushBox(id, el, r, bezelRadius);
    };

    pushBox('banner', bannerRef.current, 36, 55);
    pushBox('showcase', showcaseBarRef.current, 44, 55);
    pushBox('tool1', toolCard1Ref.current, 36, 45);
    pushBox('tool2', toolCard2Ref.current, 36, 45);
    pushBox('tool3', toolCard3Ref.current, 36, 45);
    pushBox('workspace', workspaceCardRef.current, 38, 55);
    pushBox('analytics', analyticsCardRef.current, 38, 55);
    pushBox('timeline', timelineCardRef.current, 38, 55);
    pushBox('add-course-bar', addNewCourseBarRef.current, 56, 75);
    pushBox('created-courses-section', createdCoursesSectionRef.current, 52, 70);
    pushBox('optics', opticsCardRef.current, 38, 55);
    pushBox('dock', dockRef.current, 56, 65);

    // Register active Modals as Liquid Glass surfaces
    pushBoxById('settings-modal-content', 36, 55);
    pushBoxById('profile-modal-content', 36, 55);
    pushBoxById('pomodoro-modal-content', 64, 65);
    pushBoxById('study-hub-modal-content', 36, 55);
    pushBoxById('overview-modal-content', 36, 55);
    pushBoxById('course-detail-modal-content', 48, 60);
    pushBoxById('course-info-glass-card', 32, 45);
    pushBoxById('course-progress-glass-panel', 28, 40);
    pushBoxById('course-tool-01-glass-card', 28, 42);
    pushBoxById('course-tool-02-glass-card', 28, 42);
    pushBoxById('course-tool-03-glass-card', 28, 42);
    pushBoxById('course-tool-04-glass-card', 28, 42);
    pushBoxById('add-course-modal-content', 64, 65);
    pushBoxById('ai-assistant-modal-content', 36, 55);

    cachedBoxesRef.current = list;
    isGeometryDirtyRef.current = false;

    // Record last scroll positions for zero-overhead change detection
    if (containerRef.current) {
      lastScrollTopRef.current = containerRef.current.scrollTop;
      lastScrollLeftRef.current = containerRef.current.scrollLeft;
    }
    if (typeof window !== 'undefined') {
      lastWinScrollYRef.current = window.scrollY;
      lastWinScrollXRef.current = window.scrollX;
    }
  }, []);

  // Set up listeners and observers for geometry cache updates
  useEffect(() => {
    // Initial measurement on mount
    measureAndCacheBoxes();

    // Additional rAF measurement after mount to ensure layout is settled and painted
    const rafId = requestAnimationFrame(() => {
      measureAndCacheBoxes();
    });

    const scrollContainer = containerRef.current;
    const handleScroll = () => {
      measureAndCacheBoxes();
    };

    const handleResize = () => {
      measureAndCacheBoxes();
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Observe size changes of tracked elements with ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureAndCacheBoxes();
      });

      const elementsToObserve = [
        scrollContainer,
        bannerRef.current,
        showcaseBarRef.current,
        toolCard1Ref.current,
        toolCard2Ref.current,
        toolCard3Ref.current,
        workspaceCardRef.current,
        analyticsCardRef.current,
        timelineCardRef.current,
        addNewCourseBarRef.current,
        createdCoursesSectionRef.current,
        opticsCardRef.current,
        dockRef.current,
        document.getElementById('course-detail-modal-content'),
      ];

      elementsToObserve.forEach((el) => {
        if (el) resizeObserver!.observe(el);
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [measureAndCacheBoxes]);

  // Global Escape key listener to close topmost active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAiModalOpen) {
          setIsAiModalOpen(false);
        } else if (profileOpen) {
          setProfileOpen(false);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        } else if (isAddCourseModalOpen) {
          setIsAddCourseModalOpen(false);
        } else if (selectedCourse) {
          setSelectedCourse(null);
        } else if (isStudyHubOpen) {
          setIsStudyHubOpen(false);
        } else if (isPomodoroOpen) {
          setIsPomodoroOpen(false);
        } else if (isOverviewOpen) {
          setIsOverviewOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isAiModalOpen,
    profileOpen,
    settingsOpen,
    isAddCourseModalOpen,
    selectedCourse,
    isStudyHubOpen,
    isPomodoroOpen,
    isOverviewOpen,
  ]);

  // Recalculate geometry when relevant layout state changes
  useEffect(() => {
    measureAndCacheBoxes();
    const rafId = requestAnimationFrame(() => {
      measureAndCacheBoxes();
    });
    return () => cancelAnimationFrame(rafId);
  }, [
    courses,
    activeTab,
    currentBg,
    isLightBg,
    userCreatedCourseIds,
    isPomodoroOpen,
    isStudyHubOpen,
    isOverviewOpen,
    isAiModalOpen,
    isAddCourseModalOpen,
    settingsOpen,
    profileOpen,
    selectedCourse,
    measureAndCacheBoxes
  ]);

  // Consumer for WebGL render loop: returns cached boxes without calling getBoundingClientRect()
  const getBoxDescriptors = useCallback((): GlassBoxDescriptor[] => {
    const curTop = containerRef.current ? containerRef.current.scrollTop : 0;
    const curLeft = containerRef.current ? containerRef.current.scrollLeft : 0;
    const curWinY = typeof window !== 'undefined' ? window.scrollY : 0;
    const curWinX = typeof window !== 'undefined' ? window.scrollX : 0;

    if (
      isGeometryDirtyRef.current ||
      cachedBoxesRef.current.length === 0 ||
      curTop !== lastScrollTopRef.current ||
      curLeft !== lastScrollLeftRef.current ||
      curWinY !== lastWinScrollYRef.current ||
      curWinX !== lastWinScrollXRef.current
    ) {
      measureAndCacheBoxes();
    }

    return cachedBoxesRef.current;
  }, [measureAndCacheBoxes]);

  // Theme toggle between White and Dark 3D orb scenes without altering shaders
  const handleToggleTheme = useCallback(() => {
    if (onSelectBg) {
      onSelectBg(isLightBg ? DEEP_BLACK_ORBS_URL : STUDIO_WHITE_ORBS_URL);
    }
  }, [isLightBg, onSelectBg]);

  // Return to Classic with complete modal cleanup
  const handleReturnToClassic = useCallback(() => {
    setIsPomodoroOpen(false);
    setIsStudyHubOpen(false);
    setIsOverviewOpen(false);
    setIsAiModalOpen(false);
    setSelectedCourse(null);
    setIsAddCourseModalOpen(false);
    setSettingsOpen(false);
    setProfileOpen(false);
    setActiveTab('home');
    onReturnToClassic();
  }, [onReturnToClassic]);

  const handleSelectTab = useCallback(
    (tab: DockTab) => {
      setActiveTab(tab);
      if (tab === 'home') {
        // Return to the normal Studio dashboard
        setSelectedCourse(null);
        setIsOverviewOpen(false);
        setIsAiModalOpen(false);
        setIsPomodoroOpen(false);
        setIsStudyHubOpen(false);
        setIsAddCourseModalOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (tab === 'courses') {
        // Close other overlays and open course details
        setIsOverviewOpen(false);
        setIsAiModalOpen(false);
        setIsPomodoroOpen(false);
        setIsStudyHubOpen(false);
        setIsAddCourseModalOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
        setSelectedCourse(courses[0] || COURSES_DATA[0]);
      } else if (tab === 'collections') {
        // Close other overlays and open Overview
        setSelectedCourse(null);
        setIsAiModalOpen(false);
        setIsPomodoroOpen(false);
        setIsStudyHubOpen(false);
        setIsAddCourseModalOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
        setIsOverviewOpen(true);
      } else if (tab === 'notes') {
        // Close other overlays and open Course Notes
        setIsOverviewOpen(false);
        setIsAiModalOpen(false);
        setIsPomodoroOpen(false);
        setIsStudyHubOpen(false);
        setIsAddCourseModalOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
        setSelectedCourse(courses[0] || COURSES_DATA[0]);
      } else if (tab === 'more') {
        // Close other overlays and open AI Studio Assistant
        setSelectedCourse(null);
        setIsOverviewOpen(false);
        setIsPomodoroOpen(false);
        setIsStudyHubOpen(false);
        setIsAddCourseModalOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
        setIsAiModalOpen(true);
      }
    },
    [courses]
  );

  // Glass card styles optimized for both dark and white backgrounds
  const glassCardStyle = {
    background: isLightBg ? 'rgba(15, 20, 38, 0.55)' : 'rgba(255, 255, 255, 0.035)',
    border: isLightBg ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: isLightBg
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)'
      : '0 25px 50px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
  };

  return (
    <div
      ref={containerRef}
      id="studio-view-root"
      className="relative w-full h-full overflow-y-auto overflow-x-hidden text-white font-sans select-none scroll-smooth"
    >
      {/* 1. Exact Background Image matching Main Interface */}
      <div
        id="studio-bg"
        className="fixed inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={
          isDarkOrbScene(currentBg)
            ? {
                background: '#000000',
                zIndex: 0,
              }
            : isWhiteOrbScene(currentBg)
            ? {
                background: '#ffffff',
                zIndex: 0,
              }
            : {
                backgroundImage: `url('${currentBg}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
              }
        }
      />

      {/* 2. Real WebGL Physical Liquid Glass Compositor (Exact Main Interface Shader) */}
      <StudioWebGLBackground
        currentBg={currentBg}
        getBoxes={getBoxDescriptors}
        glParams={{
          thick: glParams?.thick ?? 50,
          bezel: bezel,
          ior: ior,
          blur: blur,
          spec: specular,
          tint: glParams?.tint ?? 0.08,
          shadow: glParams?.shadow ?? 0.5,
          dispersion: dispersion,
        }}
        performanceMode={performanceMode}
      />

      {/* 3. Main Studio View Content Container - Deep Vertically Scrollable Workspace */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-52 space-y-12 md:space-y-16 pointer-events-auto">
        {/* Top Welcome Banner */}
        <div ref={bannerRef}>
          <StudioHeader
            performanceMode={performanceMode}
            onTogglePerformance={handleTogglePerformance}
            onReturnToClassic={handleReturnToClassic}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenAiSparkle={() => setIsAiModalOpen(true)}
            onToggleTheme={handleToggleTheme}
            isDarkTheme={!isLightBg}
          />
        </div>

        {/* LIQUID GLASS SHOWCASE BACKGROUNDS QUICK-SWITCHER */}
        <section aria-label="Liquid Glass Background Showcase" className="space-y-3">
          <div className="flex items-center justify-between px-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-300 drop-shadow-sm">
                WebGL Liquid Glass Showcase Backgrounds
              </h2>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
            >
              <Palette className="w-3.5 h-3.5" /> All Backgrounds
            </button>
          </div>

          {/* Floating Glass Showcase Bar - Increased Horizontal Size & Curve */}
          <div
            ref={showcaseBarRef}
            id="liquid-glass-showcase-bar"
            className="rounded-[44px] sm:rounded-[52px] p-4 sm:p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xl transition-all"
            style={glassCardStyle}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              {SHOWCASE_TEMPLATES.map((tmpl) => {
                const isActive = currentBg === tmpl.url;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onSelectBg && onSelectBg(tmpl.url)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[20px] text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/25 text-white border border-white/40 shadow-lg scale-[1.02]'
                        : 'bg-white/5 text-slate-200 hover:bg-white/15 border border-white/10'
                    }`}
                    title={tmpl.description}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                      style={{
                        backgroundImage: `url('${tmpl.thumb}')`,
                        backgroundSize: 'cover',
                      }}
                    />
                    <span>{tmpl.label}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        tmpl.category === 'white'
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                          : tmpl.category === 'dark'
                          ? 'bg-purple-400/20 text-purple-200 border border-purple-300/30'
                          : 'bg-cyan-400/20 text-cyan-200 border border-cyan-300/30'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-cyan-300 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-[11px] text-slate-200 font-medium">Real-time Snell's Refraction</span>
            </div>
          </div>
        </section>

        {/* STUDY TOOLS Section */}
        <section aria-label="Study Tools" className="space-y-4">
          <div className="space-y-1 px-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300 drop-shadow-sm">
              Study Tools & Modular Launchers
            </h2>
            <p className="text-xs text-slate-300/80">
              Access your interactive course notes, progress tracking, and Pomodoro focus modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Action Card 1: Study Hub */}
            <div
              ref={toolCard1Ref}
              id="card-study-hub"
              onClick={() => setIsStudyHubOpen(true)}
              className="group relative rounded-[32px] p-6 sm:p-7 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] shadow-xl"
              style={glassCardStyle}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[32px]" />

              <div className="flex items-center gap-4.5 min-w-0">
                <div className="w-14 h-14 rounded-[22px] flex items-center justify-center bg-blue-500/20 border border-blue-400/30 text-blue-300 shadow-inner group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-white tracking-tight group-hover:text-blue-200 transition-colors truncate">
                    Study Hub
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate">CS50 lectures & curriculum</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1.5 transition-all mr-1 shrink-0" />
            </div>

            {/* Action Card 2: Overview */}
            <div
              ref={toolCard2Ref}
              id="card-overview"
              onClick={() => {
                setSelectedCourse(null);
                setIsOverviewOpen(true);
              }}
              className="group relative rounded-[32px] p-6 sm:p-7 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] shadow-xl"
              style={glassCardStyle}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[32px]" />

              <div className="flex items-center gap-4.5 min-w-0">
                <div className="w-14 h-14 rounded-[22px] flex items-center justify-center bg-purple-500/20 border border-purple-400/30 text-purple-300 shadow-inner group-hover:bg-purple-500/30 transition-colors flex-shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-white tracking-tight group-hover:text-purple-200 transition-colors truncate">
                    Overview
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate">All study tools and progress</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1.5 transition-all mr-1 shrink-0" />
            </div>

            {/* Action Card 3: Pomodoro */}
            <div
              ref={toolCard3Ref}
              id="card-pomodoro"
              onClick={() => setIsPomodoroOpen(true)}
              className="group relative rounded-[32px] p-6 sm:p-7 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] shadow-xl"
              style={glassCardStyle}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[32px]" />

              <div className="flex items-center gap-4.5 min-w-0">
                <div className="w-14 h-14 rounded-[22px] flex items-center justify-center bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-inner group-hover:bg-cyan-500/30 transition-colors flex-shrink-0">
                  <Timer className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-white tracking-tight group-hover:text-cyan-200 transition-colors truncate">
                    Pomodoro
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate">Focus timer & intervals</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1.5 transition-all mr-1 shrink-0" />
            </div>
          </div>
        </section>

        {/* YOUR COURSES & COURSE FOLDERS HEADER */}
        <section aria-label="Course Folders" className="space-y-4">
          <div className="space-y-1 px-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300 drop-shadow-sm">
              Your Courses
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                <span className="text-base font-extrabold uppercase tracking-widest text-white drop-shadow-sm">
                  Course Folders & Notes Repository
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCourse(COURSES_DATA[0])}
                  className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-300 font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  26 total notes
                </span>
              </div>
            </div>
          </div>

          {/* WORKSPACE ACTIVITY & RECENT NOTES CARD */}
          <div
            ref={workspaceCardRef}
            id="workspace-activity-card"
            className="relative rounded-[36px] p-8 md:p-10 lg:p-12 space-y-7 shadow-2xl transition-all duration-300"
            style={glassCardStyle}
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[36px]" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                  Workspace Activity
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Recent notes
                </h2>
              </div>
              <span className="text-xs text-slate-300 font-medium bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                Active Term 2026
              </span>
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="group relative rounded-[24px] p-5 md:p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="flex items-center gap-4.5">
                    <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-white/10 border border-white/20 text-xs font-mono font-bold text-slate-200 group-hover:text-white group-hover:bg-white/20 transition-all flex-shrink-0 shadow-sm">
                      {course.number}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-base md:text-lg text-white group-hover:text-blue-200 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {course.noteCount} notes · Open course workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-xs font-semibold text-blue-300/80 group-hover:text-blue-200 transition-colors">
                      Open Folder
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: WEEKLY FOCUS & OPTICAL ANALYTICS DASHBOARD */}
        <section
          ref={analyticsCardRef}
          id="workspace-analytics-card"
          className="relative rounded-[36px] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl transition-all duration-300"
          style={glassCardStyle}
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[36px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">
                  Focus Analytics & Optical Telemetry
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Weekly Study Metrics & Pipeline
              </h2>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm">
              60 FPS Physical SDF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
              <span className="text-xs text-slate-300 font-medium">Weekly Study Hours</span>
              <p className="text-3xl font-extrabold text-white tracking-tight">24.5 hrs</p>
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +18% vs last week
              </span>
            </div>

            <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
              <span className="text-xs text-slate-300 font-medium">Focus Streak</span>
              <p className="text-3xl font-extrabold text-white tracking-tight">7 Days</p>
              <span className="text-xs text-purple-300 font-medium">Daily study goal achieved</span>
            </div>

            <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
              <span className="text-xs text-slate-300 font-medium">Pomodoro Sprints</span>
              <p className="text-3xl font-extrabold text-white tracking-tight">32 Done</p>
              <span className="text-xs text-blue-300 font-medium">820 active minutes</span>
            </div>

            <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
              <span className="text-xs text-slate-300 font-medium">Shader Engine</span>
              <p className="text-3xl font-extrabold text-white tracking-tight">WebGL2</p>
              <span className="text-xs text-cyan-300 font-medium">16-Tap Poisson Blur</span>
            </div>
          </div>

          {/* Weekly Hours Bar Chart */}
          <div className="p-7 md:p-8 rounded-[28px] bg-white/5 border border-white/10 space-y-5">
            <div className="flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-100">Weekly Study Distribution</span>
                <p className="text-[11px] text-slate-400">Daily logged concentration hours</p>
              </div>
              <span className="text-slate-300 font-mono bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[11px]">
                Target: 3.5h/day
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3 md:gap-5 items-end h-36 pt-6">
              {[
                { day: 'Mon', hours: 3.2, hPct: '65%' },
                { day: 'Tue', hours: 4.5, hPct: '90%' },
                { day: 'Wed', hours: 2.8, hPct: '55%' },
                { day: 'Thu', hours: 5.1, hPct: '100%' },
                { day: 'Fri', hours: 3.9, hPct: '78%' },
                { day: 'Sat', hours: 2.1, hPct: '42%' },
                { day: 'Sun', hours: 3.0, hPct: '60%' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-blue-500/40 to-cyan-400/80 group-hover:from-blue-400 group-hover:to-cyan-300 transition-all duration-300 relative shadow-sm"
                    style={{ height: item.hPct }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[10px] text-white font-mono whitespace-nowrap transition-opacity pointer-events-none shadow-md">
                      {item.hours}h
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: LECTURE TIMELINE & RESOURCE REPOSITORY */}
        <section
          ref={timelineCardRef}
          id="workspace-timeline-card"
          className="relative rounded-[36px] p-8 md:p-10 lg:p-12 space-y-7 shadow-2xl transition-all duration-300"
          style={glassCardStyle}
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[36px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">
                Lecture Notes Timeline
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Study Sessions & Code References
              </h2>
            </div>
            <span className="self-start sm:self-auto text-xs text-slate-300 font-medium bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              4 recent sessions
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'l1',
                title: 'Python Functions, Scope & Recursive Data Pipelines',
                course: 'CS50 Python · Lecture 03',
                time: '45m ago',
                status: 'Completed',
                tags: ['Algorithms', 'Recursion'],
              },
              {
                id: 'l2',
                title: 'WebGL Fragment Shaders & Optical Snell’s Law Dispersion',
                course: 'Computer Graphics · Module 05',
                time: '2 hours ago',
                status: 'In Progress',
                tags: ['GLSL', 'Ray Marching'],
              },
              {
                id: 'l3',
                title: 'Mobile Reactive State Machines & Compose UI Patterns',
                course: 'Mobile App Architecture · Chapter 04',
                time: 'Yesterday',
                status: 'Reviewed',
                tags: ['Kotlin', 'SwiftUI'],
              },
              {
                id: 'l4',
                title: 'Asynchronous Concurrency & Web Worker Thread Pools',
                course: 'Web Systems · Lecture 08',
                time: '2 days ago',
                status: 'Reference',
                tags: ['Event Loop', 'Threading'],
              },
            ].map((lecture) => (
              <div
                key={lecture.id}
                className="p-6 md:p-7 rounded-[24px] bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/[0.08] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {lecture.status}
                    </span>
                    <span className="text-xs text-slate-400">{lecture.time}</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-blue-200 transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">{lecture.course}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                  {lecture.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/15"
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedCourse(COURSES_DATA[0])}
                    className="ml-2 px-5 py-2.5 rounded-[16px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GLASS VERTICAL GAP AFTER LECTURE NOTES TIMELINE */}
        <div className="flex flex-col items-center justify-center my-8 sm:my-10 pointer-events-none">
          <div className="w-[1px] h-10 sm:h-12 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
          <div className="flex items-center gap-2.5 my-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest font-bold">
              Course Management Station
            </span>
          </div>
          <div className="w-[1px] h-10 sm:h-12 bg-gradient-to-b from-transparent via-white/10 to-white/30" />
        </div>

        {/* ADD NEW COURSE ACTION BAR - INCREASED HORIZONTAL GLASS SIZE & CURVE (EXACT WEBGL LIQUID GLASS, NO INSIDE ANIMATION) */}
        <section
          ref={addNewCourseBarRef}
          id="workspace-add-course-bar"
          className="relative rounded-[40px] sm:rounded-[60px] md:rounded-[68px] p-5 sm:p-9 md:p-11 lg:p-12 min-h-[120px] sm:min-h-[160px] flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 shadow-2xl transition-all duration-300"
          style={glassCardStyle}
        >
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none rounded-t-[68px]" />

          <div className="flex items-center gap-3.5 sm:gap-6 min-w-0">
            <div className="p-3.5 sm:p-5 rounded-[22px] sm:rounded-[34px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-inner flex-shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-9 sm:h-9" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-300">
                  Course Catalog & Enrollments
                </span>
                <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-white/10 text-slate-200 border border-white/15">
                  {courses.length} courses active
                </span>
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Academic Modules & Study Folders
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Manage syllabus records, dynamic lecture notes, and track progress across academic disciplines.
              </p>
            </div>
          </div>

          {/* RIGHT-ALIGNED ADD NEW COURSE BUTTON - INCREASED SIZE & CURVE (EXACT WEBGL LIQUID GLASS, NO INSIDE ANIMATION) */}
          <div className="flex items-center justify-end w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setIsAddCourseModalOpen(true)}
              id="add-new-course-btn"
              className="relative w-full sm:w-auto justify-center px-5 sm:px-8 md:px-11 py-3.5 sm:py-4 md:py-5 rounded-[24px] sm:rounded-[36px] text-xs sm:text-sm md:text-base font-extrabold tracking-wider text-white transition-all duration-200 flex items-center gap-2.5 sm:gap-3 cursor-pointer shadow-xl border border-white/30 hover:border-white/60 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.82) 0%, rgba(6, 182, 212, 0.78) 100%)',
                boxShadow: '0 12px 30px -6px rgba(6, 182, 212, 0.45), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="p-1.5 rounded-xl bg-white/20 text-white flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="uppercase whitespace-nowrap">
                Add New Course
              </span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200 flex-shrink-0" />
            </button>
          </div>
        </section>

        {/* CREATED COURSES DISPLAY CONTAINER - INCREASED SIZE & CURVE */}
        <section
          ref={createdCoursesSectionRef}
          id="workspace-created-courses-card"
          className="relative rounded-[48px] sm:rounded-[60px] md:rounded-[68px] p-8 sm:p-10 md:p-12 space-y-7 shadow-2xl transition-all duration-300"
          style={glassCardStyle}
        >
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none rounded-t-[68px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-300" />
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">
                  Enrolled Course Folders
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {userCreatedCourseIds.length > 0 ? 'Recently Created & Active Courses' : 'Active Course Folders'}
              </h2>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {userCreatedCourseIds.length > 0 && (
                <span className="text-xs text-cyan-300 font-mono bg-cyan-500/15 px-3.5 py-1.5 rounded-full border border-cyan-400/30 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  {userCreatedCourseIds.length} newly created
                </span>
              )}
              <span className="text-xs text-slate-300 font-mono bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                {courses.length} total
              </span>
            </div>
          </div>

          {/* Grid of Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isNewlyCreated = userCreatedCourseIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  className={`group relative overflow-hidden rounded-[32px] sm:rounded-[38px] p-6 sm:p-8 flex flex-col justify-between min-h-[280px] transition-all duration-300 hover:scale-[1.015] border ${
                    isNewlyCreated
                      ? 'bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-white/5 border-cyan-400/40 shadow-[0_12px_35px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                  }`}
                >
                  {isNewlyCreated && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-400/25 border border-cyan-300/50 text-[10px] font-bold text-cyan-100 uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>Newly Added</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-mono font-bold border shadow-sm"
                        style={{
                          backgroundColor: `${course.color}25`,
                          borderColor: `${course.color}50`,
                          color: course.color,
                        }}
                      >
                        {course.number}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {course.noteCount} {course.noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {course.description}
                    </p>

                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${course.progress}%`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isNewlyCreated && (
                        <button
                          onClick={(e) => handleDeleteCreatedCourse(course.id, e)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Remove course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap shadow-sm"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: INTERACTIVE LIQUID GLASS OPTICS TUNING STATION */}
        <section
          ref={opticsCardRef}
          id="workspace-optics-station"
          className="relative rounded-[36px] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl transition-all duration-300"
          style={glassCardStyle}
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-[36px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">
                  Live Liquid Glass Shader Inspector
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Real-time WebGL Optics Calibration
              </h2>
            </div>
            <span className="self-start sm:self-auto text-xs text-slate-300 font-mono bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              Dynamic Uniforms
            </span>
          </div>

          <p className="text-sm text-slate-200/90 leading-relaxed max-w-2xl">
            Fine-tune physical refraction angles, chromatic dispersion delta, rounded border bezels, and jittered depth blur live across all glass cards in your viewport.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pt-2">
            <label className="block space-y-3 p-4 sm:p-6 md:p-7 rounded-[26px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm text-slate-200 font-semibold">
                <span>Index of Refraction (IOR / Snell’s Law)</span>
                <span className="font-mono text-cyan-400 font-bold text-sm sm:text-base">{ior.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="3.0"
                step="0.05"
                value={ior}
                onChange={(e) => setIor(+e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer h-2"
              />
              <p className="text-xs text-slate-300/80 leading-normal">
                Controls the ray deflection angle as light enters and exits the liquid glass surface.
              </p>
            </label>

            <label className="block space-y-3 p-4 sm:p-6 md:p-7 rounded-[26px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm text-slate-200 font-semibold">
                <span>Chromatic Dispersion Delta</span>
                <span className="font-mono text-purple-400 font-bold text-sm sm:text-base">{dispersion.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={dispersion}
                onChange={(e) => setDispersion(+e.target.value)}
                className="w-full accent-purple-400 cursor-pointer h-2"
              />
              <p className="text-xs text-slate-300/80 leading-normal">
                Separates red, green, and blue light wavelengths across the rounded SDF boundary.
              </p>
            </label>

            <label className="block space-y-3 p-4 sm:p-6 md:p-7 rounded-[26px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm text-slate-200 font-semibold">
                <span>Bezel Curvature Radius</span>
                <span className="font-mono text-blue-400 font-bold text-sm sm:text-base">{bezel.toFixed(0)}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="1"
                value={bezel}
                onChange={(e) => setBezel(+e.target.value)}
                className="w-full accent-blue-400 cursor-pointer h-2"
              />
              <p className="text-xs text-slate-300/80 leading-normal">
                Controls the gradient falloff and edge normal curvature of the glass container.
              </p>
            </label>

            <label className="block space-y-3 p-4 sm:p-6 md:p-7 rounded-[26px] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm text-slate-200 font-semibold">
                <span>Poisson Depth Blur</span>
                <span className="font-mono text-emerald-400 font-bold text-sm sm:text-base">{blur.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.2"
                value={blur}
                onChange={(e) => setBlur(+e.target.value)}
                className="w-full accent-emerald-400 cursor-pointer h-2"
              />
              <p className="text-xs text-slate-300/80 leading-normal">
                Controls the 16-tap jittered Poisson sampling radius for depth-of-field diffusion.
              </p>
            </label>
          </div>
        </section>
      </main>

      {/* 4. Fixed Bottom Dock with ref */}
      <StudioBottomDock
        dockRef={dockRef}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onReturnToClassic={handleReturnToClassic}
      />

      <CourseDetailModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onOpenPomodoro={() => {
          setIsPomodoroOpen(true);
        }}
        onOpenOverview={() => {
          setIsOverviewOpen(true);
        }}
      />

      {/* 5. Interactive Modals */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        currentBg={currentBg}
      />

      <StudyHubModal
        isOpen={isStudyHubOpen}
        onClose={() => setIsStudyHubOpen(false)}
      />

      <OverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenStudyHub={() => setIsStudyHubOpen(true)}
        courses={courses}
        course={selectedCourse}
      />

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onConfirm={handleAddNewCourse}
        isLightBg={isLightBg}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* 6. Comprehensive Settings Modal with Background Showcase Gallery */}
      {settingsOpen && (
        <div
          id="settings-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 animate-fade-in"
        >
          <div
            id="settings-modal-content"
            className="w-full max-w-2xl p-8 sm:p-10 rounded-[36px] border border-white/20 text-white space-y-7 max-h-[88vh] overflow-y-auto shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(22, 25, 45, 0.6) 0%, rgba(12, 15, 30, 0.72) 100%)',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 1.5px 0 rgba(255,255,255,0.35)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <div className="space-y-1">
                <h3 className="font-extrabold text-2xl text-white tracking-tight">Studio & Liquid Glass Settings</h3>
                <p className="text-xs sm:text-sm text-slate-300/80">Configure WebGL background showcases and shader parameters</p>
              </div>
              <button
                id="btn-close-settings"
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Background Gallery Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  WebGL Liquid Glass Showcases ({SHOWCASE_TEMPLATES.length} Presets)
                </span>
                <span className="text-xs text-slate-400">Click to preview instantly</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SHOWCASE_TEMPLATES.map((tmpl) => {
                  const isActive = currentBg === tmpl.url;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => onSelectBg && onSelectBg(tmpl.url)}
                      className={`group relative rounded-[20px] p-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-lg scale-[1.01]'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <img
                        src={tmpl.thumb}
                        alt={tmpl.label}
                        className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">{tmpl.label}</h4>
                          {isActive && <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />}
                        </div>
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                            tmpl.category === 'white'
                              ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                              : tmpl.category === 'dark'
                              ? 'bg-purple-400/20 text-purple-200 border border-purple-300/30'
                              : 'bg-cyan-400/20 text-cyan-200 border border-cyan-300/30'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 block mb-3">
                  Classic Environments
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {CLASSIC_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => onSelectBg && onSelectBg(tmpl.url)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        currentBg === tmpl.url
                          ? 'bg-white/25 text-white border border-white/40 shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      <span>{tmpl.label}</span>
                      {currentBg === tmpl.url && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optical Controls */}
            <div className="pt-4 border-t border-white/15 space-y-4">
              <span className="font-bold uppercase tracking-[0.2em] text-slate-300 text-xs block">
                Shader Optics Calibration
              </span>

              <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 space-y-4 text-xs">
                <label className="block space-y-2">
                  <div className="flex justify-between text-slate-200 font-semibold">
                    <span>Index of Refraction (IOR)</span>
                    <span className="font-mono text-cyan-400 font-bold">{ior.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.4"
                    max="3.0"
                    step="0.05"
                    value={ior}
                    onChange={(e) => setIor(+e.target.value)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </label>

                <label className="block space-y-2">
                  <div className="flex justify-between text-slate-200 font-semibold">
                    <span>Chromatic Dispersion</span>
                    <span className="font-mono text-purple-400 font-bold">{dispersion.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={dispersion}
                    onChange={(e) => setDispersion(+e.target.value)}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center text-slate-300 px-1 text-xs">
                <span className="font-medium">GPU Acceleration</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                  Active (WebGL2 Physical SDF)
                </span>
              </div>
            </div>

            <button
              id="btn-apply-settings"
              onClick={() => setSettingsOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-sm tracking-wide cursor-pointer transition-all shadow-lg active:scale-98"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

      {/* 7. User Profile Modal */}
      {profileOpen && (
        <div
          id="profile-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProfileOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 animate-fade-in"
        >
          <div
            id="profile-modal-content"
            className="w-full max-w-lg p-8 sm:p-9 rounded-[36px] border border-white/20 text-white space-y-7 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(25, 28, 48, 0.6) 0%, rgba(15, 18, 35, 0.72) 100%)',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 1.5px 0 rgba(255,255,255,0.35)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">User Account</h3>
              <button
                id="btn-close-profile"
                onClick={() => setProfileOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-extrabold border border-white/25 shadow-xl flex-shrink-0">
                AK
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-lg tracking-tight">Amith Krishna</h4>
                <p className="text-xs sm:text-sm text-slate-300">amithkrishna338@gmail.com</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Pro Scholar
                </span>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-300">
                <span className="font-medium">Active Courses</span>
                <span className="font-bold text-white font-mono">3</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-medium">Total Notes Saved</span>
                <span className="font-bold text-white font-mono">26</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-medium">Total Study Minutes</span>
                <span className="font-bold text-white font-mono">2,070 min</span>
              </div>
            </div>

            <button
              id="btn-confirm-close-profile"
              onClick={() => setProfileOpen(false)}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 font-bold text-xs sm:text-sm cursor-pointer transition-all active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
