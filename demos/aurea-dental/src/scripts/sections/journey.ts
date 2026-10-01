import {gsap,ScrollTrigger,EASE} from '../../motion/tokens';
import {withMotion} from '../../motion/media';
import {scrollToTarget} from '../../motion/smooth-scroll';

/** Five chapters share a treatment desk; the visitor can scrub or choose a chapter. */
export function init(root:HTMLElement):()=>void {
 const stories=Array.from(root.querySelectorAll<HTMLElement>('[data-journey-story]'));
 const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-journey-step]'));
 const nav=root.querySelector<HTMLElement>('[data-journey-nav]');
 const progress=root.querySelector<HTMLElement>('[data-journey-progress]');
 if(stories.length<2||!nav)return ()=>undefined;
 let trigger:ScrollTrigger|null=null;
 const jump=(i:number)=>{if(!trigger)return;const y=trigger.start+(trigger.end-trigger.start)*(i/(stories.length-1));scrollToTarget(y);};
 const click=(e:Event)=>{const b=(e.target as Element).closest<HTMLButtonElement>('[data-journey-step]');if(b)jump(Number(b.dataset.journeyStep));};
 const key=(e:KeyboardEvent)=>{const i=buttons.indexOf(document.activeElement as HTMLButtonElement);if(i<0)return;const next={ArrowRight:(i+1)%buttons.length,ArrowLeft:(i-1+buttons.length)%buttons.length,Home:0,End:buttons.length-1}[e.key];if(next===undefined)return;e.preventDefault();buttons[next]?.focus({preventScroll:true});jump(next);};
 nav.addEventListener('click',click);nav.addEventListener('keydown',key);
 const motion=withMotion(root,({desktop,reduce})=>{
  if(!desktop||reduce)return;
  let active=0;
  const select=(next:number,instant=false)=>{
   if(next===active&&!instant)return;
   const prev=active;active=next;
   gsap.killTweensOf(stories);
   stories.forEach((s,i)=>{s.setAttribute('aria-hidden',String(i!==next));if(i!==prev&&i!==next)gsap.set(s,{autoAlpha:0});});
   buttons.forEach((b,i)=>i===next?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
   if(instant){gsap.set(stories,{autoAlpha:i=>i===next?1:0});return;}
   gsap.to(stories[prev]!,{autoAlpha:0,y:-12,duration:.22,ease:EASE.soft});
   gsap.fromTo(stories[next]!,{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:.42,ease:EASE.primary});
  };
  select(0,true);
  trigger=ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:self=>{select(Math.round(self.progress*(stories.length-1)));if(progress)gsap.set(progress,{scaleX:self.progress});},onRefresh:self=>select(Math.round(self.progress*(stories.length-1)),true)});
  return ()=>{trigger=null;gsap.killTweensOf(stories);stories.forEach(s=>{s.removeAttribute('aria-hidden');['opacity','visibility','transform','translate','rotate','scale'].forEach(p=>s.style.removeProperty(p));});buttons.forEach(b=>b.removeAttribute('aria-current'));};
 });
 return ()=>{motion();nav.removeEventListener('click',click);nav.removeEventListener('keydown',key);};
}
