const fs = require('fs');

const content = `import React from 'react';
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
      className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 select-none flex items-center justify-between sm:justify-center gap-1 sm:gap-4 p-3 sm:p-5 px-3 sm:px-10 rounded-[40px] sm:rounded-[64px] shadow-2xl transition-all duration-300 pointer-events-auto backdrop-blur-2xl w-[96vw] sm:w-max no-scrollbar"
      style={{
        background: 'rgba(10, 16, 32, 0.68)',
        border: '1.5px solid rgba(255, 255, 255, 0.26)',
        boxShadow:
          '0 40px 85px -15px rgba(0, 0, 0, 0.88), 0 0 45px rgba(56, 189, 248, 0.2), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.55)',
      }}
    >
      {/* Top subtle liquid glass highlight */}
      <div className="absolute inset-x-8 sm:inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none rounded-t-[64px]" />

      {/* 1. Home Button */}
      <button
        onClick={() => onSelectTab('home')}
        className={\`flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] \${
          activeTab === 'home'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }\`}
      >
        <Home className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">Home</span>
      </button>

      {/* 2. Courses Button */}
      <button
        onClick={() => onSelectTab('courses')}
        className={\`flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] \${
          activeTab === 'courses'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }\`}
      >
        <LayoutGrid className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">Courses</span>
      </button>

      {/* 3. Collections Button */}
      <button
        onClick={() => onSelectTab('collections')}
        className={\`flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] \${
          activeTab === 'collections'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }\`}
      >
        <Folder className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">Collections</span>
      </button>

      {/* 4. Notes Button */}
      <button
        onClick={() => onSelectTab('notes')}
        className={\`flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] \${
          activeTab === 'notes'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }\`}
      >
        <FileText className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">Notes</span>
      </button>

      {/* 5. More Button */}
      <button
        onClick={() => onSelectTab('more')}
        className={\`flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] \${
          activeTab === 'more'
            ? 'bg-white/[0.08] text-white shadow-lg'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }\`}
      >
        <Sparkles className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5 text-cyan-300" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">More</span>
      </button>

      {/* Subtle Divider with clean vertical margin */}
      <div className="h-10 sm:h-20 w-[1px] bg-white/25 mx-0.5 sm:mx-3 shrink-0" />

      {/* 6. Return to Classic View Button */}
      <button
        onClick={onReturnToClassic}
        className="flex flex-col items-center justify-center px-1.5 sm:px-5 py-4 sm:py-8 rounded-[24px] sm:rounded-[40px] text-blue-200 hover:text-white bg-blue-600/10 hover:bg-blue-600/20 border-transparent transition-colors duration-200 cursor-pointer min-w-[50px] sm:min-w-[90px] shadow-sm shrink-0"
        title="Return to Classic View"
        id="btn-return-classic-dock"
      >
        <Layers className="w-6 h-6 sm:w-11 sm:h-11 mb-1 sm:mb-2.5 text-blue-300" />
        <span className="text-[10px] sm:text-sm font-bold tracking-tight">Classic</span>
      </button>
    </nav>
  );
};
`

fs.writeFileSync('src/components/studio/StudioBottomDock.tsx', content);
