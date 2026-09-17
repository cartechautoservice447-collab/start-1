import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Plus, GraduationCap, User, FileText, Hash, Layers, Check } from 'lucide-react';
import { CourseFolder } from '../../types/studio';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newCourse: CourseFolder) => void;
  isLightBg?: boolean;
}

const COLOR_PRESETS = [
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Violet', hex: '#8b5cf6' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Rose', hex: '#f43f5e' },
];

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLightBg = false,
}) => {
  // 5 Fill Boxes State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');

  // Accent Color & Validation
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].hex);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) newErrors.title = true;
    if (!code.trim()) newErrors.code = true;
    if (!number.trim()) newErrors.number = true;
    if (!instructor.trim()) newErrors.instructor = true;
    if (!description.trim()) newErrors.description = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const courseId = `course-${Date.now()}`;
    const cleanCode = code.trim().toUpperCase();
    const cleanNumber = number.trim();

    const newCourse: CourseFolder = {
      id: courseId,
      code: cleanCode,
      number: `${cleanCode} ${cleanNumber}`,
      title: title.trim(),
      instructor: instructor.trim(),
      description: description.trim(),
      progress: Math.floor(Math.random() * 25) + 10,
      noteCount: 1,
      color: selectedColor,
      notes: [
        {
          id: `note-${Date.now()}-1`,
          courseId: courseId,
          title: `Syllabus & Core Objectives: ${title.trim()}`,
          summary: description.trim().slice(0, 160) + '...',
          tags: [cleanCode, 'Syllabus', 'Foundations'],
          lastEdited: 'Just now',
          readTime: '6 min read',
          content: `# ${title.trim()}\n\nInstructor: ${instructor.trim()}\nCourse Code: ${cleanCode} ${cleanNumber}\n\n## Overview\n${description.trim()}\n\n## Core Competencies\n- Mathematical derivations and system specifications\n- Algorithmic implementation and test suites\n- Laboratory assignments and runtime verification`,
          codeSnippet: `// ${cleanCode} ${cleanNumber}: Initial Setup & Architecture Test\nfunction initCourse() {\n  const course = "${title.trim()}";\n  const instructor = "${instructor.trim()}";\n  console.log(\`Course initialized: \${course} under \${instructor}\`);\n  return { active: true, progress: 15 };\n}\ninitCourse();`,
          codeLanguage: 'typescript',
        },
      ],
    };

    onConfirm(newCourse);
    // Reset form
    setTitle('');
    setCode('');
    setNumber('');
    setInstructor('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Liquid Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75"
          />

          {/* Liquid Glass Modal Container - Increased Size & Curve */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            id="add-course-modal-content"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] sm:rounded-[56px] md:rounded-[64px] p-5 sm:p-8 md:p-12 shadow-2xl text-white border border-white/20 z-10"
            style={{
              background: isLightBg
                ? 'linear-gradient(135deg, rgba(20, 25, 45, 0.55) 0%, rgba(12, 16, 32, 0.7) 100%)'
                : 'linear-gradient(135deg, rgba(25, 30, 50, 0.55) 0%, rgba(10, 14, 28, 0.7) 100%)',
              boxShadow: '0 35px 70px -12px rgba(0, 0, 0, 0.75), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Top Gloss Highlight Line */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none rounded-t-[64px]" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                    Course Creator Interface
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Add New Course
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Complete the 5 required fields below to create a real liquid glass course folder.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/15"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form with 5 Fill Boxes */}
            <form onSubmit={handleConfirm} className="space-y-5 pt-6">
              {/* BOX 1: Course Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Box 1: Course Title</span>
                  {errors.title && <span className="text-rose-400 font-normal lowercase">(required)</span>}
                </label>
                <input
                  type="text"
                  id="course-input-title"
                  placeholder="e.g., Quantum Computing & High-Performance Algorithms"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
                  }}
                  className={`w-full px-5 py-3.5 rounded-[24px] bg-white/5 border text-sm text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.title
                      ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                      : 'border-white/15 focus:border-cyan-400 focus:bg-white/10'
                  }`}
                />
              </div>

              {/* 2-Column Row for Box 2 & Box 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BOX 2: Department / Code */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Box 2: Department Code</span>
                    {errors.code && <span className="text-rose-400 font-normal lowercase">(required)</span>}
                  </label>
                  <input
                    type="text"
                    id="course-input-code"
                    placeholder="e.g., CS, EECS, MATH"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errors.code) setErrors((prev) => ({ ...prev, code: false }));
                    }}
                    className={`w-full px-5 py-3.5 rounded-[24px] bg-white/5 border text-sm text-white placeholder-slate-400 focus:outline-none transition-all ${
                      errors.code
                        ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                        : 'border-white/15 focus:border-blue-400 focus:bg-white/10'
                    }`}
                  />
                </div>

                {/* BOX 3: Course Number */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                    <span>Box 3: Course Number</span>
                    {errors.number && <span className="text-rose-400 font-normal lowercase">(required)</span>}
                  </label>
                  <input
                    type="text"
                    id="course-input-number"
                    placeholder="e.g., 285 or 50"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      if (errors.number) setErrors((prev) => ({ ...prev, number: false }));
                    }}
                    className={`w-full px-5 py-3.5 rounded-[24px] bg-white/5 border text-sm text-white placeholder-slate-400 focus:outline-none transition-all ${
                      errors.number
                        ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                        : 'border-white/15 focus:border-purple-400 focus:bg-white/10'
                    }`}
                  />
                </div>
              </div>

              {/* BOX 4: Lead Instructor */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Box 4: Lead Instructor</span>
                  {errors.instructor && <span className="text-rose-400 font-normal lowercase">(required)</span>}
                </label>
                <input
                  type="text"
                  id="course-input-instructor"
                  placeholder="e.g., Prof. Richard Feynman / Dr. Barbara Liskov"
                  value={instructor}
                  onChange={(e) => {
                    setInstructor(e.target.value);
                    if (errors.instructor) setErrors((prev) => ({ ...prev, instructor: false }));
                  }}
                  className={`w-full px-5 py-3.5 rounded-[24px] bg-white/5 border text-sm text-white placeholder-slate-400 focus:outline-none transition-all ${
                    errors.instructor
                      ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                      : 'border-white/15 focus:border-emerald-400 focus:bg-white/10'
                  }`}
                />
              </div>

              {/* BOX 5: Course Description & Syllabus */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Box 5: Course Description</span>
                  {errors.description && <span className="text-rose-400 font-normal lowercase">(required)</span>}
                </label>
                <textarea
                  id="course-input-description"
                  rows={3}
                  placeholder="e.g., Comprehensive study of distributed consensus, quantum gates, error correction codes, and optical hardware benchmarks."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: false }));
                  }}
                  className={`w-full px-5 py-3.5 rounded-[24px] bg-white/5 border text-sm text-white placeholder-slate-400 focus:outline-none resize-none transition-all ${
                    errors.description
                      ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                      : 'border-white/15 focus:border-amber-400 focus:bg-white/10'
                  }`}
                />
              </div>

              {/* Course Color Tag Selection */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Course Glass Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = selectedColor === p.hex;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSelectedColor(p.hex)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/20 border-white text-white shadow-md scale-105'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span>{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 border-t border-white/10 pt-5 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[22px] bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all border border-white/10 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-course-btn"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Confirm & Create Course</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
