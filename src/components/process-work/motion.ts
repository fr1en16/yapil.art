import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// A single scroll coordinate drives the road, rolling polygon, and card reveals.
export function initProcessWork() {
  const root = document.querySelector<HTMLElement>('.process-work');
  if (!root) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduce.matches) {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.from(element, { opacity: 0, filter: 'blur(10px)', y: 15, duration: .65,
        scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
    });
  }
  media.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
    const section = root.querySelector<HTMLElement>('.process-section')!;
    const stage = root.querySelector<HTMLElement>('.process-stage')!;
    const cards = gsap.utils.toArray<HTMLElement>('.process-card', root);
    const canvas = root.querySelector<HTMLCanvasElement>('.road-canvas')!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0;
    const state = { progress: .1 };
    const clamp = gsap.utils.clamp(0, 1);
    const smooth = (t: number) => t * t * (3 - 2 * t);

    function draw() {
      if (!ctx || !width || !height) return;
      const p = state.progress;
      cards.forEach((card, i) => {
        const visible = clamp(p / (.28 + i * .14));
        card.style.clipPath = `inset(${(1 - visible) * 100}% 0 0 0)`;
      });
      ctx.clearRect(0, 0, width, height);
      const t = clamp((p - .25) / .75);
      const radius = Math.min(width, window.innerHeight) * .13;
      const x = -radius + t * width;
      const entry = 2 * radius / width;
      const morph = smooth(clamp((t - entry) / (1 - entry)));
      const sides = 4 + 8 * clamp(morph / .3);
      const circular = smooth(clamp((morph - .3) / .7));
      const lo = Math.floor(sides), hi = Math.min(12, lo + 1), frac = sides - lo;
      const side = 2 * radius * ((1-frac)*Math.sin(Math.PI/lo)+frac*Math.sin(Math.PI/hi));
      const apothem = radius*((1-frac)*Math.cos(Math.PI/lo)+frac*Math.cos(Math.PI/hi));
      // Keep the road above the tallest text column on short desktop viewports.
      const copyHeight = Math.max(...cards.map(card => card.querySelector<HTMLElement>('.step-copy')!.offsetHeight));
      const roadY = Math.min(height * .52, height - copyHeight - 48);
      const axleY = roadY - apothem - (radius-apothem)*circular;
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px=0;px<=width;px+=2) {
        const local = ((px + radius + side/2) % side) - side/2;
        const y = roadY + apothem * (Math.cosh(local/apothem)-1)*(1-circular);
        if(px===0) ctx.moveTo(px,y); else ctx.lineTo(px,y);
      }
      ctx.stroke();
      // Insert a vertex into one edge, then interpolate to the next regular polygon.
      const polygon = (n:number) => Array.from({length:n},(_,i)=> {
        const angle=Math.PI/2+2*Math.PI*i/n;return [Math.cos(angle)*radius,Math.sin(angle)*radius];
      });
      const base=polygon(lo), target=polygon(hi);
      const start=hi===lo ? base : [base[0],[(base[0][0]+base[1][0])/2,(base[0][1]+base[1][1])/2],...base.slice(1)];
      const verts=start.map((v,i)=>[v[0]+(target[i][0]-v[0])*frac,v[1]+(target[i][1]-v[1])*frac]);
      ctx.save();ctx.translate(x,axleY);ctx.rotate(t*width/side*(2*Math.PI/sides)-Math.PI/sides);
      ctx.beginPath();
      for(let i=0;i<=360;i++) {
        const index=i/360*verts.length, a=Math.floor(index)%verts.length,b=(a+1)%verts.length,f=index-Math.floor(index);
        let vx=verts[a][0]+(verts[b][0]-verts[a][0])*f,vy=verts[a][1]+(verts[b][1]-verts[a][1])*f;
        const length=Math.hypot(vx,vy), scale=1+(radius/length-1)*circular;vx*=scale;vy*=scale;
        if(i===0)ctx.moveTo(vx,vy);else ctx.lineTo(vx,vy);
      }
      ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.lineWidth=1;ctx.setLineDash([5,10]);ctx.beginPath();ctx.moveTo(0,axleY);ctx.lineTo(width,axleY);ctx.stroke();ctx.restore();
    }
    function resize() {
      width=stage.clientWidth;height=stage.clientHeight;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      ctx!.setTransform(dpr,0,0,dpr,0,0);draw();
    }
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();
    gsap.fromTo(state,{progress:.1},{progress:1,ease:'none',onUpdate:draw,scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.25}});

    const work=root.querySelector<HTMLElement>('.work-section')!;
    const pin=root.querySelector<HTMLElement>('.work-pin')!;
    const items=gsap.utils.toArray<HTMLButtonElement>('.work-item', root);
    const slides=gsap.utils.toArray<HTMLAnchorElement>('.work-slide', root);
    const images=slides.map(slide=>slide.querySelector('img')!);
    gsap.set(items,{opacity:.28});gsap.set(slides,{clipPath:'inset(100% 0 0 100%)'});gsap.set(images,{scale:1.1});
    const timeline=gsap.timeline();
    slides.forEach((slide,i)=> {
      timeline.to(slide,{clipPath:'inset(0% 0 0 0%)',duration:.8,ease:'power2.inOut'},i)
        .to(images[i],{scale:1,duration:.8,ease:'none'},i)
        .to(items[i],{opacity:1,duration:.28},i);
      if(i)timeline.to(images[i-1],{scale:1.2,duration:.8,ease:'none'},i).to(items[i-1],{opacity:.28,duration:.28},i);
    });
    timeline.to({}, {duration:.2});
    let active=-1;
    const updateActive = () => {
      const next=Math.max(0,Math.min(2,Math.floor(timeline.time()-.4)));
      if(next===active)return;active=next;
      slides.forEach((slide,i)=>{slide.inert=i!==active;items[i].setAttribute('aria-pressed',String(i===active));});
    };
    timeline.eventCallback('onUpdate',updateActive);
    updateActive();
    const trigger=ScrollTrigger.create({trigger:work,pin,animation:timeline,start:'top top',end:()=>`+=${innerHeight*3}`,scrub:.8,invalidateOnRefresh:true,
      snap:{snapTo:[0,1/3,2/3,1],duration:{min:.35,max:.55},delay:.08,inertia:false}});
    const clickHandlers=items.map((item,i)=> {
      const listener=()=>{
        const top=trigger.start+(trigger.end-trigger.start)*(i+1)/3;
        const lenis=(window as Window & {lenis?: {scrollTo: (target:number, options:{duration:number})=>void}}).lenis;
        if(lenis) lenis.scrollTo(top,{duration:.8});
        else window.scrollTo({top,behavior:'smooth'});
      };
      item.addEventListener('click',listener);return listener;
    });
    const pointerHandlers=slides.map(slide=> {
      const cta=slide.querySelector<HTMLElement>('.project-cta')!;
      const listener=(event:PointerEvent)=>{const rect=slide.getBoundingClientRect();cta.style.left=`${event.clientX-rect.left}px`;cta.style.top=`${event.clientY-rect.top}px`;};
      slide.addEventListener('pointermove',listener);return listener;
    });
    return ()=>{observer.disconnect();cards.forEach(card=>card.style.removeProperty('clip-path'));items.forEach((item,i)=>{item.removeEventListener('click',clickHandlers[i]);item.removeAttribute('aria-pressed');});slides.forEach((slide,i)=>{slide.inert=false;slide.removeEventListener('pointermove',pointerHandlers[i]);});};
  });
  window.addEventListener('pagehide',()=>media.revert(),{once:true});
}
