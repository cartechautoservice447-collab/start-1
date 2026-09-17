import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Timer,
  Droplets,
  Flame,
  Music,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { PomodoroWebGLOrb } from './PomodoroWebGLOrb';
import { focusAudio } from '../../utils/focusAudio';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBg?: string;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak' | 'hyperFocus' | 'speedSprint';

interface FluidTheme {
  id: string;
  name: string;
  fluidColor: string;
  accentColor: string;
}

const FLUID_THEMES: FluidTheme[] = [
  { id: 'cyan', name: 'Cyan Lagoon', fluidColor: '#06b6d4', accentColor: '#3b82f6' },
  { id: 'sapphire', name: 'Sapphire Flow', fluidColor: '#3b82f6', accentColor: '#8b5cf6' },
  { id: 'aurora', name: 'Violet Aurora', fluidColor: '#a855f7', accentColor: '#ec4899' },
  { id: 'emerald', name: 'Emerald Wave', fluidColor: '#10b981', accentColor: '#06b6d4' },
  { id: 'amber', name: 'Solar Amber', fluidColor: '#f59e0b', accentColor: '#ef4444' },
];

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  hyperFocus: 50 * 60,
  speedSprint: 15 * 60,
};

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(2);
  const [activeTheme, setActiveTheme] = useState<FluidTheme>(FLUID_THEMES[0]);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'binaural' | 'waves' | 'brownNoise' | 'zen'>('none');
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [taskObjective, setTaskObjective] = useState('Deep Work: Advanced Concepts & Active Recall');

  // Exact liquid glass styling constant for uniform components
  const glassPanelStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.65)',
    border: '1.5px solid rgba(255, 255, 255, 0.22)',
    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.65), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4)',
  };

  const setTimerMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    const dur = DEFAULT_DURATIONS[newMode];
    setTotalDuration(dur);
    setTimeLeft(dur);
  };

  const handleSetCustomMinutes = (minutes: number) => {
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalDuration(secs);
    setTimeLeft(secs);
  };

  const handleAdjustMinutes = (delta: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(60, prev + delta * 60);
      if (next > totalDuration) {
        setTotalDuration(next);
      }
      return next;
    });
  };

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      focusAudio.playSessionEndChime();
      if (mode === 'work' || mode === 'hyperFocus' || mode === 'speedSprint') {
        setSessionsCompleted((prev) => prev + 1);
        setTimerMode('shortBreak');
      } else {
        setTimerMode('work');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  // Audio Ambient sound listener
  useEffect(() => {
    if (!isOpen) {
      focusAudio.stopAmbient();
      return;
    }
    if (activeSound === 'none' || isMuted) {
      focusAudio.stopAmbient();
    } else {
      focusAudio.setVolume(soundVolume);
      focusAudio.startAmbient(activeSound);
    }
    return () => {
      focusAudio.stopAmbient();
    };
  }, [activeSound, isMuted, soundVolume, isOpen]);

  // Responsive orb sizing
  const [orbSize, setOrbSize] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 380 ? 250 : typeof window !== 'undefined' && window.innerWidth < 480 ? 290 : 340
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 380) setOrbSize(250);
      else if (window.innerWidth < 480) setOrbSize(290);
      else setOrbSize(340);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const fractionRemaining = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const progressPercent = Math.round(fractionRemaining * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 md:p-6 bg-black/75 overflow-y-auto">
      {/* 
        ENLARGED INTERFACE CONTAINER 
        Greatly increased width (max-w-5xl/6xl) and height (min-h-[700px] to 760px)
        Exact WebGL liquid glass curvature (rounded-[48px] to rounded-[64px])
      */}
      <div
        id="pomodoro-modal-content"
        className="relative w-full max-w-5xl lg:max-w-6xl min-h-0 sm:min-h-[680px] lg:min-h-[740px] max-h-[92vh] overflow-y-auto rounded-[32px] sm:rounded-[56px] md:rounded-[64px] p-4 sm:p-8 md:p-10 lg:p-12 text-white border shadow-2xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 16, 32, 0.6) 0%, rgba(6, 10, 22, 0.72) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.26)',
          boxShadow:
            '0 40px 95px -20px rgba(0, 0, 0, 0.85), 0 0 50px rgba(6, 182, 212, 0.15), inset 0 1.5px 2.5px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Exact WebGL Liquid Glass Top Gloss Highlight Line */}
        <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none rounded-t-[64px]" />

        {/* ------------------------------------------------------------- */}
        {/* 1. TOP HEADER BAR WITH EXACT LIQUID GLASS STATUS BADGES */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div
              className="p-3.5 rounded-[22px] flex-shrink-0 flex items-center justify-center text-cyan-300"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              }}
            >
              <Timer className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Studio Focus Engine
                </span>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-200 border border-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  Session {sessionsCompleted + 1} of 4
                </span>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-cyan-200 border border-cyan-400/30">
                  Arc Fluid Drop Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                WebGL Liquid Glass Pomodoro
              </h2>
            </div>
          </div>

          {/* Quick Objective Tag & Close Controls */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => {
                const muted = focusAudio.toggleMute();
                setIsMuted(muted);
              }}
              className={`p-3 rounded-[20px] transition-all cursor-pointer border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-3 rounded-[20px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer border border-white/20 shadow-md"
              title="Close Focus Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. MODE SELECTOR TABS (EXACT WEBGL LIQUID GLASS TABS) */}
        {/* ------------------------------------------------------------- */}
        <div
          className="my-5 p-1.5 sm:p-2 rounded-[32px] sm:rounded-[38px] flex flex-wrap items-center justify-between gap-1.5 shadow-xl"
          style={glassPanelStyle}
        >
          {[
            { id: 'work', label: 'Deep Focus', time: '25m', desc: 'Standard sprint' },
            { id: 'shortBreak', label: 'Short Recharge', time: '5m', desc: 'Rest & hydration' },
            { id: 'longBreak', label: 'Long Recovery', time: '15m', desc: 'Post-cycle unwind' },
            { id: 'hyperFocus', label: 'Hyper Focus', time: '50m', desc: 'Extended study' },
            { id: 'speedSprint', label: 'Quick Sprint', time: '15m', desc: 'Flash review' },
          ].map((item) => {
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTimerMode(item.id as PomodoroMode)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-[26px] sm:rounded-[30px] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center border text-center ${
                  isActive
                    ? 'text-white border-white/40 shadow-xl scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${activeTheme.fluidColor}bb 0%, ${activeTheme.accentColor}cc 100%)`,
                        boxShadow: `0 12px 25px -5px ${activeTheme.fluidColor}55, inset 0 1px 1.5px rgba(255,255,255,0.6)`,
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold">{item.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({item.time})</span>
                </div>
                <span className="text-[10px] text-slate-300 hidden sm:inline-block mt-0.5">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. INTEGRATED MAIN STAGE: LEFT ROUND GLASS ORB + RIGHT MODULES */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto py-2">
          {/* LEFT: THE ROUND LIQUID GLASS ORB INSIDE THE ARC RING */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* REAL WEBGL LIQUID GLASS ORB & ARC RING FLUID DROP */}
              <PomodoroWebGLOrb
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                isRunning={isRunning}
                fluidColorHex={activeTheme.fluidColor}
                accentColorHex={activeTheme.accentColor}
                size={orbSize}
                onOrbClick={() => setIsRunning(!isRunning)}
              />

              {/* OVERLAID CRISP TIMER DIGITAL READOUT & STATUS IN CENTER OF ORB */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                  {formattedTime}
                </span>

                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/20">
                  <span
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: activeTheme.fluidColor, color: activeTheme.fluidColor }}
                  />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200">
                    {mode === 'work' || mode === 'hyperFocus' || mode === 'speedSprint'
                      ? 'Deep Work'
                      : 'Rest & Recharge'}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-cyan-200/90 mt-1.5 font-bold drop-shadow">
                  {progressPercent}% Fluid In Arc
                </span>
              </div>
            </div>

            {/* PRIMARY CONTROLS (EXACT LIQUID GLASS PILL BUTTONS) */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Subtract 5m */}
              <button
                onClick={() => handleAdjustMinutes(-5)}
                className="p-3.5 rounded-[22px] text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border active:scale-95"
                style={glassPanelStyle}
                title="Subtract 5 Minutes"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Reset Timer */}
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(totalDuration);
                }}
                className="p-3.5 rounded-[22px] text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border active:scale-95"
                style={glassPanelStyle}
                title="Reset Session"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Primary Start / Pause Toggle */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-8 sm:px-10 py-4 rounded-[30px] font-extrabold text-sm uppercase tracking-wider text-white transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-2xl active:scale-95 border border-white/40"
                style={{
                  background: isRunning
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.85) 0%, rgba(220, 38, 38, 0.9) 100%)'
                    : `linear-gradient(135deg, ${activeTheme.fluidColor}dd 0%, ${activeTheme.accentColor}ee 100%)`,
                  boxShadow: `0 15px 35px -5px ${
                    isRunning ? 'rgba(239, 68, 68, 0.45)' : activeTheme.fluidColor + '66'
                  }, inset 0 1.5px 2px rgba(255, 255, 255, 0.6)`,
                }}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pause Flow</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Flow</span>
                  </>
                )}
              </button>

              {/* Skip to Next Session */}
              <button
                onClick={() => {
                  setIsRunning(false);
                  if (mode === 'work' || mode === 'hyperFocus' || mode === 'speedSprint') {
                    setSessionsCompleted((prev) => prev + 1);
                    setTimerMode('shortBreak');
                  } else {
                    setTimerMode('work');
                  }
                }}
                className="p-3.5 rounded-[22px] text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border active:scale-95"
                style={glassPanelStyle}
                title="Skip to Next Interval"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Add 5m */}
              <button
                onClick={() => handleAdjustMinutes(5)}
                className="p-3.5 rounded-[22px] text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border active:scale-95"
                style={glassPanelStyle}
                title="Add 5 Minutes"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: INTEGRATED MODULES (SOUND, FLUID TINT, PRESETS, GOALS) */}
          <div className="lg:col-span-6 space-y-4">
            {/* 1. Target Study Objective Input */}
            <div className="p-4 sm:p-5 rounded-[28px] space-y-2" style={glassPanelStyle}>
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Active Study Objective
                </span>
                <span className="text-[11px] font-mono text-slate-400">Pomodoro Target</span>
              </div>
              <input
                type="text"
                value={taskObjective}
                onChange={(e) => setTaskObjective(e.target.value)}
                placeholder="What topic are you mastering right now?"
                className="w-full px-4 py-2.5 rounded-[18px] bg-white/5 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all font-medium"
              />
            </div>

            {/* 2. WebGL Liquid Fluid Tint Palette */}
            <div className="p-4 sm:p-5 rounded-[28px] space-y-2.5" style={glassPanelStyle}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                  Liquid Glass Fluid Tint
                </span>
                <span className="text-[11px] font-mono text-cyan-300">{activeTheme.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {FLUID_THEMES.map((theme) => {
                  const isSelected = activeTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setActiveTheme(theme)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/20 border-white text-white shadow-md scale-105'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: theme.fluidColor, color: theme.fluidColor }}
                      />
                      <span>{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Integrated Procedural Ambient Sound Generator (Web Audio API) */}
            <div className="p-4 sm:p-5 rounded-[28px] space-y-3" style={glassPanelStyle}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-300" />
                  Ambient Focus Sound Engine
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setSoundVolume(v);
                      focusAudio.setVolume(v);
                    }}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Mute / Silence' },
                  { id: 'rain', label: 'Rain on Glass' },
                  { id: 'binaural', label: 'Binaural 40Hz' },
                  { id: 'waves', label: 'Ocean Waves' },
                  { id: 'brownNoise', label: 'Deep Brown Noise' },
                  { id: 'zen', label: '528Hz Zen Drone' },
                ].map((s) => {
                  const isSelected = activeSound === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSound(s.id as any)}
                      className={`px-3 py-2 rounded-[18px] text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-md scale-102'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Quick Duration Adjuster Presets */}
            <div className="p-4 sm:p-5 rounded-[28px] space-y-2.5" style={glassPanelStyle}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  Quick Sprint Presets
                </span>
                <span className="text-[11px] font-mono text-slate-400">Direct Duration</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[15, 20, 25, 30, 45, 50, 60].map((mins) => {
                  const isCurrent = totalDuration === mins * 60;
                  return (
                    <button
                      key={mins}
                      onClick={() => handleSetCustomMinutes(mins)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white/20 border-white text-white shadow-md scale-105'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. BOTTOM FOOTER BAR WITH DAILY MILESTONE NODES */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Daily Cycles:
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((cycleIdx) => {
                const isDone = cycleIdx < sessionsCompleted;
                const isCurrent = cycleIdx === sessionsCompleted;
                return (
                  <div
                    key={cycleIdx}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-current opacity-75" />
                    )}
                    <span>Cycle {cycleIdx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Continuous WebGL Liquid Refraction & Snell Optics</span>
            <span className="text-cyan-300 font-semibold">Studio Mode Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
