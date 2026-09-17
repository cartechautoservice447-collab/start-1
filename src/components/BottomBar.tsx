import React from 'react';
import { RendererMode } from '../types';

interface BottomBarProps {
  mode: RendererMode;
  onToggleMode: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ mode, onToggleMode }) => {
  return (
    <footer className="absolute bottom-5 inset-x-0 z-30 flex justify-center items-center pointer-events-none">
      <div className="inline-flex items-center gap-2 p-1 rounded-full bg-neutral-900/70 backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
        {/* Status Pill */}
        <div
          className="px-4 py-1.5 text-xs text-neutral-300 font-medium tracking-tight rounded-full bg-black/40 border border-white/5 select-none"
          data-purpose="webgl-info-badge"
          id="renderer-info-badge"
        >
          {mode === 'webgl' ? 'WebGL — works in all browsers' : 'SVG — CSS displacement filter'}
        </div>

        {/* Version Switch Button */}
        <button
          id="switch-version-btn"
          data-purpose="switch-renderer-button"
          onClick={onToggleMode}
          type="button"
          className="inline-flex items-center px-4 py-1.5 text-xs font-semibold text-white tracking-tight rounded-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          {mode === 'webgl' ? '← Switch to SVG version' : '→ Switch to WebGL version'}
        </button>
      </div>
    </footer>
  );
};
