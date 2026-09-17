import React, { useState, useRef, useEffect } from 'react';
import { X, Play, CheckCircle, Clock, BookOpen, Search, Copy, Check } from 'lucide-react';
import { CS50_LECTURES } from '../../data/coursesData';
import { LectureItem } from '../../types/studio';

interface StudyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyHubModal: React.FC<StudyHubModalProps> = ({ isOpen, onClose }) => {
  const [lectures, setLectures] = useState<LectureItem[]>(CS50_LECTURES);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem>(CS50_LECTURES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const filteredLectures = lectures.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleComplete = (id: string) => {
    setLectures((prev) =>
      prev.map((l) => (l.id === id ? { ...l, completed: !l.completed } : l))
    );
    if (selectedLecture.id === id) {
      setSelectedLecture((prev) => ({ ...prev, completed: !prev.completed }));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="study-hub-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/70 animate-fade-in"
    >
      <div
        id="study-hub-modal-content"
        className="relative w-full max-w-5xl h-[90vh] md:h-[88vh] flex flex-col rounded-3xl border border-white/20 shadow-2xl text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.55) 0%, rgba(15, 23, 42, 0.7) 100%)',
          boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  CS50 Python
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">Harvard University</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                Study Hub — Lecture Archive
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Lecture Sidebar List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20 max-h-44 md:max-h-none shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lectures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredLectures.map((lec) => {
                const isSelected = selectedLecture.id === lec.id;
                return (
                  <div
                    key={lec.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedLecture(lec)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedLecture(lec);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/30 border border-blue-400/40 text-white'
                        : 'hover:bg-white/5 border border-transparent text-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(lec.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title={lec.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {lec.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                        <span>Lecture {lec.lectureNumber}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lec.duration}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-white truncate">{lec.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{lec.topic}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lecture Detail / Viewer */}
          <div className="flex-1 flex flex-col overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
            {/* Player Simulation Card */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 flex flex-col justify-between p-3 sm:p-6 shadow-inner">
              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/30 border border-blue-400/40 text-blue-200">
                  Lecture {selectedLecture.lectureNumber} · {selectedLecture.topic}
                </span>
                <span className="text-xs text-slate-300 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  {selectedLecture.duration} HD
                </span>
              </div>

              {/* Centered Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <span className="text-xs font-bold uppercase tracking-wider">Pause</span> : <Play className="w-7 h-7 fill-white ml-1" />}
                </button>
                <span className="mt-3 text-sm font-semibold text-white/90 drop-shadow">
                  {selectedLecture.title}
                </span>
              </div>

              {/* Player Bottom Scrub Bar */}
              <div className="z-10 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/3 rounded-full" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>34:12</span>
                  <span>{selectedLecture.duration}</span>
                </div>
              </div>
            </div>

            {/* Lecture Summary */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-sm font-semibold text-white">Lecture Overview</h3>
              <p className="text-xs leading-relaxed text-slate-300">{selectedLecture.summary}</p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {selectedLecture.keyConcepts.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-500/15 border border-blue-400/20 text-blue-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet */}
            {selectedLecture.codeSample && (
              <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-slate-400">
                  <span>Live Python Code Sample</span>
                  <button
                    onClick={() => copyCode(selectedLecture.codeSample || '')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>{selectedLecture.codeSample}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
