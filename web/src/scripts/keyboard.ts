// A code-drawn keyboard: no stock footage or external render assets.
const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
float roundedBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
vec2 scene(vec3 p){
  float a=-.28+pointer.x*.035;
  p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
  float base=roundedBox(p-vec3(0.,-.36,0.),vec3(7.52,.18,2.76),.13);
  vec3 q=p;
  float row=clamp(floor((q.z+2.32)/1.06),0.,4.);
  float z=row*1.06-2.12;
  float shift=mod(row,2.)*.14;
  float col=clamp(floor((q.x+7.1-shift)/1.06),0.,13.);
  float x=col*1.06-6.89+shift;
  q-=vec3(x,.12,z);
  float press=sin(time*.35+col*.6+row*.9)*.018;
  q.y+=press;
  float key=roundedBox(q,vec3(.435-.07*clamp(q.y+.22,0.,.5),.23,.424-.07*clamp(q.y+.22,0.,.5)),.065);
  float material=(col==0.&&row==0.)?2.:1.;
  if(row==4.&&col>3.&&col<9.){
    vec3 sp=p-vec3(-.05,.12,z); key=roundedBox(sp,vec3(2.47,.23,.415),.065);material=1.;
  }
  return key<base?vec2(key,material):vec2(base,0.);
}
vec3 normalAt(vec3 p){vec2 e=vec2(.004,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
float shadow(vec3 p,vec3 l){float r=1.;float t=.06;for(int i=0;i<18;i++){float h=scene(p+l*t).x;r=min(r,9.*h/t);t+=clamp(h,.08,.6);if(t>9.)break;}return clamp(r,.12,1.);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
  uv.x-=.18; uv.y+=.055;
  vec3 ro=vec3(6.9+sin(time*.06)*.35,6.1+pointer.y*.12,11.0);
  vec3 target=vec3(.0,-.2,0.);
  vec3 f=normalize(target-ro),r=normalize(cross(f,vec3(0,1,0))),u=cross(r,f);
  vec3 rd=normalize(f*1.65+r*uv.x+u*uv.y);
  float distance=0.;vec2 hit=vec2(0.);bool found=false;
  for(int i=0;i<70;i++){hit=scene(ro+rd*distance);if(hit.x<.006){found=true;break;}distance+=hit.x*.8;if(distance>35.)break;}
  vec3 color=vec3(.032);
  if(found){
    vec3 p=ro+rd*distance,n=normalAt(p),view=-rd;
    vec3 light=normalize(vec3(-.6,1.,.4));
    float diffuse=max(dot(n,light),0.);
    float sh=shadow(p+n*.025,light);
    float spec=pow(max(dot(reflect(-light,n),view),0.),38.);
    float rim=pow(1.-max(dot(n,view),0.),3.);
    vec3 albedo=hit.y>1.5?vec3(.82,.125,.07):vec3(.13,.135,.14);
    color=albedo*(.16+diffuse*sh*.9)+vec3(spec*.4*sh+rim*.08);
    color+=vec3(.14,.15,.16)*pow(max(dot(n,normalize(vec3(1.,.7,-1.))),0.),4.);
    float fog=1.-exp(-distance*.018);color=mix(color,vec3(.026),fog);
    color*=.64+.36*smoothstep(-1.,3.,p.z);
  }
  color=pow(max(color,0.),vec3(.9));
  color+=(hash(gl_FragCoord.xy+mod(time,3.))-.5)*.016;
  gl_FragColor=vec4(color,1.);
}`;

export function initKeyboard(canvas: HTMLCanvasElement) {
  const container = canvas.closest(".keyboard-scene");
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) return;
  function shader(type: number, source: string) {
    const result = gl!.createShader(type);
    if (!result) return null;
    gl!.shaderSource(result, source);
    gl!.compileShader(result);
    if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) {
      gl!.deleteShader(result);
      return null;
    }
    return result;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex),
    fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const res = gl.getUniformLocation(program, "resolution"),
    clock = gl.getUniformLocation(program, "time"),
    mouse = gl.getUniformLocation(program, "pointer");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    lastFrame = 0,
    visible = true,
    x = 0,
    y = 0,
    disposed = false;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(1, 1250 / Math.max(rect.width, rect.height));
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    draw(performance.now(), true);
  }
  function draw(now: number, force = false) {
    if (disposed) return;
    if (
      (force || (visible && !document.hidden)) &&
      (force || now - lastFrame > 65)
    ) {
      gl!.uniform2f(res, canvas.width, canvas.height);
      gl!.uniform1f(clock, motion.matches ? 8 : now / 1000);
      gl!.uniform2f(mouse, x, y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      lastFrame = now;
      container?.classList.add("is-ready");
    }
    if (!force && !motion.matches) frame = requestAnimationFrame(draw);
  }
  function animate() {
    cancelAnimationFrame(frame);
    if (!motion.matches) frame = requestAnimationFrame(draw);
    else draw(performance.now(), true);
  }
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false;
  });
  observer.observe(canvas);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const onPointer = (event: PointerEvent) => {
    x = event.clientX / innerWidth - 0.5;
    y = event.clientY / innerHeight - 0.5;
  };
  if (matchMedia("(pointer:fine)").matches)
    window.addEventListener("pointermove", onPointer, { passive: true });
  motion.addEventListener("change", animate);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    disposed = true;
    container?.classList.remove("is-ready");
  });
  window.addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      motion.removeEventListener("change", animate);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      disposed = true;
    },
    { once: true },
  );
  animate();
}
