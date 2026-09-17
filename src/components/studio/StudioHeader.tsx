import React from 'react';
import {
  Sparkles,
  Zap,
  Sun,
  Moon,
  SlidersHorizontal,
  User,
  ArrowLeft,
  Circle,
} from 'lucide-react';
import { PerformanceMode } from '../../types/studio';

interface StudioHeaderProps {
  performanceMode: PerformanceMode;
  onTogglePerformance: (mode: PerformanceMode) => void;
  onReturnToClassic: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAiSparkle: () => void;
  onToggleTheme?: () => void;
  isDarkTheme?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  performanceMode,
  onTogglePerformance,
  onReturnToClassic,
  onOpenSettings,
  onOpenProfile,
  onOpenAiSparkle,
  onToggleTheme,
  isDarkTheme = true,
}) => {
  return (
    <header
      id="studio-top-banner"
      className="relative w-full rounded-[36px] p-7 md:p-9 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 transition-all duration-300 select-none shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow:
          '0 25px 50px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* Specular glare edge overlay */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none rounded-t-[36px]" />

      {/* Left Typography Block with luxurious hierarchy */}
      <div className="space-y-2 max-w-xl">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
          <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300 uppercase">
            Liquid Glass Studio Workspace
          </p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/15">
            v2.4 Pro
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md font-sans">
          Welcome back!
        </h1>
        <p className="text-sm md:text-base text-slate-200/90 font-normal leading-relaxed">
          Select a course folder or explore your real-time WebGL liquid glass environment.
        </p>
      </div>

      {/* Right Controls Bar - Organized in premium functional clusters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 self-stretch lg:self-auto justify-start lg:justify-end max-w-full">
        {/* Navigation & Intelligence Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/10 shadow-inner max-w-full">
          {/* Return to Classic View Button */}
          <button
            onClick={onReturnToClassic}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white tracking-tight transition-all active:scale-95 shadow-md cursor-pointer"
            title="Return to Classic View"
            id="btn-return-classic-header"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Classic View</span>
          </button>

          {/* AI Intelligence Trigger */}
          <button
            onClick={onOpenAiSparkle}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600/40 to-purple-600/40 hover:from-blue-600/60 hover:to-purple-600/60 border border-white/20 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-md"
            title="Open AI Studio Intelligence"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300/30" />
            <span className="hidden sm:inline">AI Studio</span>
          </button>
        </div>

        {/* System & Telemetry Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/10 shadow-inner max-w-full">
          {/* Performance Selector Pill */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-0.5 sm:py-1"
            id="performance-selector"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 hidden sm:inline" />
            <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => onTogglePerformance('high')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  performanceMode === 'high'
                    ? 'bg-white/25 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                High
              </button>
              <button
                onClick={() => onTogglePerformance('ultra')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  performanceMode === 'ultra'
                    ? 'bg-white/25 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ultra
              </button>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            title="Toggle Light / Dark Ambient Theme"
          >
            {isDarkTheme ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            title="Studio Settings & Background Showcases"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* User profile button */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/30 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer hover:ring-2 hover:ring-white/40 shrink-0"
            title="Amith Krishna - Account Profile"
          >
            AK
          </button>
        </div>
      </div>
    </header>
  );
};
