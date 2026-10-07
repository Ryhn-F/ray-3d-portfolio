// GLSL for the city. Colors authored in linear space; colorspace_fragment
// converts to the output space. No tone mapping so the glow keeps its punch.

export const COLORS = {
  bg: "#04050a",
  cyan: "#38f0ff",
  violet: "#8b6cff",
  mint: "#3dffc4",
  pink: "#ff5cc8",
};

/* ---------------- Buildings (instanced) ---------------- */
export const buildingVert = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vLocal;
varying vec3 vScale;
varying vec3 vTint;
varying float vSeed;

void main() {
  mat4 im = instanceMatrix;
  vec4 world = modelMatrix * im * vec4(position, 1.0);
  vWorld = world.xyz;
  vLocal = position;
  vScale = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
  vNormalW = normalize(mat3(im) * normal);
  vSeed = fract(sin(dot(im[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
  #ifdef USE_INSTANCING_COLOR
    vTint = instanceColor;
  #else
    vTint = vec3(0.0);
  #endif
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const buildingFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec4 uD[4];      // district: x, z, weight, hover
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform float uFx;

varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vLocal;
varying vec3 vScale;
varying vec3 vTint;
varying float vSeed;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec3 n = normalize(vNormalW);
  bool top = n.y > 0.5;
  float hgt = clamp(vWorld.y / 9.0, 0.0, 1.0);

  // base facade: near-black blue, a touch lighter with height
  vec3 base = mix(vec3(0.012, 0.020, 0.045), vec3(0.050, 0.080, 0.165), hgt);
  float lit = 0.5 + 0.7 * max(dot(n, normalize(vec3(0.35, 0.85, 0.4))), 0.0);
  vec3 col = base * lit * (0.8 + vTint.r * 0.6);

  // district glow field (active scene stop + skill hover)
  float glow = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 dd = vWorld.xz - uD[i].xy;
    float k = exp(-dot(dd, dd) / 110.0);
    glow += k * (uD[i].z + uD[i].w * 0.9);
  }

  // windows
  if (!top) {
    float along = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
    vec2 g = vec2(along * 1.7, vWorld.y * 1.25);
    vec2 id = floor(g);
    vec2 f = fract(g);
    float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.76);
    float r = hash(id + vSeed * 57.0 + (n.x > 0.5 ? 13.0 : (n.z > 0.5 ? 29.0 : 5.0)));
    float on = step(0.58 - glow * 0.2, r);
    float flick = 0.78 + 0.22 * sin(uTime * (0.5 + r * 2.2) + r * 40.0);
    vec3 wc = mix(vec3(0.10, 0.62, 0.85), vec3(0.95, 0.72, 0.45), step(0.72, hash(id + 3.1)));
    wc = mix(wc, uViolet * 1.2, step(0.9, hash(id + 9.7)));
    col += wc * win * on * flick * (0.9 + glow * 1.1) * smoothstep(0.2, 1.4, vWorld.y);
  }

  // glowing edges (roof perimeter + vertical corners), thickness in world units
  vec3 d = (0.5 - abs(vLocal)) * vScale;
  float edgeD = top ? min(d.x, d.z) : (abs(n.x) > 0.5 ? min(d.z, d.y) : min(d.x, d.y));
  float eline = 1.0 - smoothstep(0.0, 0.09, edgeD);
  float emask = smoothstep(0.15, 0.7, vWorld.y);
  float eAmt = eline * emask * (top ? 1.0 : 0.6);
  vec3 ecol = mix(uCyan, uViolet, clamp(vTint.g * 4.0 + hgt * 0.35, 0.0, 1.0));
  col += ecol * eAmt * (0.55 + glow * 1.8);

  // roof sheen
  if (top) col += ecol * 0.05 * (0.4 + glow);

  // traveling scan pulse from the city center
  float r0 = mod(uTime * 14.0, 120.0);
  float ring = exp(-pow((length(vWorld.xz) - r0) / 3.2, 2.0));
  col += uCyan * ring * (0.1 + eAmt * 0.9) * uFx;

  // district aura wash
  col += mix(uCyan, uViolet, 0.35) * glow * 0.035 * (0.3 + hgt);

  float depth = length(vWorld - cameraPosition);
  col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, depth));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/* ---------------- Ground ---------------- */
export const groundVert = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const groundFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uCyan;
uniform vec3 uMint;
uniform vec4 uD[4];
varying vec3 vW;

float line(float c, float w) {
  float d = abs(fract(c - 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, w, d);
}

void main() {
  vec2 p = vW.xz;
  float fade = 1.0 - smoothstep(40.0, 150.0, length(p));

  float minor = max(line(p.x / 2.4, 0.03), line(p.y / 2.4, 0.03));
  float rx = line(p.x / 14.4, 0.035); // roads running along z
  float rz = line(p.y / 14.4, 0.035); // roads running along x
  float road = max(rx, rz);

  // traffic streaks
  float idX = floor(p.x / 14.4 + 0.5);
  float idZ = floor(p.y / 14.4 + 0.5);
  float tx = step(0.955, fract(p.y * 0.07 - uTime * (0.25 + 0.1 * mod(idX, 3.0)) + idX * 0.37)) * rx;
  float tz = step(0.955, fract(p.x * 0.07 + uTime * (0.22 + 0.1 * mod(idZ, 3.0)) + idZ * 0.53)) * rz;
  float traffic = max(tx, tz);

  vec3 col = vec3(0.003, 0.005, 0.012);
  col += uCyan * minor * 0.035 * fade;
  col += uCyan * road * 0.14 * fade;
  col += mix(uMint, vec3(1.0), 0.35) * traffic * 0.9 * fade;

  float r0 = mod(uTime * 14.0, 120.0);
  col += uCyan * exp(-pow((length(p) - r0) / 2.6, 2.0)) * 0.22;

  for (int i = 0; i < 4; i++) {
    vec2 dd = p - uD[i].xy;
    float k = exp(-dot(dd, dd) / 40.0);
    col += uCyan * k * (0.05 + uD[i].z * 0.35 + uD[i].w * 0.3);
  }

  float depth = length(vW - cameraPosition);
  col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, depth));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/* ---------------- Beam (light column above a landmark) ---------------- */
export const beamVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const beamFrag = /* glsl */ `
uniform float uTime;
uniform float uW;
uniform vec3 uColor;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float h = 1.0 - vUv.y;
  float bands = 0.75 + 0.25 * sin(vUv.y * 40.0 - uTime * 3.0);
  float a = rim * pow(h, 1.4) * bands * (0.10 + uW * 0.55);
  gl_FragColor = vec4(uColor * a * 1.6, a);
  #include <colorspace_fragment>
}
`;

/* ---------------- Particles (landmark sparks) ---------------- */
export const sparkVert = /* glsl */ `
uniform float uTime;
uniform float uPx;
uniform vec4 uW[4]; // weight in x
attribute vec4 aData; // x=centerX, y=centerZ, z=phase, w=index
varying float vA;
varying float vIdx;
void main() {
  float idx = aData.w;
  float w = idx < 0.5 ? uW[0].x : (idx < 1.5 ? uW[1].x : (idx < 2.5 ? uW[2].x : uW[3].x));
  float ph = aData.z;
  float t = fract(ph + uTime * (0.05 + ph * 0.05));
  float ang = ph * 6.2831 * 3.0 + uTime * (0.6 + ph);
  float r = 1.2 + ph * 3.2 * (0.6 + t * 0.6);
  vec3 p = vec3(aData.x + cos(ang) * r, 0.5 + t * 20.0, aData.y + sin(ang) * r);
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (2.2 + ph * 3.0) * (0.5 + w) / max(1.0, -mv.z * 0.06);
  vA = (1.0 - t) * smoothstep(0.0, 0.1, t) * (0.25 + w * 0.9);
  vIdx = idx;
}
`;

export const sparkFrag = /* glsl */ `
uniform vec3 uC[4];
varying float vA;
varying float vIdx;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vA;
  vec3 col = vIdx < 0.5 ? uC[0] : (vIdx < 1.5 ? uC[1] : (vIdx < 2.5 ? uC[2] : uC[3]));
  gl_FragColor = vec4(col * 1.6, a);
  #include <colorspace_fragment>
}
`;

/* ---------------- Sky dome ---------------- */
export const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 w = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * w;
  gl_Position.z = gl_Position.w; // always at far plane
}
`;

export const skyFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uBg;
varying vec3 vDir;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main() {
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 horizon = vec3(0.018, 0.030, 0.085);
  vec3 col = mix(horizon, uBg, pow(h, 0.55));
  // violet haze in one direction
  float haze = pow(max(dot(normalize(vDir), normalize(vec3(-0.5, 0.18, -0.85))), 0.0), 6.0);
  col += vec3(0.10, 0.035, 0.22) * haze * (1.0 - h * 0.6);
  col += vec3(0.0, 0.06, 0.10) * pow(1.0 - h, 6.0);
  // stars
  vec3 q = floor(vDir * 220.0);
  float s = hash(q);
  float star = step(0.9965, s) * smoothstep(0.0, 0.25, h);
  col += vec3(0.7, 0.85, 1.0) * star * (0.5 + 0.5 * sin(uTime * 1.5 + s * 50.0));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/* ---------------- Dust ---------------- */
export const dustVert = /* glsl */ `
uniform float uTime;
uniform float uPx;
attribute vec4 aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.15 + aSeed.x * 20.0) * 3.0;
  p.y = mod(p.y + uTime * (0.4 + aSeed.y), 34.0);
  p.z += cos(uTime * 0.12 + aSeed.z * 20.0) * 3.0;
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (1.4 + aSeed.w * 2.0) / max(1.0, -mv.z * 0.05);
  vA = (0.15 + aSeed.w * 0.35) * smoothstep(0.0, 4.0, p.y) * (1.0 - smoothstep(26.0, 34.0, p.y));
}
`;

export const dustFrag = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vA;
  gl_FragColor = vec4(uColor * 1.3, a);
  #include <colorspace_fragment>
}
`;
