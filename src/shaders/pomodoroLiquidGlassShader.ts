// WebGL Liquid Glass Shader for Pomodoro Orb and Dynamic Arc Ring Fluid Drop
// Implements exact physical refraction, Snell's law, spherical caustic lens,
// fluid meniscus tension, chromatic aberration, and animated fluid drop.

export const pomodoroVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const pomodoroFragmentShader = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTimeLeft;
uniform float uTotalDuration;
uniform float uIsRunning;
uniform vec3 uFluidColor;
uniform vec3 uAccentColor;
uniform vec2 uMouse;
uniform float uOrbRadius;
uniform float uRingInnerRadius;
uniform float uRingOuterRadius;

#define PI 3.14159265359

// Surface height curve for liquid glass edge
float glassSurfaceHeight(float t) {
  float s = 1.0 - clamp(t, 0.0, 1.0);
  return pow(1.0 - s * s * s * s, 0.25);
}

// 2D Hash function for procedural bubbles
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // Center coordinates [-1.0, 1.0] with aspect ratio compensation
  vec2 st = (gl_FragCoord.xy - 0.5 * uResolution.xy) / (0.5 * min(uResolution.x, uResolution.y));
  
  float dist = length(st);
  float orbR = uOrbRadius;             // ~0.66
  float rInner = uRingInnerRadius;     // ~0.78
  float rOuter = uRingOuterRadius;     // ~0.94
  float rMid = 0.5 * (rInner + rOuter);
  float rThick = 0.5 * (rOuter - rInner);

  // Time remaining fraction [0.0, 1.0]
  float fraction = clamp(uTimeLeft / max(1.0, uTotalDuration), 0.0, 1.0);
  
  // Angle around 12 o'clock (0 = top, goes clockwise to 1.0)
  float angleRad = atan(st.x, st.y); // st.y is up (12 o'clock is 0 rad)
  float angleClockwise = angleRad < 0.0 ? (angleRad + 2.0 * PI) : angleRad;
  float angleNorm = angleClockwise / (2.0 * PI); // [0.0, 1.0] clockwise from top

  // Background atmosphere: deep dark space with subtle caustic radial glow
  vec3 col = vec3(0.015, 0.02, 0.04);
  float bgGlow = exp(-dist * 1.8) * 0.18;
  col += uFluidColor * bgGlow;

  // -------------------------------------------------------------
  // 1. ARC RING CASING & FLUID DROP
  // -------------------------------------------------------------
  float sdRing = abs(dist - rMid) - rThick;
  float ringBezel = rThick * 0.8;
  float isInsideRing = step(sdRing, 0.0);

  if (sdRing < 0.02) {
    // Glass tube edge highlights
    float ringEdgeDist = -sdRing;
    float ringT = clamp(ringEdgeDist / ringBezel, 0.0, 1.0);
    float ringHeight = glassSurfaceHeight(ringT);

    // Default glass tube casing color (empty chamber)
    vec3 tubeGlassCol = vec3(0.06, 0.09, 0.16);
    tubeGlassCol += vec3(0.12, 0.16, 0.22) * ringHeight;

    // Specular highlight on the outer and inner glass rims of the tube
    float rimHighlight = pow(1.0 - abs(dist - rMid) / rThick, 3.0) * 0.28;
    tubeGlassCol += vec3(rimHighlight);

    // FLUID IN ARC RING:
    // Fluid level drops as timer decreases time
    // Leading edge of fluid is at angleNorm == fraction
    float fluidMargin = 0.003;
    bool inFluidArc = (angleNorm <= fraction);

    // Droplet at the leading fluid edge (where fluid drops / drips)
    float dropAngle = fraction * 2.0 * PI;
    vec2 dropPos = vec2(sin(dropAngle), cos(dropAngle)) * rMid;
    float distToDrop = length(st - dropPos);
    float dropRadius = rThick * 1.15;
    bool inDroplet = (distToDrop <= dropRadius);

    if (inFluidArc || inDroplet) {
      // Dynamic fluid wave along the arc
      float arcWave = sin(angleNorm * 40.0 - uTime * 4.0) * 0.004 * (uIsRunning > 0.5 ? 1.0 : 0.25);
      
      // Fluid core color with glowing liquid saturation
      vec3 fluidCol = mix(uFluidColor, uAccentColor, angleNorm * 0.6);
      
      // Intense fluid center gradient
      float fluidDepth = 1.0 - clamp(abs(dist - rMid) / rThick, 0.0, 1.0);
      fluidCol *= (0.8 + 1.2 * fluidDepth);

      // Liquid glass refraction along arc tube
      fluidCol += vec3(0.35, 0.45, 0.55) * pow(fluidDepth, 2.5);

      // Droplet meniscus glow and lens caustics
      if (inDroplet) {
        float dropNormDist = 1.0 - (distToDrop / dropRadius);
        fluidCol += vec3(0.6, 0.8, 1.0) * pow(dropNormDist, 2.0) * 0.75;
        fluidCol += uAccentColor * dropNormDist * 0.5;
      }

      tubeGlassCol = mix(tubeGlassCol, fluidCol, 0.92);
    }

    // Dynamic fluid dripping animation when running and timer decreases:
    // A small fluid droplet drops from the meniscus downwards!
    if (uIsRunning > 0.5 && fraction > 0.01 && fraction < 0.99) {
      float dripCycle = fract(uTime * 1.8 + fraction * 3.0);
      vec2 dripPos = dropPos + vec2(0.0, -dripCycle * 0.18);
      float dripDist = length(st - dripPos);
      float dripSize = 0.022 * (1.0 - dripCycle * 0.65);
      if (dripDist < dripSize) {
        float dripAlpha = 1.0 - dripDist / dripSize;
        tubeGlassCol += (uFluidColor * 1.4 + vec3(0.4)) * pow(dripAlpha, 1.8) * (1.0 - dripCycle);
      }
    }

    // Anti-aliased ring edge composite
    float ringAlpha = smoothstep(0.004, -0.002, sdRing);
    col = mix(col, tubeGlassCol, ringAlpha);
  }

  // -------------------------------------------------------------
  // 2. ROUND LIQUID GLASS ORB (LENS & INNER FLUID LEVEL)
  // -------------------------------------------------------------
  float sdOrb = dist - orbR;
  float orbBezel = orbR * 0.25;

  if (sdOrb < 0.02) {
    vec2 p = st;
    float distFromEdge = -sdOrb;
    float orbT = clamp(distFromEdge / orbBezel, 0.0, 1.0);
    float orbH = glassSurfaceHeight(orbT);

    // 3D Spherical Normal for Snell's law refraction
    float zCoord = sqrt(max(0.0, orbR * orbR - p.x * p.x - p.y * p.y));
    vec3 N = normalize(vec3(p.x, p.y, zCoord));

    // Refraction vector with Chromatic Aberration
    vec2 refrR = -N.xy * 0.085;
    vec2 refrG = -N.xy * 0.095;
    vec2 refrB = -N.xy * 0.11;

    // Fluid height inside the round liquid glass sphere:
    // When timer decreases, the fluid level inside the orb DROPS!
    // Fraction ranges from 1.0 (top) down to 0.0 (empty bottom)
    float baseFluidY = (fraction * 2.0 - 1.0) * (orbR * 0.88);

    // Fluid wave dynamics (agitated when running, gentle when standing)
    float waveAmp = uIsRunning > 0.5 ? 0.035 : 0.014;
    float waveSpeed = uIsRunning > 0.5 ? 3.2 : 1.2;
    float fluidWave = sin(p.x * 12.0 + uTime * waveSpeed) * waveAmp
                    + cos(p.x * 24.0 - uTime * (waveSpeed * 0.8)) * (waveAmp * 0.4)
                    + sin(p.x * 36.0 + uTime * 1.5) * (waveAmp * 0.2);

    // Interactive mouse ripple
    vec2 mouseDelta = p - uMouse;
    float mouseDist = length(mouseDelta);
    float mouseRipple = sin(mouseDist * 25.0 - uTime * 6.0) * exp(-mouseDist * 4.0) * 0.025;
    fluidWave += mouseRipple;

    float currentFluidLevel = baseFluidY + fluidWave;
    bool isInsideFluid = (p.y < currentFluidLevel);

    // Base glass orb interior color
    vec3 orbCol = vec3(0.03, 0.05, 0.1);

    if (isInsideFluid) {
      // Deep refractive liquid fluid
      float fluidDepthNorm = clamp((currentFluidLevel - p.y) / (orbR * 1.2), 0.0, 1.0);
      
      // Liquid base color with chromatic gradient
      vec3 liquidBase = mix(uFluidColor, uAccentColor, fluidDepthNorm * 0.45);
      
      // Liquid volume illumination and internal caustics
      float caustic = sin(p.x * 18.0 + p.y * 14.0 + uTime * 2.5)
                    * cos(p.x * 12.0 - p.y * 22.0 + uTime * 1.8);
      liquidBase += uFluidColor * (caustic * 0.12);

      // Micro-bubbles rising through the liquid when running
      if (uIsRunning > 0.5) {
        vec2 bGrid = vec2(p.x * 18.0, (p.y + uTime * 0.35) * 12.0);
        vec2 bId = floor(bGrid);
        vec2 bUv = fract(bGrid) - 0.5;
        float bRand = hash(bId);
        if (bRand > 0.65) {
          float bRadius = 0.12 * (bRand - 0.5);
          float bDist = length(bUv);
          if (bDist < bRadius) {
            float bGlow = pow(1.0 - bDist / bRadius, 2.0);
            liquidBase += vec3(0.6, 0.8, 1.0) * bGlow * 0.85;
          }
        }
      }

      // Fresnel depth shading
      orbCol = mix(orbCol, liquidBase, 0.88 + 0.12 * fluidDepthNorm);
    } else {
      // Upper dry chamber: ethereal glass condensation & subtle air refraction
      float dryAtmosphere = smoothstep(0.0, orbR * 0.5, p.y - currentFluidLevel);
      orbCol = mix(vec3(0.04, 0.07, 0.13), vec3(0.08, 0.12, 0.18), dryAtmosphere);
      // Soft chromatic dispersion in the dry chamber
      orbCol += vec3(refrR.x, refrG.y, refrB.x) * 0.15;
    }

    // -----------------------------------------------------------
    // Fluid Meniscus Line (where liquid meets air inside the sphere)
    // -----------------------------------------------------------
    float distToMeniscus = abs(p.y - currentFluidLevel);
    if (distToMeniscus < 0.038) {
      float meniscusGlow = 1.0 - distToMeniscus / 0.038;
      // Glowing liquid meniscus highlight line
      vec3 meniscusCol = vec3(0.7, 0.9, 1.0) + uFluidColor * 0.6;
      orbCol += meniscusCol * pow(meniscusGlow, 2.2) * 1.1;
    }

    // -----------------------------------------------------------
    // Liquid Glass Sphere Optics (Specularity, Fresnel & Glossy Rim)
    // -----------------------------------------------------------
    // Primary Key Light at upper-left (-0.4, 0.55, 0.72)
    vec3 lightDir1 = normalize(vec3(-0.4, 0.55, 0.72));
    float spec1 = pow(max(0.0, dot(reflect(-lightDir1, N), vec3(0.0, 0.0, 1.0))), 28.0);
    orbCol += vec3(spec1 * 0.85);

    // Secondary Rim Light at lower-right (0.45, -0.5, 0.6)
    vec3 lightDir2 = normalize(vec3(0.45, -0.5, 0.6));
    float spec2 = pow(max(0.0, dot(reflect(-lightDir2, N), vec3(0.0, 0.0, 1.0))), 16.0);
    orbCol += (uAccentColor * 0.5 + vec3(0.2)) * (spec2 * 0.45);

    // Outer Fresnel Glass Rim (Snell's curvature reflectance)
    float fresnel = pow(1.0 - max(0.0, dot(N, vec3(0.0, 0.0, 1.0))), 3.2);
    orbCol += vec3(0.7, 0.85, 1.0) * (fresnel * 0.75);

    // Inner Glass Bezel Drop Shadow
    float innerShadow = 1.0 - smoothstep(0.0, orbBezel * 0.6, distFromEdge);
    orbCol *= mix(1.0, 0.65, innerShadow * 0.4);

    // Anti-aliased composite of the round glass orb
    float orbAlpha = smoothstep(0.004, -0.002, sdOrb);
    col = mix(col, orbCol, orbAlpha);
  }

  // Final chromatic grade and specular ceiling
  gl_FragColor = vec4(col, 1.0);
}
`;
