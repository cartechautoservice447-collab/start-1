export const studioVertexShader = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const studioFragmentShader = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

#define MAX_BOXES 8

uniform vec2 u_resolution;
uniform vec4 u_boxes[MAX_BOXES]; // xy = center in screen pixels, zw = size in screen pixels
uniform float u_radii[MAX_BOXES]; // corner radius per box
uniform int u_boxCount;
uniform float u_time;
uniform vec2 u_lightPos;
uniform float u_ior;
uniform float u_dispersion;
uniform float u_specular;
uniform float u_blur;
uniform vec2 u_ripplePos;
uniform float u_rippleTime;
uniform float u_rippleActive;
uniform int u_performanceMode; // 0 = High (fast), 1 = Ultra (full physics)

// Signed distance function for a 2D rounded rectangle
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Procedural high-fidelity deep cosmic backdrop matching the Studio design
vec3 renderBackdrop(vec2 uv) {
  // Midnight navy base
  vec3 col = vec3(0.024, 0.035, 0.082);

  // Deep royal cobalt glow (top-left / upper-middle)
  vec2 g1Pos = vec2(0.25, 0.78);
  float d1 = length(uv - g1Pos);
  float glow1 = exp(-d1 * 1.85);
  vec3 col1 = vec3(0.11, 0.28, 0.88); // Royal cobalt blue

  // Electric violet/magenta glow (top-right / middle-right)
  vec2 g2Pos = vec2(0.85, 0.65);
  float d2 = length(uv - g2Pos);
  float glow2 = exp(-d2 * 2.2);
  vec3 col2 = vec3(0.48, 0.12, 0.72); // Deep magenta purple

  // Center subtle atmospheric blue accent
  vec2 g3Pos = vec2(0.5, 0.45);
  float d3 = length(uv - g3Pos);
  float glow3 = exp(-d3 * 2.5);
  vec3 col3 = vec3(0.08, 0.18, 0.45);

  // Soft bottom ambient glow
  float bottomGlow = smoothstep(0.0, 0.5, 1.0 - uv.y) * 0.06;

  col += col1 * glow1 * 0.95;
  col += col2 * glow2 * 0.85;
  col += col3 * glow3 * 0.5;
  col += vec3(0.04, 0.06, 0.14) * bottomGlow;

  // Subtle animated cosmic aura
  float aura = sin(uv.x * 3.0 + u_time * 0.25) * cos(uv.y * 3.0 + u_time * 0.2) * 0.025;
  col += vec3(0.08, 0.05, 0.18) * aura;

  return clamp(col, 0.0, 1.0);
}

void main() {
  // Screen pixel coordinate (origin at top-left)
  vec2 pixelCoord = gl_FragCoord.xy;
  pixelCoord.y = u_resolution.y - pixelCoord.y;

  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Evaluate closest box SDF across all active glass panels
  float minD = 1e6;
  int closestBox = -1;
  vec2 localP = vec2(0.0);
  vec2 halfSize = vec2(0.0);
  float radius = 0.0;
  float totalShadowFactor = 0.0;

  for (int i = 0; i < MAX_BOXES; i++) {
    if (i >= u_boxCount) break;

    vec2 center = u_boxes[i].xy;
    vec2 size = u_boxes[i].zw;
    if (size.x <= 1.0 || size.y <= 1.0) continue;

    float r = u_radii[i];
    vec2 hSize = size * 0.5;
    float maxR = min(hSize.x, hSize.y);
    r = min(r, maxR);

    vec2 p = pixelCoord - center;
    float d = sdRoundedBox(p, hSize, r);

    // Soft drop shadow evaluation
    vec2 sP = p - vec2(0.0, 16.0);
    float sD = sdRoundedBox(sP, hSize + vec2(6.0), r + 6.0);
    float sBlur = 32.0;
    float sFactor = 1.0 - smoothstep(-6.0, sBlur, sD);
    totalShadowFactor += sFactor * 0.4;

    if (d < minD) {
      minD = d;
      closestBox = i;
      localP = p;
      halfSize = hSize;
      radius = r;
    }
  }

  totalShadowFactor = clamp(totalShadowFactor, 0.0, 0.65);
  vec3 baseBg = renderBackdrop(uv);

  // OUTSIDE ALL GLASS SURFACES
  if (minD > 0.0 || closestBox == -1) {
    vec3 outCol = baseBg * (1.0 - totalShadowFactor * 0.7);

    // Subtle caustic rim light directly outside the nearest glass edge
    float causticRim = smoothstep(5.0, 0.0, minD) * (1.0 - smoothstep(0.0, 2.0, minD)) * 0.16 * u_specular;
    outCol += vec3(causticRim);

    fragColor = vec4(outCol, 1.0);
    return;
  }

  // INSIDE A GLASS SURFACE (minD <= 0.0)
  float distFromEdge = -minD;
  float bezelWidth = max(radius * 0.75, 14.0);
  float t = clamp(distFromEdge / bezelWidth, 0.0, 1.0);

  // Normal calculation for curved glass lens via numerical gradient of SDF
  float eps = 1.0;
  float d_dx = (sdRoundedBox(localP + vec2(eps, 0.0), halfSize, radius) - sdRoundedBox(localP - vec2(eps, 0.0), halfSize, radius)) / (2.0 * eps);
  float d_dy = (sdRoundedBox(localP + vec2(0.0, eps), halfSize, radius) - sdRoundedBox(localP - vec2(0.0, eps), halfSize, radius)) / (2.0 * eps);
  vec2 grad = normalize(vec2(d_dx, d_dy) + vec2(0.00001));

  // Bezel curvature: steep dome at perimeter, gentle slope towards interior
  float edgeSlope = pow(1.0 - t, 2.0) * 1.5;
  float centerSlope = (1.0 - t) * 0.12;
  float slope = edgeSlope + centerSlope;

  // Liquid ripple wave
  vec2 rippleOffset = vec2(0.0);
  if (u_performanceMode == 1) {
    // Ultra mode: organic surface fluid breathing
    float wave = sin(localP.x * 0.04 + u_time * 2.8) * cos(localP.y * 0.04 + u_time * 2.2);
    rippleOffset += vec2(wave, wave) * 0.045;
  }

  // Interactive click/pointer ripple
  if (u_rippleActive > 0.5 && u_rippleTime > 0.0 && u_rippleTime < 2.5) {
    vec2 toRipple = localP - u_ripplePos;
    float distR = length(toRipple);
    float waveSpeed = 180.0;
    float waveRadius = u_rippleTime * waveSpeed;
    float waveDist = abs(distR - waveRadius);
    float waveAmp = exp(-u_rippleTime * 1.8) * exp(-waveDist * 0.06);
    float rippleDeriv = -cos((distR - waveRadius) * 0.14) * waveAmp * 0.5;
    if (distR > 0.01) {
      rippleOffset += (toRipple / distR) * rippleDeriv;
    }
  }

  // 3D normal vector
  vec3 N = normalize(vec3(-grad * slope + rippleOffset, 1.0));
  vec3 I = vec3(0.0, 0.0, -1.0);

  // Snell's Law Refraction with chromatic dispersion
  float baseIor = max(u_ior, 1.1);
  float disp = u_dispersion * 0.035;
  float iorR = baseIor - disp;
  float iorG = baseIor;
  float iorB = baseIor + disp;

  vec3 refR = refract(I, N, 1.0 / iorR);
  vec3 refG = refract(I, N, 1.0 / iorG);
  vec3 refB = refract(I, N, 1.0 / iorB);

  float distToBg = 35.0;
  vec2 dispR = (refR.xy / max(abs(refR.z), 0.1)) * distToBg;
  vec2 dispG = (refG.xy / max(abs(refG.z), 0.1)) * distToBg;
  vec2 dispB = (refB.xy / max(abs(refB.z), 0.1)) * distToBg;

  vec2 uvR = uv + vec2(dispR.x, -dispR.y) / u_resolution;
  vec2 uvG = uv + vec2(dispG.x, -dispG.y) / u_resolution;
  vec2 uvB = uv + vec2(dispB.x, -dispB.y) / u_resolution;

  // Sample backdrop with optical refraction
  float rVal = renderBackdrop(uvR).r;
  float gVal = renderBackdrop(uvG).g;
  float bVal = renderBackdrop(uvB).b;
  vec3 refractedColor = vec3(rVal, gVal, bVal);

  // Blinn-Phong dynamic specular highlights
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3((u_lightPos - pixelCoord), 300.0));
  vec3 H = normalize(L + V);

  float NdotH = max(dot(N, H), 0.0);
  float specSharp = pow(NdotH, 48.0) * u_specular * 1.6;
  float specBroad = pow(NdotH, 10.0) * u_specular * 0.35;
  float totalSpec = specSharp + specBroad;

  // Fresnel edge reflection
  float NdotV = max(dot(N, V), 0.0);
  float fresnel = pow(1.0 - NdotV, 3.2) * 0.65 * u_specular;

  // Top bezel highlight & bottom bevel shadow
  float topHighlight = smoothstep(0.0, 1.0, -grad.y) * pow(1.0 - t, 1.6) * 0.55 * u_specular;
  float bottomShadow = smoothstep(0.0, 1.0, grad.y) * pow(1.0 - t, 2.0) * 0.45;

  // Chromatic rim tint
  vec3 rimRainbow = vec3(
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 0.0),
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 2.09),
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 4.18)
  );
  vec3 chromaticRim = rimRainbow * pow(1.0 - t, 2.2) * 0.25 * (u_dispersion / 2.0);

  // Composite liquid glass layers
  // Subtle cool blue tint for futuristic glass plate feel
  vec3 tinted = mix(refractedColor, vec3(0.85, 0.92, 1.0), 0.12);
  tinted = mix(tinted, tinted * (1.0 - bottomShadow), 0.75);
  tinted += vec3(topHighlight);
  tinted += vec3(totalSpec);
  tinted += vec3(fresnel);
  tinted += chromaticRim;

  // Antialiased glass boundary
  float edgeAlpha = clamp(distFromEdge * 2.0, 0.0, 1.0);
  vec3 finalColor = mix(baseBg, tinted, edgeAlpha);

  fragColor = vec4(finalColor, 1.0);
}
`;
