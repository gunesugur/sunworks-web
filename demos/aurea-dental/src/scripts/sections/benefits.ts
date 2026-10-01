import { gsap } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

/** One sticky scene owns its horizontal travel. No negative margins or adjacent scene overlap. */
export function init(root:HTMLElement):()=>void {
 const track=root.querySelector<HTMLElement>('[data-benefits-track]');
 const cards=Array.from(root.querySelectorAll<HTMLElement>('[data-benefit-card]'));
 const progress=root.querySelector<HTMLElement>('[data-benefits-progress]');
 const media=root.querySelector<HTMLElement>('.benefits__media');
 if(!track||cards.length===0)return ()=>undefined;
 return withMotion(root,({desktop,reduce})=>{
  if(!desktop||reduce)return;
  let active=-1;
  const paint=(p:number)=>{
   const next=Math.round(p*(cards.length-1));
   if(next!==active){active=next;cards.forEach((c,i)=>c.classList.toggle('is-active',i===next));}
  };
  const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true,onUpdate:self=>paint(self.progress),onRefresh:self=>paint(self.progress)}});
  tl.fromTo(track,{x:0},{x:()=>-Math.max(0,track.scrollWidth-root.clientWidth),duration:1},0);
  if(progress)tl.fromTo(progress,{scaleX:0},{scaleX:1,duration:1},0);
  if(media)gsap.fromTo(media,{clipPath:'inset(12% 8% 12% 8% round 16px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:root,start:'top 85%',end:'top 15%',scrub:true}});
  return ()=>{cards.forEach(c=>c.classList.remove('is-active'));};
 });
}
