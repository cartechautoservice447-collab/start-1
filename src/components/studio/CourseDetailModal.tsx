import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  History,
  Folder,
  Play,
  FileText,
  BookOpen,
  ChevronRight,
  Search,
  Copy,
  Check,
  Calendar,
  Clock,
  Tag,
  X,
  Sparkles,
} from 'lucide-react';
import { CourseFolder, NoteItem } from '../../types/studio';

interface CourseDetailModalProps {
  course: CourseFolder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPomodoro?: () => void;
  onOpenOverview?: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onOpenPomodoro,
  onOpenOverview,
}) => {
  const [activeView, setActiveView] = useState<'hub' | 'notes' | 'collections'>('hub');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(course?.notes[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  // Sync state when course changes or modal opens
  useEffect(() => {
    if (course && course.notes.length > 0) {
      setSelectedNote(course.notes[0]);
    }
    setActiveView('hub');
    setShowHistory(false);
  }, [course, isOpen]);

  // Notify Studio WebGL compositor whenever modal view, history, or note selection changes
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeView, showHistory, isOpen]);

  if (!isOpen || !course) return null;

  const totalNotes = course.noteCount || course.notes.length || 0;
  const collectionsCount =
    course.notes && course.notes.length > 0
      ? new Set(course.notes.flatMap((n) => n.tags)).size || 3
      : 1;

  const getAccentName = (color: string) => {
    const c = color.toLowerCase();
    if (c.includes('10b981') || c.includes('emerald') || c.includes('green')) return 'emerald';
    if (c.includes('06b6d4') || c.includes('cyan')) return 'cyan';
    if (c.includes('3b82f6') || c.includes('blue')) return 'blue';
    if (c.includes('8b5cf6') || c.includes('violet') || c.includes('purple')) return 'violet';
    if (c.includes('f59e0b') || c.includes('amber') || c.includes('yellow')) return 'amber';
    if (c.includes('ec4899') || c.includes('pink')) return 'pink';
    if (c.includes('ef4444') || c.includes('rose') || c.includes('red')) return 'rose';
    return 'emerald';
  };

  const getAccentTagStyle = (accent: string) => {
    switch (accent) {
      case 'cyan':
        return 'text-cyan-300 bg-cyan-500/20 border-cyan-400/30';
      case 'blue':
        return 'text-blue-300 bg-blue-500/20 border-blue-400/30';
      case 'violet':
        return 'text-purple-300 bg-purple-500/20 border-purple-400/30';
      case 'amber':
        return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
      case 'pink':
        return 'text-pink-300 bg-pink-500/20 border-pink-400/30';
      case 'rose':
        return 'text-rose-300 bg-rose-500/20 border-rose-400/30';
      case 'emerald':
      default:
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30';
    }
  };

  const accentName = getAccentName(course.color || '#10b981');

  const filteredNotes = course.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const copyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="course-detail-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-transparent animate-fade-in"
    >
      {/* 1. Large Outer Rounded WebGL Glass Shell */}
      <div
        id="course-detail-modal-content"
        className="relative w-full max-w-6xl xl:max-w-7xl min-h-[660px] lg:min-h-[740px] max-h-[92vh] overflow-y-auto rounded-[36px] sm:rounded-[48px] md:rounded-[56px] p-5 sm:p-8 md:p-10 lg:p-12 text-white border border-white/20 shadow-2xl flex flex-col justify-between"
        style={{
          boxShadow: '0 40px 95px -20px rgba(0, 0, 0, 0.85), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), 0 0 0 9999px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Top Gloss Highlight Line */}
        <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none rounded-t-[56px]" />

        {(activeView === 'hub' || activeView === 'collections') && (
          <>
            {/* Top Container Section */}
            <div className="space-y-6 sm:space-y-7">
              {/* 2. Course Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <button
                    id="btn-course-back"
                    onClick={onClose}
                    className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-all shadow-sm shrink-0"
                    aria-label="Back to dashboard"
                    title="Back to Studio Dashboard"
                  >
                    <ArrowLeft className="w-5 h-5 text-white stroke-[2.2]" />
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                    {course.title}
                  </h1>
                </div>

                <button
                  id="btn-course-history"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0 ${
                    showHistory
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : 'bg-white/10 hover:bg-white/15 active:scale-95 border-white/20 text-white/80 hover:text-white'
                  }`}
                  aria-label="Course activity history"
                  title="Course Activity & Timeline"
                >
                  <History className="w-5 h-5" />
                </button>
              </div>

              {/* History Drawer Popover */}
              {showHistory && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20 shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" /> Course Activity Log
                    </span>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Instructor</span>
                      <span className="font-semibold text-white">{course.instructor || 'Staff'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Course Code</span>
                      <span className="font-semibold text-white font-mono">{course.code} #{course.number}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Total Notes</span>
                      <span className="font-semibold text-emerald-300 font-mono">{totalNotes} verified notes</span>
                    </div>
                  </div>

                  {course.notes.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Recent Activity & Lecture History
                      </p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {course.notes.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setSelectedNote(n);
                              setActiveView('notes');
                              setShowHistory(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs cursor-pointer transition-all"
                          >
                            <span className="text-white font-medium truncate pr-2">{n.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0">{n.lastEdited}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Large Horizontal Course Information Card */}
              <div
                id="course-info-glass-card"
                className="relative w-full rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 md:px-8 md:py-6 border border-white/20 flex items-center justify-between gap-4 transition-all"
                style={{
                  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)',
                }}
              >
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  {/* Rounded Squircle Emerald / Accent Folder Icon */}
                  <div
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-[22px] sm:rounded-[26px] flex items-center justify-center shadow-lg border border-white/30 shrink-0"
                    style={{
                      backgroundColor: course.color || '#10b981',
                      boxShadow: `0 8px 24px -4px ${course.color || '#10b981'}80`,
                    }}
                  >
                    <Folder className="w-8 h-8 text-white fill-white/20" />
                  </div>

                  {/* Course Title & Tag */}
                  <div className="space-y-1.5 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                      {course.title}
                    </h2>
                    <div>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide border inline-block ${getAccentTagStyle(accentName)}`}
                      >
                        {accentName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Count Badge */}
                <div className="shrink-0">
                  <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm text-slate-300 font-mono bg-white/10 border border-white/15 shadow-sm whitespace-nowrap">
                    {totalNotes} notes
                  </span>
                </div>
              </div>

              {/* 4. Progress Panel */}
              <div
                id="course-progress-glass-panel"
                className="relative w-full rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 md:px-8 md:py-5 border border-white/20 mt-5 sm:mt-6 transition-all"
                style={{
                  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.25)',
                }}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-slate-400 tracking-wide">Progress</span>
                  <span className="text-white font-extrabold font-mono text-sm sm:text-base">
                    {course.progress}%
                  </span>
                </div>

                {/* Progress Bar Track & Fill */}
                <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden my-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor: course.color || '#10b981',
                    }}
                  />
                </div>

                {/* Bottom Counts */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{totalNotes} notes</span>
                  <span>{collectionsCount} collections</span>
                </div>
              </div>

              {/* 5. Course tools Header */}
              <div className="flex items-center justify-between mt-8 sm:mt-10 mb-4 sm:mb-5">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] inline-block mr-2.5" />
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    Course tools
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  4 FOLDERS
                </span>
              </div>

              {/* 6. Four Course Tool Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 01: Study Session */}
                <div
                  id="course-tool-01-glass-card"
                  onClick={() => {
                    if (onOpenPomodoro) {
                      onOpenPomodoro();
                    } else {
                      setActiveView('notes');
                    }
                  }}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[30px] sm:rounded-[36px] border border-white/20 hover:border-white/35 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
                  style={{
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 block tracking-wider">
                        01
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-md">
                        <Play className="w-5 h-5 fill-emerald-400/25 text-emerald-300 ml-0.5" />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      Study Session
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300/80 mt-1 leading-relaxed">
                      Start a focused study session for this course.
                    </p>
                  </div>
                </div>

                {/* 02: Collections */}
                <div
                  id="course-tool-02-glass-card"
                  onClick={() => {
                    setActiveView('collections');
                  }}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[30px] sm:rounded-[36px] border border-white/20 hover:border-white/35 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
                  style={{
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400 block tracking-wider">
                        02
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
                        <Folder className="w-5 h-5 fill-cyan-400/25 text-cyan-300" />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      Collections
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300/80 mt-1 leading-relaxed">
                      Organize notes into focused study groups.
                    </p>
                  </div>
                </div>

                {/* 03: All Notes */}
                <div
                  id="course-tool-03-glass-card"
                  onClick={() => setActiveView('notes')}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[30px] sm:rounded-[36px] border border-white/20 hover:border-white/35 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
                  style={{
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 block tracking-wider">
                        03
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-md">
                        <FileText className="w-5 h-5 text-emerald-300" />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      All Notes
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300/80 mt-1 leading-relaxed">
                      Open every note stored in this course.
                    </p>
                  </div>
                </div>

                {/* 04: Course Overview */}
                <div
                  id="course-tool-04-glass-card"
                  onClick={() => {
                    if (onOpenOverview) {
                      onOpenOverview();
                    } else {
                      setShowHistory(true);
                    }
                  }}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[30px] sm:rounded-[36px] border border-white/20 hover:border-white/35 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
                  style={{
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400 block tracking-wider">
                        04
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
                        <BookOpen className="w-5 h-5 text-cyan-300" />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      Course Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300/80 mt-1 leading-relaxed">
                      See this course progress, notes and activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'collections' && (
          <>
            {/* Layer behind Collections to blur the underlying interface */}
            <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[4px] rounded-[36px] sm:rounded-[48px] md:rounded-[56px] pointer-events-auto" />
            
            {/* Collections content container */}
            <div className="absolute inset-0 z-20 flex flex-col p-5 sm:p-8 md:p-10 lg:p-12 pointer-events-none">
              <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in pointer-events-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <button
                onClick={() => setActiveView('hub')}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Course Hub</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {course.title} • {collectionsCount} collections
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl border border-white/10 bg-black/10">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-6">
                Course Collections
              </h2>
              {course.notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Folder className="w-12 h-12 stroke-1 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No collections yet</p>
                  <p className="text-xs mt-1">Create notes with tags to build collections.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from(new Set(course.notes.flatMap((n) => n.tags))).map((tag, i) => {
                    const notesInTag = course.notes.filter(n => n.tags.includes(tag));
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSearchQuery(tag);
                          setActiveView('notes');
                        }}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                            <Folder className="w-5 h-5 fill-cyan-400/20" />
                          </div>
                          <span className="text-xs font-mono text-slate-400 bg-black/30 px-2 py-1 rounded-md">
                            {notesInTag.length} {notesInTag.length === 1 ? 'note' : 'notes'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {tag}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
          </>
        )}

        {activeView === 'notes' && (
          /* Notes Reader View (Preserving Existing Functionality) */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <button
                onClick={() => setActiveView('hub')}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Course Hub</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {course.title} • {course.notes.length} notes
              </span>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-2xl border border-white/10">
              {/* Notes Sidebar */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20 max-h-48 md:max-h-none shrink-0">
                {/* Search */}
                <div className="p-3 border-b border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Search in ${course.title}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Note list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredNotes.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      {course.notes.length === 0 ? 'No notes in this course yet.' : 'No notes matching search.'}
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const isSelected = selectedNote?.id === note.id;
                      return (
                        <button
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-blue-600/30 border border-blue-400/40 text-white'
                              : 'hover:bg-white/5 border border-transparent text-slate-300'
                          }`}
                        >
                          <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-white truncate">{note.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{note.summary}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 mt-1 flex-shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Note Reader Body */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-black/10">
                {selectedNote ? (
                  <>
                    <div className="space-y-3 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Updated {selectedNote.lastEdited}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {selectedNote.readTime} read
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {selectedNote.title}
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        {selectedNote.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedNote.tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-cyan-500/15 border border-cyan-400/25 text-cyan-300 flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                      {selectedNote.content}
                    </div>

                    {selectedNote.codeSnippet && (
                      <div className="rounded-2xl bg-black/60 border border-white/15 overflow-hidden shadow-xl mt-4">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 text-xs text-slate-400">
                          <span className="font-mono uppercase tracking-wider text-cyan-400">
                            {selectedNote.codeLanguage || 'code'}
                          </span>
                          <button
                            onClick={() => copyCode(selectedNote.codeSnippet)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-medium cursor-pointer"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                          <code>{selectedNote.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <FileText className="w-12 h-12 stroke-1 text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-300">
                      {course.notes.length === 0
                        ? `No notes for ${course.title} yet`
                        : 'Select a note from the list to read'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      {course.notes.length === 0
                        ? 'You can run study sessions or track your progress using Course tools.'
                        : 'Review lecture summaries, source code snippets, and study tags.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
