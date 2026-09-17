export interface GlassSettings {
  width: number;
  height: number;
  radius: number;
  thickness: number;
  bezel: number;
  ior: number;
  dispersion: number;
  blur: number;
  specular: number;
  tint: number;
  shadow: number;
  wobbleIntensity: number;
  floatingEnabled: boolean;
  rippleOnClick: boolean;
  lightFollowsMouse: boolean;
}

export type RendererMode = 'webgl' | 'svg';

export interface BackgroundOption {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  settings: Partial<GlassSettings>;
}
