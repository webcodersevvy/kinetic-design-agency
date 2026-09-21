var e=`
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

  vec3 base = vec3(0.039, 0.039, 0.043);
  vec3 lime = vec3(0.839, 1.0, 0.247);
  vec3 violet = vec3(0.482, 0.361, 1.0);
  vec3 orange = vec3(1.0, 0.302, 0.0);

  float dMouse = distance(uv, u_mouse);
  float mGlow = smoothstep(0.55, 0.0, dMouse);

  float vOrb = smoothstep(0.9, 0.0, distance(uv, vec2(0.8, 0.72)));
  float oOrb = smoothstep(0.9, 0.0, distance(uv, vec2(0.15, 0.2)));

  vec3 col = base;
  col += violet * vOrb * (0.35 + lines*0.35);
  col += orange * oOrb * (0.30 + (1.0-lines)*0.25);
  col += lime * mGlow * (0.25 + lines*0.45);
  col += vec3(1.0) * lines * 0.045;
  col += (lime * 0.06 + violet * 0.05) * fbm(st*3.0 + t);

  // subtle vignette
  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));
  col *= mix(0.75, 1.05, vig);

  gl_FragColor = vec4(col, 1.0);
}
`,t=`
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
`;function n(e,t){let n=e.createShader(e.VERTEX_SHADER);if(!n||(e.shaderSource(n,`
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)))return null;let r=e.createShader(e.FRAGMENT_SHADER);if(!r)return null;if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))return e.deleteShader(r),null;let i=e.createProgram();if(!i||(e.attachShader(i,n),e.attachShader(i,r),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS)))return null;e.useProgram(i);let a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let o=e.getAttribLocation(i,`a_pos`);return e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0),{program:i,loc:{u_res:e.getUniformLocation(i,`u_res`),u_time:e.getUniformLocation(i,`u_time`),u_mouse:e.getUniformLocation(i,`u_mouse`)}}}export{e as n,n as r,t};