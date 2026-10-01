import { gsap, EASE } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

/** An aperture opens across the full-screen photo; typography follows its edges. */
export function init(root:HTMLElement):()=>void {
 const image=root.querySelector<HTMLElement>('[data-hero-image]');
 const lines=root.querySelectorAll<HTMLElement>('[data-hero-line]');
 const copy=root.querySelectorAll<HTMLElement>('[data-hero-copy]');
 const header=document.querySelector<HTMLElement>('[data-site-header]');
 if(!image)return ()=>undefined;
 return withMotion(root,({reduce})=>{
  const final=()=>{gsap.set([image,...lines,...copy,...(header?[header]:[])],{clearProps:'opacity,visibility,transform,clipPath'});if(header)gsap.set(header,{opacity:1});};
  if(reduce || window.scrollY>window.innerHeight*.25){final();return;}
  const tl=gsap.timeline({defaults:{ease:EASE.primary},onComplete:final});
  tl.fromTo(image,{clipPath:'inset(6% 43% 6% 43% round 20px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.15},0)
   .fromTo(image.querySelector('.mm__inner'),{scale:1.12},{scale:1,duration:1.4},0)
   .fromTo(lines,{yPercent:110},{yPercent:0,duration:.8,stagger:.09},.5)
   .fromTo(copy,{opacity:0,y:14},{opacity:1,y:0,duration:.65,stagger:.05},.75);
  if(header)tl.fromTo(header,{opacity:0},{opacity:1,duration:.45},.4);
  const finish=()=>tl.progress(1);
  ['wheel','touchstart','keydown'].forEach(e=>window.addEventListener(e,finish,{passive:true,once:true}));
  return ()=>{tl.kill();['wheel','touchstart','keydown'].forEach(e=>window.removeEventListener(e,finish));final();};
 });
}
