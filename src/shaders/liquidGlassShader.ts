export const vertexShaderSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  // Flip Y for texture coordinates if needed, but standard webgl texture coords:
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_background;
uniform vec2 u_resolution;
uniform vec2 u_glassCenter;
uniform vec2 u_glassSize;
uniform float u_radius;
uniform float u_thickness;
uniform float u_bezel;
uniform float u_ior;
uniform float u_dispersion;
uniform float u_blur;
uniform float u_specular;
uniform float u_tint;
uniform float u_shadow;
uniform float u_time;
uniform vec2 u_lightPos;
uniform vec2 u_velocity;
uniform float u_wobble;
uniform vec2 u_ripplePos;
uniform float u_rippleTime;
uniform float u_rippleActive;

// Signed distance function for a 2D rounded rectangle
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  // Pixel coordinates in screen space (origin at top-left)
  vec2 pixelCoord = gl_FragCoord.xy;
  pixelCoord.y = u_resolution.y - pixelCoord.y; // Match HTML top-left origin

  vec2 p = pixelCoord - u_glassCenter;
  vec2 halfSize = u_glassSize * 0.5;

  // Velocity stretch & squash (fluid deformation)
  float speed = length(u_velocity);
  vec2 velDir = speed > 0.001 ? normalize(u_velocity) : vec2(0.0);
  float stretch = clamp(speed * 0.015, 0.0, 0.4);
  
  // Transform p along velocity direction for jelly stretch
  float dotVP = dot(p, velDir);
  p += velDir * dotVP * stretch * 0.4 * u_wobble;

  // Clamped radius
  float maxRadius = min(halfSize.x, halfSize.y);
  float radius = min(u_radius, maxRadius);

  // Signed distance to glass boundary
  float d = sdRoundedBox(p, halfSize, radius);

  // Soft shadow underneath glass
  float shadowOffset = 22.0;
  vec2 shadowP = p - vec2(0.0, shadowOffset);
  float shadowD = sdRoundedBox(shadowP, halfSize + vec2(4.0), radius + 4.0);
  float shadowBlur = 38.0;
  float shadowFactor = 1.0 - smoothstep(-8.0, shadowBlur, shadowD);
  shadowFactor *= u_shadow * 0.55;

  // If outside the glass entirely (and outside shadow), just render background
  if (d > shadowBlur && shadowFactor <= 0.001) {
    fragColor = texture(u_background, v_uv);
    return;
  }

  // Base background color
  vec4 baseBg = texture(u_background, v_uv);

  if (d > 0.0) {
    // Outside glass: render background tinted with soft shadow
    vec3 col = baseBg.rgb * (1.0 - shadowFactor * 0.65);
    // Subtle caustic light rim just outside the glass
    float causticRim = smoothstep(6.0, 0.0, d) * (1.0 - smoothstep(0.0, 2.0, d)) * 0.18 * u_specular;
    col += vec3(causticRim);
    fragColor = vec4(col, baseBg.a);
    return;
  }

  // WE ARE INSIDE THE GLASS (d <= 0.0)
  float distFromEdge = -d;
  float bezelWidth = max(u_bezel, 4.0);
  float t = clamp(distFromEdge / bezelWidth, 0.0, 1.0);

  // Normal calculation for curved glass lens
  // Gradient of SDF gives outward 2D direction from center to edge
  float eps = 1.0;
  float d_dx = (sdRoundedBox(p + vec2(eps, 0.0), halfSize, radius) - sdRoundedBox(p - vec2(eps, 0.0), halfSize, radius)) / (2.0 * eps);
  float d_dy = (sdRoundedBox(p + vec2(0.0, eps), halfSize, radius) - sdRoundedBox(p - vec2(0.0, eps), halfSize, radius)) / (2.0 * eps);
  vec2 grad = normalize(vec2(d_dx, d_dy) + vec2(0.00001));

  // Bevel profile: smooth curved dome near edge, gentle spherical curve in center
  // Derivative of profile with respect to distance from edge
  float edgeSlope = pow(1.0 - t, 1.8) * 1.6;
  float centerSlope = (1.0 - t) * 0.15; // gentle lens magnification
  float slope = (edgeSlope + centerSlope) * (u_thickness / 30.0);

  // Fluid surface ripple wave
  vec2 rippleOffset = vec2(0.0);
  if (u_wobble > 0.01) {
    float wave = sin(p.x * 0.035 + u_time * 3.5) * cos(p.y * 0.035 + u_time * 2.8);
    float wave2 = cos(p.x * 0.07 - u_time * 2.1) * sin(p.y * 0.07 + u_time * 4.0);
    rippleOffset += vec2(wave, wave2) * 0.06 * u_wobble;
  }

  // Click shockwave ripple
  if (u_rippleActive > 0.5 && u_rippleTime > 0.0 && u_rippleTime < 3.0) {
    vec2 toRipple = p - u_ripplePos;
    float distR = length(toRipple);
    float waveSpeed = 160.0;
    float waveRadius = u_rippleTime * waveSpeed;
    float waveDist = abs(distR - waveRadius);
    float waveAmp = exp(-u_rippleTime * 1.5) * exp(-waveDist * 0.05);
    float rippleDeriv = -cos((distR - waveRadius) * 0.12) * waveAmp * 0.45;
    if (distR > 0.01) {
      rippleOffset += (toRipple / distR) * rippleDeriv;
    }
  }

  // 3D Surface normal pointing towards viewer (Z > 0)
  vec3 N = normalize(vec3(-grad * slope + rippleOffset, 1.0));

  // Incident light ray from eye (orthographic / camera view)
  vec3 I = vec3(0.0, 0.0, -1.0);

  // Snell's Law Refraction for Chromatic Dispersion (RGB split)
  float baseIor = max(u_ior, 1.05);
  float disp = u_dispersion * 0.04;
  float iorR = baseIor - disp;
  float iorG = baseIor;
  float iorB = baseIor + disp;

  vec3 refR = refract(I, N, 1.0 / iorR);
  vec3 refG = refract(I, N, 1.0 / iorG);
  vec3 refB = refract(I, N, 1.0 / iorB);

  // Displacement on background plane
  float distToBg = u_thickness * 1.6;
  vec2 dispR = (refR.xy / max(abs(refR.z), 0.1)) * distToBg;
  vec2 dispG = (refG.xy / max(abs(refG.z), 0.1)) * distToBg;
  vec2 dispB = (refB.xy / max(abs(refB.z), 0.1)) * distToBg;

  // In screen UV space
  vec2 uvR = v_uv + vec2(dispR.x, -dispR.y) / u_resolution;
  vec2 uvG = v_uv + vec2(dispG.x, -dispG.y) / u_resolution;
  vec2 uvB = v_uv + vec2(dispB.x, -dispB.y) / u_resolution;

  // Clamp UVs to avoid edge artifacts
  uvR = clamp(uvR, vec2(0.001), vec2(0.999));
  uvG = clamp(uvG, vec2(0.001), vec2(0.999));
  uvB = clamp(uvB, vec2(0.001), vec2(0.999));

  // Sample background with optional blur / frosting
  float rVal, gVal, bVal;
  if (u_blur > 0.2) {
    float blurRadius = (u_blur * 0.002);
    // 5-tap cross blur
    vec4 tapCenter = vec4(
      texture(u_background, uvR).r,
      texture(u_background, uvG).g,
      texture(u_background, uvB).b,
      1.0
    );
    vec4 tap1 = vec4(
      texture(u_background, uvR + vec2(blurRadius, 0.0)).r,
      texture(u_background, uvG + vec2(blurRadius, 0.0)).g,
      texture(u_background, uvB + vec2(blurRadius, 0.0)).b,
      1.0
    );
    vec4 tap2 = vec4(
      texture(u_background, uvR - vec2(blurRadius, 0.0)).r,
      texture(u_background, uvG - vec2(blurRadius, 0.0)).g,
      texture(u_background, uvB - vec2(blurRadius, 0.0)).b,
      1.0
    );
    vec4 tap3 = vec4(
      texture(u_background, uvR + vec2(0.0, blurRadius)).r,
      texture(u_background, uvG + vec2(0.0, blurRadius)).g,
      texture(u_background, uvB + vec2(0.0, blurRadius)).b,
      1.0
    );
    vec4 tap4 = vec4(
      texture(u_background, uvR - vec2(0.0, blurRadius)).r,
      texture(u_background, uvG - vec2(0.0, blurRadius)).g,
      texture(u_background, uvB - vec2(0.0, blurRadius)).b,
      1.0
    );
    vec4 blurred = tapCenter * 0.36 + (tap1 + tap2 + tap3 + tap4) * 0.16;
    rVal = blurred.r;
    gVal = blurred.g;
    bVal = blurred.b;
  } else {
    rVal = texture(u_background, uvR).r;
    gVal = texture(u_background, uvG).g;
    bVal = texture(u_background, uvB).b;
  }

  vec3 refractedColor = vec3(rVal, gVal, bVal);

  // Lighting & Specular reflections
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3((u_lightPos - pixelCoord), 350.0));
  vec3 H = normalize(L + V);

  // Sharp specular highlight
  float NdotH = max(dot(N, H), 0.0);
  float specSharp = pow(NdotH, 64.0) * u_specular * 1.5;
  // Broad glossy sheen
  float specBroad = pow(NdotH, 12.0) * u_specular * 0.28;
  float totalSpec = specSharp + specBroad;

  // Fresnel edge reflection (grazing angle brightness)
  float NdotV = max(dot(N, V), 0.0);
  float fresnel = pow(1.0 - NdotV, 3.5) * 0.55 * u_specular;

  // Internal bevel reflection (top specular rim and bottom darkening)
  float topHighlight = smoothstep(0.0, 1.0, -grad.y) * pow(1.0 - t, 1.5) * 0.45 * u_specular;
  float bottomShadow = smoothstep(0.0, 1.0, grad.y) * pow(1.0 - t, 1.8) * 0.35;

  // Chromatic rim tint on bevel
  vec3 rimRainbow = vec3(
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 0.0),
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 2.09),
    0.5 + 0.5 * sin(atan(grad.y, grad.x) * 1.0 + 4.18)
  );
  vec3 chromaticRim = rimRainbow * pow(1.0 - t, 2.0) * 0.3 * (u_dispersion / 2.0);

  // Color grading & tint
  vec3 tinted = mix(refractedColor, vec3(1.0, 1.0, 1.0), u_tint * 0.3);
  
  // Combine all layers
  vec3 finalColor = tinted;
  finalColor = mix(finalColor, finalColor * (1.0 - bottomShadow), 0.8);
  finalColor += vec3(topHighlight);
  finalColor += vec3(totalSpec);
  finalColor += vec3(fresnel);
  finalColor += chromaticRim;

  // Anti-aliased boundary blending
  float edgeAlpha = clamp(distFromEdge * 2.0, 0.0, 1.0);
  vec3 blended = mix(baseBg.rgb, finalColor, edgeAlpha);

  fragColor = vec4(blended, 1.0);
}
`;
