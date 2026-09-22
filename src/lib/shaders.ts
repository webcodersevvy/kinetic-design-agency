// GLSL sources + minimal WebGL helper. No dependencies, SSR-safe (only run in browser).

export const HERO_VERT = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const HERO_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x),
             mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i=0;i<4;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = v_uv;
  vec2 st = uv * vec2(u_res.x/u_res.y, 1.0) * 2.2;
  float t = u_time * 0.22;

  float flow = fbm(st * 1.4 + vec2(t, -t*0.7) + fbm(st*2.0 - t)*0.9);
  float lines = smoothstep(0.35, 0.75, flow);

  vec3 base = vec3(0.059, 0.114, 0.098);
  vec3 ember = vec3(0.910, 0.267, 0.180);
  vec3 gold = vec3(0.914, 0.659, 0.145);
  vec3 fern = vec3(0.478, 0.627, 0.533);

  float dMouse = distance(uv, u_mouse);
  float mGlow = smoothstep(0.55, 0.0, dMouse);

  float vOrb = smoothstep(0.9, 0.0, distance(uv, vec2(0.8, 0.72)));
  float oOrb = smoothstep(0.9, 0.0, distance(uv, vec2(0.15, 0.2)));

  vec3 col = base;
  col += fern * vOrb * (0.35 + lines*0.35);
  col += ember * oOrb * (0.30 + (1.0-lines)*0.25);
  col += gold * mGlow * (0.25 + lines*0.45);
  col += vec3(1.0) * lines * 0.045;
  col += (gold * 0.06 + ember * 0.05) * fbm(st*3.0 + t);

  // subtle vignette
  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));
  col *= mix(0.75, 1.05, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const CTA_FRAG = /* glsl */ `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_res;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 uv = v_uv;
  float n = hash(floor(uv * u_res * 0.5) + floor(u_time*8.0));
  float diag = smoothstep(0.0,1.0, fract((uv.x+uv.y)*6.0 + u_time*0.15));
  vec3 col = vec3(0.0);
  col += diag * 0.06;
  col += (n-0.5) * 0.08;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createFullscreenProgram(
  gl: WebGLRenderingContext,
  fragSrc: string,
): { program: WebGLProgram; loc: Record<string, WebGLUniformLocation | null> } | null {
  const vert = gl.createShader(gl.VERTEX_SHADER);
  if (!vert) return null;
  gl.shaderSource(vert, HERO_VERT);
  gl.compileShader(vert);
  if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) return null;

  const frag = gl.createShader(gl.FRAGMENT_SHADER);
  if (!frag) return null;
  gl.shaderSource(frag, fragSrc);
  gl.compileShader(frag);
  if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
    gl.deleteShader(frag);
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  return {
    program,
    loc: {
      u_res: gl.getUniformLocation(program, 'u_res'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_mouse: gl.getUniformLocation(program, 'u_mouse'),
    },
  };
}
