import React from 'react';
import { Home, LayoutGrid, Folder, FileText, Sparkles, Layers } from 'lucide-react';

export type DockTab = 'home' | 'courses' | 'collections' | 'notes' | 'more';

interface StudioBottomDockProps {
  activeTab: DockTab;
  onSelectTab: (tab: DockTab) => void;
  onReturnToClassic: () => void;
  dockRef?: React.Ref<HTMLElement>;
}

export const StudioBottomDock: React.FC<StudioBottomDockProps> = ({
  activeTab,
  onSelectTab,
  onReturnToClassic,
  dockRef,
}) => {
  return (
    <nav
      ref={dockRef}
      id="studio-bottom-dock"
      aria-label="Studio Navigation Dock"
      className="fixed bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 select-none flex items-center justify-between sm:justify-center gap-0.5 sm:gap-4 p-2 sm:p-3 sm:px-8 rounded-[32px] sm:rounded-[40px] shadow-2xl transition-all duration-300 pointer-events-auto w-[calc(100vw-16px)] sm:w-max max-w-[980px] no-scrollbar"
      style={{
        background: 'rgba(10, 16, 32, 0.68)',
        border: '1.5px solid rgba(255, 255, 255, 0.26)',
        boxShadow:
          '0 40px 85px -15px rgba(0, 0, 0, 0.88), 0 0 45px rgba(56, 189, 248, 0.2), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.55)',
      }}
    >
      {/* Top subtle liquid glass highlight */}
      <div className="absolute inset-x-8 sm:inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none rounded-t-[40px]" />

      {/* 1. Home Button */}
      <button
        id="btn-dock-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] ${
          activeTab === 'home'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <Home className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">Home</span>
      </button>

      {/* 2. Courses Button */}
      <button
        id="btn-dock-courses"
        onClick={() => onSelectTab('courses')}
        className={`flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] ${
          activeTab === 'courses'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <LayoutGrid className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">Courses</span>
      </button>

      {/* 3. Collections Button */}
      <button
        id="btn-dock-collections"
        onClick={() => onSelectTab('collections')}
        className={`flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] ${
          activeTab === 'collections'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <Folder className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">Collections</span>
      </button>

      {/* 4. Notes Button */}
      <button
        id="btn-dock-notes"
        onClick={() => onSelectTab('notes')}
        className={`flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] ${
          activeTab === 'notes'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <FileText className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">Notes</span>
      </button>

      {/* 5. More Button */}
      <button
        id="btn-dock-more"
        onClick={() => onSelectTab('more')}
        className={`flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] ${
          activeTab === 'more'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5 text-cyan-300" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">More</span>
      </button>

      {/* Subtle Divider with clean vertical margin */}
      <div className="h-8 sm:h-10 w-[1px] bg-white/25 mx-0.5 sm:mx-3 shrink-0" />

      {/* 6. Return to Classic View Button */}
      <button
        onClick={onReturnToClassic}
        className="flex flex-col items-center justify-center px-1 sm:px-5 py-3.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] text-blue-200 hover:text-white bg-blue-600/10 hover:bg-blue-600/20 border-transparent transition-colors duration-200 cursor-pointer min-w-0 flex-1 sm:flex-initial sm:min-w-[90px] shadow-sm shrink-0"
        title="Return to Classic View"
        id="btn-return-classic-dock"
      >
        <Layers className="w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1.5 text-blue-300" />
        <span className="text-[9px] sm:text-xs font-bold tracking-tight whitespace-nowrap">Classic</span>
      </button>
    </nav>
  );
};
