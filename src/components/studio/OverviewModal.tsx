import React from 'react';
import { X, Flame, Award, Clock, BookOpen, BarChart2, CheckCircle2, TrendingUp } from 'lucide-react';
import { COURSES_DATA } from '../../data/coursesData';
import { CourseFolder } from '../../types/studio';

interface OverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPomodoro?: () => void;
  onOpenStudyHub?: () => void;
  courses?: CourseFolder[];
  course?: CourseFolder | null;
}

export const OverviewModal: React.FC<OverviewModalProps> = ({
  isOpen,
  onClose,
  onOpenPomodoro,
  onOpenStudyHub,
  courses = COURSES_DATA,
  course = null,
}) => {
  if (!isOpen) return null;

  const courseNotes = course?.notes || [];
  const totalNotes = course
    ? (course.noteCount || courseNotes.length || 0)
    : courses.reduce((acc, c) => acc + (c.noteCount || c.notes?.length || 0), 0);

  const uniqueCourseTags = course ? new Set(courseNotes.flatMap((n) => n.tags || [])).size : 0;
  const totalEstMinutes = courseNotes.reduce((acc, n) => {
    const mins = parseInt(n.readTime || '0', 10) || 0;
    return acc + mins;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="overview-modal-content"
        className="relative w-full max-w-3xl rounded-3xl border border-white/20 shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.55) 0%, rgba(13, 17, 35, 0.7) 100%)',
          boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {course ? `${course.title} Overview` : 'Study Tools & Progress'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {course
                  ? `Course statistics, progress and syllabus milestones for ${course.code} #${course.number}`
                  : 'Holistic overview of your learning velocity'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0 cursor-pointer"
            aria-label="Close overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                <BookOpen className="w-4 h-4" /> {course ? 'Course Notes' : 'Total Notes'}
              </div>
              <p className="text-2xl font-bold text-white">{totalNotes}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {course
                  ? uniqueCourseTags > 0
                    ? `${uniqueCourseTags} topic ${uniqueCourseTags === 1 ? 'collection' : 'collections'}`
                    : 'Verified lecture notes'
                  : `Across ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                {course ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <Flame className="w-4 h-4" />}
                <span>{course ? 'Course Progress' : 'Daily Streak'}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {course ? `${course.progress}%` : '5 Days'}
              </p>
              <p className="text-[11px] text-emerald-400 font-medium truncate">
                {course
                  ? course.progress >= 80
                    ? 'Mastery phase'
                    : course.progress >= 50
                    ? 'Intermediate phase'
                    : `${100 - course.progress}% remaining`
                  : '+2 days from last week'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                <Clock className="w-4 h-4" /> {course ? 'Est. Reading' : 'Study Hours'}
              </div>
              <p className="text-2xl font-bold text-white">
                {course ? (totalEstMinutes > 0 ? `${totalEstMinutes} mins` : '—') : '34.5 hrs'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {course
                  ? totalEstMinutes > 0
                    ? `Across ${courseNotes.length} lecture topics`
                    : 'No reading-time data'
                  : 'This month'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Award className="w-4 h-4" /> {course ? 'Instructor' : 'Mastery Level'}
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white truncate" title={course?.instructor || undefined}>
                {course ? (course.instructor || 'Faculty Staff') : 'Advanced'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {course ? `Code: ${course.code} #${course.number}` : 'Top 5% cohort'}
              </p>
            </div>
          </div>

          {/* Course Mastery Progress Bars / Modules */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                {course ? `${course.title} Syllabus & Progress` : 'Active Course Mastery'}
              </h3>
              <span className="text-xs text-slate-400">
                {course ? `${courseNotes.length} lecture modules` : 'Calculated by quiz & notes retention'}
              </span>
            </div>

            {course ? (
              <div className="space-y-4">
                {/* Overall Course Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-white flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-cyan-400 shrink-0">{course.code} #{course.number}</span>
                      <span className="truncate">{course.title} Completion</span>
                    </span>
                    <span className="text-emerald-300 font-bold font-mono shrink-0">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: course.color || '#10b981',
                        boxShadow: `0 0 10px ${course.color || '#10b981'}80`,
                      }}
                    />
                  </div>
                </div>

                {/* Module / Lecture list */}
                {courseNotes.length > 0 ? (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Syllabus Modules & Lecture Progress
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {courseNotes.map((note, idx) => {
                        const isCompleted = idx < Math.ceil((course.progress / 100) * courseNotes.length);
                        return (
                          <div
                            key={note.id || idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-white truncate">{note.title}</p>
                                <p className="text-[11px] text-slate-400 truncate">{note.summary}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                              {note.readTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-400">
                    No lecture notes recorded yet for this course. Start study sessions or add notes from the course hub.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-medium text-white flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-slate-400 shrink-0">{c.number}</span>
                        <span className="truncate">{c.title}</span>
                      </span>
                      <span className="text-slate-300 font-semibold shrink-0">{c.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${c.progress}%`,
                          backgroundColor: c.color,
                          boxShadow: `0 0 10px ${c.color}80`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Tools Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                onClose();
                onOpenStudyHub?.();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-400/30 hover:border-blue-400/60 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
                  <BookOpen className="w-4 h-4" /> {course ? `${course.code} Study Hub` : 'Study Hub'}
                </div>
                <p className="text-sm font-bold text-white">
                  {course ? `${course.title} Lectures` : 'Video Lectures'}
                </p>
                <p className="text-xs text-slate-400">
                  {course ? `${courseNotes.length} modules ready for review` : 'Recorded modules available'}
                </p>
              </div>
              <span className="px-3 py-1 text-xs rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Open →
              </span>
            </div>

            <div
              onClick={() => {
                onClose();
                onOpenPomodoro?.();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-400/30 hover:border-purple-400/60 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold">
                  <Clock className="w-4 h-4" /> Focus Timer
                </div>
                <p className="text-sm font-bold text-white">
                  {course ? `${course.code} Study Session` : '25-minute Pomodoro'}
                </p>
                <p className="text-xs text-slate-400">
                  {course ? `Concentration timer for ${course.title}` : 'Boost cognitive concentration'}
                </p>
              </div>
              <span className="px-3 py-1 text-xs rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Launch →
              </span>
            </div>
          </div>

          {/* Weekly Learning Habits Checklist */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {course ? `${course.code} Learning Milestones` : 'Weekly Learning Goals'}
            </h4>
            <div className="space-y-2 text-xs">
              {course ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Complete {course.title} lecture practice problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Review syllabus topics & concepts with {course.instructor || 'instructor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 rounded-full border border-slate-500" />
                    <span>Complete a 25-minute focused study session on {course.code}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Complete CS50 Python Lecture 2 & Practice Problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Review Mobile Application Skia Shader architecture notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 rounded-full border border-slate-500" />
                    <span>Publish 2 technical summaries to Web Development & Three.js</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
