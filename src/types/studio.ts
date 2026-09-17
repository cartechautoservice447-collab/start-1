export type StudioViewMode = 'classic' | 'studio';
export type PerformanceMode = 'high' | 'ultra';

export interface NoteItem {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  tags: string[];
  lastEdited: string;
  readTime: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface CourseFolder {
  id: string;
  code: string;
  number: string;
  title: string;
  noteCount: number;
  instructor: string;
  progress: number;
  description: string;
  color: string;
  notes: NoteItem[];
}

export interface LectureItem {
  id: string;
  lectureNumber: number;
  title: string;
  duration: string;
  topic: string;
  summary: string;
  keyConcepts: string[];
  codeSample?: string;
  completed: boolean;
}

export interface PomodoroState {
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalWorkMinutes: number;
}
