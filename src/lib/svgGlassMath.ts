export const SURFACE_FNS: Record<string, (x: number) => number> = {
  convex_squircle: (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25),
  convex_circle: (x: number) => Math.sqrt(1 - (1 - x) * (1 - x)),
  concave: (x: number) => 1 - Math.sqrt(1 - (1 - x) * (1 - x)),
  lip: (x: number) => {
    const convex = Math.pow(1 - Math.pow(1 - Math.min(x * 2, 1), 4), 0.25);
    const concave = 1 - Math.sqrt(1 - (1 - x) * (1 - x)) + 0.1;
    const t = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    return convex * (1 - t) + concave * t;
  },
};

export function calculateRefractionProfile(
  glassThickness: number,
  bezelWidth: number,
  heightFn: (x: number) => number,
  ior: number,
  samples: number = 128
): Float64Array {
  const eta = 1 / ior;

  function refract(nx: number, ny: number): [number, number] | null {
    const dot = ny;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const sq = Math.sqrt(k);
    return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
  }

  const profile = new Float64Array(samples);

  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    const y = heightFn(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = heightFn(x + dx);
    const deriv = (y2 - y) / dx;
    const mag = Math.sqrt(deriv * deriv + 1);

    const ref = refract(-deriv / mag, -1 / mag);
    if (!ref) {
      profile[i] = 0;
      continue;
    }
    profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
  }
  return profile;
}

export interface MapResult {
  dataUrl: string;
  imageData: ImageData;
}

export function generateDisplacementMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  profile: Float64Array,
  maxDisp: number
): MapResult {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const emptyImg = new ImageData(w, h);
  if (!ctx) return { dataUrl: '', imageData: emptyImg };
  const img = ctx.createImageData(w, h);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128;
    d[i + 1] = 128;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  const r = radius,
    rSq = r * r,
    r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2,
    S = profile.length;

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;

      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));

      if (op <= 0 || dist === 0) continue;

      const cos = x / dist,
        sin = y / dist;

      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
      const disp = profile[bi] || 0;

      const dX = (-cos * disp) / maxDisp,
        dY = (-sin * disp) / maxDisp;

      const idx = (y1 * w + x1) * 4;
      d[idx] = (128 + dX * 127 * op + 0.5) | 0;
      d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
    }
  }

  ctx.putImageData(img, 0, 0);
  return { dataUrl: c.toDataURL(), imageData: img };
}

export function generateSpecularMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  angle: number = Math.PI / 3
): MapResult {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const emptyImg = new ImageData(w, h);
  if (!ctx) return { dataUrl: '', imageData: emptyImg };
  const img = ctx.createImageData(w, h);
  const d = img.data;
  d.fill(0);

  const r = radius,
    rSq = r * r,
    r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2;
  const sv = [Math.cos(angle), Math.sin(angle)];

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;

      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;

      const cos = x / dist,
        sin = -y / dist;
      const dot = Math.abs(cos * sv[0] + sin * sv[1]);

      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
      const coeff = dot * edge;
      const col = (255 * coeff) | 0;
      const alpha = (col * coeff * op) | 0;

      const idx = (y1 * w + x1) * 4;
      d[idx] = col;
      d[idx + 1] = col;
      d[idx + 2] = col;
      d[idx + 3] = alpha;
    }
  }

  ctx.putImageData(img, 0, 0);
  return { dataUrl: c.toDataURL(), imageData: img };
}

export function hexToRgb(hex: string): string {
  if (!hex || hex.length < 7) return '255, 255, 255';
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  return `${r}, ${g}, ${b}`;
}

/**
 * High-performance direct refraction compositor for browsers/environments
 * that don't support SVG backdrop-filter (e.g., Safari, Firefox, iOS, or iframes).
 */
export function renderRefractedBackgroundSlice(
  targetCanvas: HTMLCanvasElement,
  bgImg: HTMLImageElement,
  glassX: number,
  glassY: number,
  glassW: number,
  glassH: number,
  dispData: ImageData,
  specData: ImageData,
  scale: number,
  specularOpacity: number
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx || !bgImg.naturalWidth || !bgImg.naturalHeight) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
  const screenAspect = vw / vh;
  let bgW = vw;
  let bgH = vh;
  let offX = 0;
  let offY = 0;

  if (screenAspect > imgAspect) {
    bgW = vw;
    bgH = vw / imgAspect;
    offY = (vh - bgH) / 2;
  } else {
    bgH = vh;
    bgW = vh * imgAspect;
    offX = (vw - bgW) / 2;
  }

  // Crop the area behind the glass from the background
  const offscreen = document.createElement('canvas');
  offscreen.width = glassW;
  offscreen.height = glassH;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  // Source coords on the background image
  const sX = ((glassX - offX) / bgW) * bgImg.naturalWidth;
  const sY = ((glassY - offY) / bgH) * bgImg.naturalHeight;
  const sW = (glassW / bgW) * bgImg.naturalWidth;
  const sH = (glassH / bgH) * bgImg.naturalHeight;

  offCtx.drawImage(bgImg, sX, sY, sW, sH, 0, 0, glassW, glassH);
  const srcImgData = offCtx.getImageData(0, 0, glassW, glassH);

  const src = srcImgData.data;
  const disp = dispData.data;
  const spec = specData.data;

  const outImgData = ctx.createImageData(glassW, glassH);
  const out = outImgData.data;

  for (let y = 0; y < glassH; y++) {
    for (let x = 0; x < glassW; x++) {
      const idx = (y * glassW + x) * 4;

      const rVal = disp[idx];
      const gVal = disp[idx + 1];

      // Displacement
      const dX = ((rVal - 128) / 127) * scale;
      const dY = ((gVal - 128) / 127) * scale;

      const sampleX = Math.min(Math.max(Math.round(x + dX), 0), glassW - 1);
      const sampleY = Math.min(Math.max(Math.round(y + dY), 0), glassH - 1);
      const srcIdx = (sampleY * glassW + sampleX) * 4;

      let r = src[srcIdx];
      let g = src[srcIdx + 1];
      let b = src[srcIdx + 2];

      // Specular blend
      const specA = (spec[idx + 3] / 255) * specularOpacity;
      if (specA > 0.01) {
        const specVal = spec[idx];
        r = Math.min(255, r * (1 - specA) + specVal * specA);
        g = Math.min(255, g * (1 - specA) + specVal * specA);
        b = Math.min(255, b * (1 - specA) + specVal * specA);
      }

      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = 255;
    }
  }
  ctx.putImageData(outImgData, 0, 0);
}
