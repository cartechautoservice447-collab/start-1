import React, { useState } from 'react';
import { GlassSettings, BackgroundOption, Preset } from '../types';
import { BACKGROUND_OPTIONS, PRESETS } from '../data';
import { X, Sparkles, Sliders, Image as ImageIcon, Waves, RotateCcw } from 'lucide-react';

interface ControlsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlassSettings;
  onChangeSettings: (newSettings: GlassSettings) => void;
  currentBgId: string;
  onSelectBackground: (bg: BackgroundOption) => void;
  onReset: () => void;
}

export const ControlsDrawer: React.FC<ControlsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  currentBgId,
  onSelectBackground,
  onReset,
}) => {
  const [customBgInput, setCustomBgInput] = useState('');
  const [activeTab, setActiveTab] = useState<'glass' | 'anim' | 'presets' | 'bg'>('glass');

  const update = <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleApplyPreset = (preset: Preset) => {
    onChangeSettings({
      ...settings,
      ...preset.settings,
    });
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBgInput.trim()) return;
    onSelectBackground({
      id: `custom-${Date.now()}`,
      name: 'Custom Image',
      url: customBgInput.trim(),
    });
  };

  return (
    <aside
      id="controls-panel"
      data-purpose="refraction-settings-panel"
      className={`fixed top-6 left-6 z-40 w-80 max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950/85 backdrop-blur-2xl border border-white/10 shadow-2xl text-neutral-200 transition-all duration-300 ease-out ${
        isOpen
          ? 'translate-x-0 opacity-100 pointer-events-auto'
          : '-translate-x-96 opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10 text-white">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-semibold tracking-wider text-white uppercase">
            Simulation Controls
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="controls-reset-btn"
            onClick={onReset}
            title="Reset to defaults"
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            id="controls-close-btn"
            aria-label="Close Controls"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-3 py-1.5 gap-1 shrink-0 bg-white/5">
        <button
          id="tab-glass-btn"
          onClick={() => setActiveTab('glass')}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
            activeTab === 'glass'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Optics
        </button>
        <button
          id="tab-anim-btn"
          onClick={() => setActiveTab('anim')}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'anim'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Waves className="w-3 h-3 text-indigo-400" />
          Fluid
        </button>
        <button
          id="tab-presets-btn"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'presets'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          Presets
        </button>
        <button
          id="tab-bg-btn"
          onClick={() => setActiveTab('bg')}
          className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'bg'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          Scenes
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scroll text-xs">
        {activeTab === 'glass' && (
          <>
            {/* Section: Glass Dimensions */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                Geometry
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="width-slider">Width</label>
                  <span className="text-neutral-400 font-mono" id="width-val">{settings.width}px</span>
                </div>
                <input
                  id="width-slider"
                  type="range"
                  min="150"
                  max="600"
                  value={settings.width}
                  onChange={(e) => update('width', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="height-slider">Height</label>
                  <span className="text-neutral-400 font-mono" id="height-val">{settings.height}px</span>
                </div>
                <input
                  id="height-slider"
                  type="range"
                  min="100"
                  max="450"
                  value={settings.height}
                  onChange={(e) => update('height', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="radius-slider">Corner Radius</label>
                  <span className="text-neutral-400 font-mono" id="radius-val">{settings.radius}px</span>
                </div>
                <input
                  id="radius-slider"
                  type="range"
                  min="8"
                  max="150"
                  value={settings.radius}
                  onChange={(e) => update('radius', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Section: Refraction Parameters */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                Refraction & Optics
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="thickness-slider">Thickness / Dome</label>
                  <span className="text-neutral-400 font-mono" id="thickness-val">{settings.thickness}</span>
                </div>
                <input
                  id="thickness-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={settings.thickness}
                  onChange={(e) => update('thickness', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="bezel-slider">Bezel Curve</label>
                  <span className="text-neutral-400 font-mono" id="bezel-val">{settings.bezel}</span>
                </div>
                <input
                  id="bezel-slider"
                  type="range"
                  min="10"
                  max="120"
                  value={settings.bezel}
                  onChange={(e) => update('bezel', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="ior-slider">Index of Refraction (IOR)</label>
                  <span className="text-neutral-400 font-mono" id="ior-val">{settings.ior.toFixed(1)}</span>
                </div>
                <input
                  id="ior-slider"
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={settings.ior}
                  onChange={(e) => update('ior', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="dispersion-slider">Chromatic Dispersion</label>
                  <span className="text-neutral-400 font-mono" id="dispersion-val">{settings.dispersion.toFixed(1)}</span>
                </div>
                <input
                  id="dispersion-slider"
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={settings.dispersion}
                  onChange={(e) => update('dispersion', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Section: Look / Aesthetics */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                Look & Lighting
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="blur-slider">Blur / Frosting</label>
                  <span className="text-neutral-400 font-mono" id="blur-val">{settings.blur}px</span>
                </div>
                <input
                  id="blur-slider"
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={settings.blur}
                  onChange={(e) => update('blur', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="specular-slider">Specular Highlights</label>
                  <span className="text-neutral-400 font-mono" id="specular-val">{settings.specular.toFixed(2)}</span>
                </div>
                <input
                  id="specular-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.specular}
                  onChange={(e) => update('specular', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="tint-slider">Internal Tint</label>
                  <span className="text-neutral-400 font-mono" id="tint-val">{settings.tint}%</span>
                </div>
                <input
                  id="tint-slider"
                  type="range"
                  min="0"
                  max="50"
                  value={settings.tint}
                  onChange={(e) => update('tint', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-neutral-300" htmlFor="shadow-slider">Contact Shadow</label>
                  <span className="text-neutral-400 font-mono" id="shadow-val">{settings.shadow.toFixed(2)}</span>
                </div>
                <input
                  id="shadow-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.shadow}
                  onChange={(e) => update('shadow', Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'anim' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                Liquid Dynamics
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Controls real-time fluid wobbling, jelly spring inertia, and surface tension as you drag or hover.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-neutral-300" htmlFor="wobble-slider">Fluid Wobble / Elasticity</label>
                <span className="text-neutral-400 font-mono" id="wobble-val">
                  {(settings.wobbleIntensity * 100).toFixed(0)}%
                </span>
              </div>
              <input
                id="wobble-slider"
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={settings.wobbleIntensity}
                onChange={(e) => update('wobbleIntensity', Number(e.target.value))}
                className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-neutral-200 font-medium block">Idle Levitation</label>
                  <span className="text-[10px] text-neutral-400">Gentle organic floating motion</span>
                </div>
                <input
                  type="checkbox"
                  id="floating-toggle"
                  checked={settings.floatingEnabled}
                  onChange={(e) => update('floatingEnabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-neutral-200 font-medium block">Click Shockwave</label>
                  <span className="text-[10px] text-neutral-400">Ripples propagate through glass</span>
                </div>
                <input
                  type="checkbox"
                  id="ripple-toggle"
                  checked={settings.rippleOnClick}
                  onChange={(e) => update('rippleOnClick', e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-neutral-200 font-medium block">Dynamic Lighting</label>
                  <span className="text-[10px] text-neutral-400">Specular reflections track pointer</span>
                </div>
                <input
                  type="checkbox"
                  id="light-mouse-toggle"
                  checked={settings.lightFollowsMouse}
                  onChange={(e) => update('lightFollowsMouse', e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
              💡 <strong>Interaction Tip:</strong> Drag the glass across high-contrast elements like window frames or furniture to see real chromatic refraction bend around the edges.
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
              Optical Material Presets
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 transition-all active:scale-[0.98]"
                >
                  <div className="font-medium text-white text-xs flex items-center justify-between">
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider">Apply</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bg' && (
          <div className="space-y-4">
            <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
              Scenes & Backgrounds
            </span>
            <div className="grid grid-cols-1 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  id={`bg-select-${bg.id}`}
                  onClick={() => onSelectBackground(bg)}
                  className={`flex items-center gap-3 p-2 rounded-xl text-left border transition-all ${
                    currentBgId === bg.id
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
                  }`}
                >
                  <img
                    src={bg.url}
                    alt={bg.name}
                    className="w-12 h-10 object-cover rounded-lg shrink-0 border border-white/10"
                  />
                  <div className="truncate">
                    <p className="font-medium text-xs truncate">{bg.name}</p>
                    <p className="text-[10px] text-neutral-400">Click to switch</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                Custom Image URL
              </span>
              <form onSubmit={handleAddCustomUrl} className="flex gap-2">
                <input
                  type="url"
                  id="custom-bg-input"
                  placeholder="https://images.unsplash.com/..."
                  value={customBgInput}
                  onChange={(e) => setCustomBgInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  id="custom-bg-submit-btn"
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium text-white transition-colors"
                >
                  Load
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
