(() => {
  'use strict';

  const S = getComputedStyle(document.documentElement);
  const get = (v, fb) => S.getPropertyValue(v).trim() || fb;

  const COLOR      = get('--dm-color', '57,125,254');
  const GAP        = parseFloat(get('--dm-gap', '8px'));
  const DOT_R      = parseFloat(get('--dm-dot-size', '2px')) / 2;
  const PULSE_FRAC = parseFloat(get('--dm-pulse-fraction', '0.08'));
  const HEIGHT     = get('--dm-height', '11%');
  const MAX_HEIGHT = get('--dm-max-height', '200px');
  const FADE_H     = get('--dm-fade-height', '50%');

  const BASE_OPS=[.06,.10,.16,.22,.30];
  const CYCLE_MIN=1500,CYCLE_MAX=3500,REST_MIN=1000,REST_MAX=4000,STOP_CHANCE=.15;
  const instances=[];let rafId=null;

  function loop(now){rafId=requestAnimationFrame(loop);for(let i=0;i<instances.length;i++)instances[i].draw(now);}
  function startLoop(){if(!rafId)rafId=requestAnimationFrame(loop);}

  function DotMatrix(canvas){
    const ctx=canvas.getContext('2d',{alpha:true});
    let dots=[],cols=0,rows=0,staticCanvas=null,staticCtx=null,staticDirty=true;

    function buildGrid(){
      const W=canvas.width=canvas.offsetWidth,H=canvas.height=canvas.offsetHeight;
      if(!W||!H)return;
      cols=Math.ceil(W/GAP)+1;rows=Math.ceil(H/GAP)+1;
      const total=cols*rows,pulseCount=Math.round(total*PULSE_FRAC);
      const idx=new Uint32Array(total);
      for(let i=0;i<total;i++)idx[i]=i;
      for(let i=total-1;i>0;i--){const j=(Math.random()*(i+1))|0,t=idx[i];idx[i]=idx[j];idx[j]=t;}
      const pulseSet=new Set(idx.subarray(0,pulseCount));
      dots=new Array(total);
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const i=r*cols+c,baseOp=BASE_OPS[(Math.random()*BASE_OPS.length)|0];
        const d={x:c*GAP+GAP/2,y:r*GAP+GAP/2,baseOp,pulse:false,startTime:0,cycleDur:0,peakOp:0,timer:null};
        if(pulseSet.has(i))activatePulse(d,true);
        dots[i]=d;
      }
      staticCanvas=document.createElement('canvas');
      staticCanvas.width=W;staticCanvas.height=H;
      staticCtx=staticCanvas.getContext('2d');staticDirty=true;
    }

    function activatePulse(d,rnd){d.pulse=true;d.cycleDur=CYCLE_MIN+Math.random()*(CYCLE_MAX-CYCLE_MIN);d.peakOp=.90+Math.random()*.10;d.startTime=performance.now()-(rnd?Math.random()*d.cycleDur:0);}
    function scheduleRest(d){d.pulse=false;if(d.timer)clearTimeout(d.timer);d.timer=setTimeout(()=>activatePulse(d,false),REST_MIN+Math.random()*(REST_MAX-REST_MIN));}
    function drawStatic(){staticCtx.clearRect(0,0,staticCanvas.width,staticCanvas.height);for(let i=0;i<dots.length;i++){const d=dots[i];if(d.pulse)continue;staticCtx.beginPath();staticCtx.arc(d.x,d.y,DOT_R,0,6.2832);staticCtx.fillStyle=`rgba(${COLOR},${d.baseOp})`;staticCtx.fill();}staticDirty=false;}

    this.draw=function(now){
      const W=canvas.width,H=canvas.height;if(!W||!H)return;
      if(staticDirty)drawStatic();
      ctx.clearRect(0,0,W,H);ctx.drawImage(staticCanvas,0,0);
      for(let i=0;i<dots.length;i++){
        const d=dots[i];if(!d.pulse)continue;
        const elapsed=(now-d.startTime)%d.cycleDur,t=elapsed/d.cycleDur;
        const sine=(Math.sin(t*6.2832-1.5708)+1)*.5;
        const op=d.baseOp+(d.peakOp-d.baseOp)*sine;
        if(elapsed<16&&Math.random()<STOP_CHANCE){scheduleRest(d);staticDirty=true;continue;}
        ctx.beginPath();ctx.arc(d.x,d.y,DOT_R,0,6.2832);ctx.fillStyle=`rgba(${COLOR},${op.toFixed(3)})`;ctx.fill();
      }
    };

    let resizeTimer;
    const ro=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(buildGrid,150);});
    ro.observe(canvas.parentElement);
    buildGrid();
  }

  function mountAll(){
    document.querySelectorAll('.dot-matrix').forEach(section => {
      if(section._dotMounted) return;
      section._dotMounted = true;

      let bg = '#0D0E0F';
      let el = section;
      while (el && el !== document.body.parentElement) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; }
        el = el.parentElement;
      }

      const wrap = document.createElement('div');
      wrap.style.cssText = `position:absolute;top:0;left:0;right:0;height:${HEIGHT};max-height:${MAX_HEIGHT};z-index:0;pointer-events:none;overflow:hidden`;

      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

      const fade = document.createElement('div');
      fade.style.cssText = `position:absolute;left:0;right:0;bottom:0;height:${FADE_H};background:linear-gradient(to bottom,transparent,${bg});pointer-events:none`;

      wrap.appendChild(canvas);
      wrap.appendChild(fade);
      section.insertBefore(wrap, section.firstChild);

      instances.push(new DotMatrix(canvas));
    });
    startLoop();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
