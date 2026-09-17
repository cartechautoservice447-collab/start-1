import React, { useEffect, useRef, useCallback } from 'react';
import {
  calculateRefractionProfile,
  generateDisplacementMap,
  generateSpecularMap,
  hexToRgb,
  SURFACE_FNS,
  renderRefractedBackgroundSlice,
  MapResult,
} from '../lib/svgGlassMath';

export interface SvgGlassProps {
  gw: number;
  gh: number;
  br: number;
  surfaceFn: string;
  glassThickness: number;
  bezelWidth: number;
  refractiveIndex: number;
  scaleRatio: number;
  blurAmount: number;
  specularOpacity: number;
  specularSaturation: number;
  shadowColor: string;
  shadowBlur: number;
  shadowSpread: number;
  tintColor: string;
  tintOpacity: number;
  outerShadowBlur: number;
  currentBg: string;
}

export const SvgGlass: React.FC<SvgGlassProps> = ({
  gw,
  gh,
  br,
  surfaceFn,
  glassThickness,
  bezelWidth,
  refractiveIndex,
  scaleRatio,
  blurAmount,
  specularOpacity,
  specularSaturation,
  shadowColor,
  shadowBlur,
  shadowSpread,
  tintColor,
  tintOpacity,
  outerShadowBlur,
  currentBg,
}) => {
  const glassRef = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const filterRevRef = useRef<number>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cached maps and background image for fallback refraction
  const mapsRef = useRef<{
    disp: MapResult | null;
    spec: MapResult | null;
    scale: number;
  }>({
    disp: null,
    spec: null,
    scale: 1,
  });

  const bgImgRef = useRef<HTMLImageElement | null>(null);

  // Load and cache background image for fallback refraction canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      bgImgRef.current = img;
      renderFallback();
    };
    img.src = currentBg;
  }, [currentBg]);

  // Render fallback slice
  const renderFallback = useCallback(() => {
    const glass = glassRef.current;
    const canvas = fallbackCanvasRef.current;
    const img = bgImgRef.current;
    const { disp, spec, scale } = mapsRef.current;

    if (!glass || !canvas || !img || !disp || !spec) return;

    renderRefractedBackgroundSlice(
      canvas,
      img,
      glass.offsetLeft,
      glass.offsetTop,
      gw,
      gh,
      disp.imageData,
      spec.imageData,
      scale,
      specularOpacity
    );
  }, [gw, gh, specularOpacity]);

  // Synchronize CSS variables with DOM
  useEffect(() => {
    const root = document.documentElement.style;
    const glass = glassRef.current;

    if (glass) {
      glass.style.width = `${gw}px`;
      glass.style.height = `${gh}px`;
    }

    root.setProperty('--glass-radius', `${br}px`);
    root.setProperty('--shadow-color', shadowColor);
    root.setProperty('--shadow-blur', `${shadowBlur}px`);
    root.setProperty('--shadow-spread', `${shadowSpread}px`);
    root.setProperty('--tint-color', hexToRgb(tintColor));
    root.setProperty('--tint-opacity', (tintOpacity / 100).toFixed(3));
    root.setProperty('--outer-shadow-blur', `${outerShadowBlur}px`);
  }, [
    gw,
    gh,
    br,
    shadowColor,
    shadowBlur,
    shadowSpread,
    tintColor,
    tintOpacity,
    outerShadowBlur,
  ]);

  // Rebuild SVG filter graph and displacement/specular maps
  const rebuildFilter = useCallback(() => {
    const defs = document.getElementById('svg-defs');
    if (!defs || gw < 2 || gh < 2) return;

    const heightFn = SURFACE_FNS[surfaceFn] || SURFACE_FNS.convex_squircle;
    const clampedBezel = Math.min(bezelWidth, br - 1, Math.min(gw, gh) / 2 - 1);

    const profile = calculateRefractionProfile(
      glassThickness,
      clampedBezel,
      heightFn,
      refractiveIndex,
      128
    );
    const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;

    const disp = generateDisplacementMap(gw, gh, br, clampedBezel, profile, maxDisp);
    const spec = generateSpecularMap(gw, gh, br, clampedBezel * 2.5);
    const scale = maxDisp * scaleRatio;

    mapsRef.current = { disp, spec, scale };

    // Increment filter revision to force Chromium CSS engine cache invalidation
    filterRevRef.current += 1;
    const filterId = `liquid-glass-filter-${filterRevRef.current}`;

    defs.innerHTML = `
      <filter id="${filterId}" x="0%" y="0%" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}" result="blurred_source" />
        <feImage href="${disp.dataUrl}" xlink:href="${disp.dataUrl}" x="0" y="0" width="${gw}" height="${gh}" result="disp_map" />
        <feDisplacementMap in="blurred_source" in2="disp_map"
          scale="${scale}" xChannelSelector="R" yChannelSelector="G"
          result="displaced" />
        <feColorMatrix in="displaced" type="saturate" values="${specularSaturation}" result="displaced_sat" />
        <feImage href="${spec.dataUrl}" xlink:href="${spec.dataUrl}" x="0" y="0" width="${gw}" height="${gh}" result="spec_layer" />
        <feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />
        <feComponentTransfer in="spec_layer" result="spec_faded">
          <feFuncA type="linear" slope="${specularOpacity}" />
        </feComponentTransfer>
        <feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />
        <feBlend in="spec_faded" in2="with_sat" mode="normal" />
      </filter>
    `;

    // Apply the versioned filter URL to root CSS variable and glass element
    document.documentElement.style.setProperty('--svg-filter-url', `url(#${filterId})`);
    if (glassRef.current) {
      glassRef.current.style.setProperty('--svg-filter-url', `url(#${filterId})`);
    }

    // Render fallback canvas slice as well
    renderFallback();
  }, [
    gw,
    gh,
    br,
    surfaceFn,
    glassThickness,
    bezelWidth,
    refractiveIndex,
    scaleRatio,
    blurAmount,
    specularOpacity,
    specularSaturation,
    renderFallback,
  ]);

  // Debounced filter rebuild whenever geometric or optical properties change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(rebuildFilter, 30);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rebuildFilter]);

  // Initial center positioning on mount
  useEffect(() => {
    const glass = glassRef.current;
    if (glass && !glass.style.left) {
      glass.style.left = `${Math.round(window.innerWidth / 2 - gw / 2)}px`;
      glass.style.top = `${Math.round(window.innerHeight / 2 - gh / 2)}px`;
    }
  }, [gw, gh]);

  // High-performance pointer dragging (pure DOM, 120 FPS, zero React re-renders)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const glass = glassRef.current;
    if (!glass) return;

    let sx = e.clientX;
    let sy = e.clientY;

    const onMove = (moveEvt: PointerEvent) => {
      moveEvt.preventDefault();
      const dx = moveEvt.clientX - sx;
      const dy = moveEvt.clientY - sy;
      sx = moveEvt.clientX;
      sy = moveEvt.clientY;

      glass.style.left = `${glass.offsetLeft + dx}px`;
      glass.style.top = `${glass.offsetTop + dy}px`;

      renderFallback();
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
  };

  return (
    <div
      ref={glassRef}
      id="glass"
      className="glassDiv"
      onPointerDown={handlePointerDown}
      style={{
        width: `${gw}px`,
        height: `${gh}px`,
        borderRadius: `${br}px`,
      }}
    >
      {/* Fallback refraction canvas for Safari / Firefox / non-Chromium browsers */}
      <canvas
        ref={fallbackCanvasRef}
        className="glass-refract-canvas"
        width={gw}
        height={gh}
      />
    </div>
  );
};
