if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
    if(r instanceof Array) r=r[0];
    r=Math.min(r,w/2,h/2);
    this.beginPath();
    this.moveTo(x+r,y);
    this.lineTo(x+w-r,y);
    this.quadraticCurveTo(x+w,y,x+w,y+r);
    this.lineTo(x+w,y+h-r);
    this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    this.lineTo(x+r,y+h);
    this.quadraticCurveTo(x,y+h,x,y+h-r);
    this.lineTo(x,y+r);
    this.quadraticCurveTo(x,y,x+r,y);
    this.closePath();
  };
}

const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
document.querySelectorAll('a,button,.contact-orb,.project-world,.skill-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
});
(function moveCursor(){
  rx += (mx-rx)*0.12; ry += (my-ry)*0.12;
  dot.style.left  = (mx-3)+'px'; dot.style.top  = (my-3)+'px';
  ring.style.left = (rx-16)+'px'; ring.style.top = (ry-16)+'px';
  requestAnimationFrame(moveCursor);
})();

window.addEventListener('scroll',()=>{
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  document.getElementById('progress').style.width = pct + '%';
});

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll(
  '.road-item,.flow-step,.skill-card,.project-world,.method-step,'+
  '.future-event,.contact-statement,.contact-sub,.contact-orbs'
).forEach(el => io.observe(el));

document.querySelectorAll('.skill-card').forEach((c,i)=>{
  c.style.transitionDelay = (i*0.05)+'s';
});

(function bgCanvas(){
  const c = document.getElementById('bg-canvas');
  const ctx = c.getContext('2d');
  let W,H,pts=[];
  function resize(){ W=c.width=window.innerWidth; H=c.height=window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for(let i=0;i<50;i++) pts.push({
    x:Math.random()*2000, y:Math.random()*2000,
    vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
    r:Math.random()*1.5+.3
  });
  let scrollY=0;
  window.addEventListener('scroll',()=>scrollY=window.scrollY);
  function draw(){
    ctx.clearRect(0,0,W,H);
    const scrollRatio = scrollY/(document.body.scrollHeight-window.innerHeight||1);
    const hue = 215 + scrollRatio*25;
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsla(${hue},75%,60%,0.25)`; ctx.fill();
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<140){
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`hsla(${hue},70%,60%,${0.07*(1-d/140)})`; ctx.lineWidth=.5; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();


(function dataCanvas(){
  const c = document.getElementById('data-canvas');
  const ctx = c.getContext('2d');
  function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
  resize();
  window.addEventListener('resize',resize);
  const particles=[];
  for(let i=0;i<80;i++) particles.push({
    x:Math.random()*2000, y:Math.random()*600,
    vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.2,
    s:Math.random()*3+1, a:Math.random()*.3+.05
  });
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>c.width) p.vx*=-1;
      if(p.y<0||p.y>c.height) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2);
      ctx.fillStyle=`rgba(37,99,235,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

function initProjectViz(){
  (function vizAir(){
    const c=document.getElementById('viz-air'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const aqi=[180,160,140,90,70,55,60,85,100,180,210,195];
    const colors=['#DC2626','#DC2626','#EA580C','#EAB308','#84CC16','#22C55E','#22C55E','#84CC16','#EAB308','#EA580C','#DC2626','#DC2626'];
    let phase=0;
    function draw(){
      ctx.clearRect(0,0,c.width,c.height);
      const W=c.width,H=c.height,pad=40,bw=(W-pad*2)/12-4;
      phase+=0.01;
      ctx.fillStyle='rgba(239,246,255,0.5)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center';
      ctx.fillText('Delhi AQI — Monthly Pattern',W/2,20);
      aqi.forEach((v,i)=>{
        const targetH=(v/250)*(H-pad-30);
        const x=pad+i*(bw+4); const bH=targetH*(0.85+0.15*Math.sin(phase+i*.3));
        const grad=ctx.createLinearGradient(0,H-pad-bH,0,H-pad);
        grad.addColorStop(0,colors[i]+'cc');
        grad.addColorStop(1,colors[i]+'44');
        ctx.fillStyle=grad;
        ctx.beginPath(); ctx.roundRect(x,H-pad-bH,bw,bH,3); ctx.fill();
        ctx.fillStyle='rgba(107,114,128,0.7)';
        ctx.font='8px Inter,sans-serif';
        ctx.fillText(months[i],x+bw/2,H-pad+12);
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizHeart(){
    const c=document.getElementById('viz-heart'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    let t=0;
    function draw(){
      t+=0.01;
      const W=c.width,H=c.height;
      ctx.fillStyle='rgba(255,241,242,0.5)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center'; ctx.fillText('Heart Rate Monitor',W/2,20);
      ctx.strokeStyle='rgba(244,63,94,0.1)'; ctx.lineWidth=1;
      for(let y=H*0.2;y<H*0.9;y+=H*0.15){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
      ctx.beginPath(); ctx.strokeStyle='#f43f5e'; ctx.lineWidth=2.5;
      for(let x=0;x<W;x++){
        const p=(x/W*4+t)%(1);
        let y=H/2;
        if(p<0.1) y=H/2;
        else if(p<0.15) y=H/2-H*0.1*(p-0.1)/0.05;
        else if(p<0.2) y=H/2-H*0.1+(H*0.3*(p-0.15)/0.05);
        else if(p<0.22) y=H/2+H*0.2-H*0.35*(p-0.2)/0.02;
        else if(p<0.28) y=H/2-H*0.15+(H*0.15*(p-0.22)/0.06);
        else if(p<0.35) y=H/2+H*0.02*(Math.sin((p-0.28)*Math.PI/0.07));
        else y=H/2;
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.9)';
      ctx.fillRect(W-90,H-40,80,28);
      ctx.fillStyle='#f43f5e'; ctx.font='bold 11px Inter,sans-serif';
      ctx.textAlign='right'; ctx.fillText('72 BPM',W-18,H-22);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizRealEstate(){
    const c=document.getElementById('viz-realestate'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    let t=0;
    const buildings=[];
    function reset(){
      buildings.length=0;
      const W=c.width, H=c.height;
      for(let i=0;i<18;i++){
        buildings.push({
          x: 20+i*(W-40)/18, w: (W-40)/20,
          h: H*0.2+Math.random()*H*0.6,
          price: Math.floor(40+Math.random()*120),
          color: `hsl(${140+Math.random()*60},${40+Math.random()*30}%,${45+Math.random()*15}%)`
        });
      }
    }
    reset();
    window.addEventListener('resize',reset);
    function draw(){
      t+=0.008;
      const W=c.width,H=c.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='rgba(240,253,244,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center'; ctx.fillText('Property Price Distribution',W/2,20);
      buildings.forEach((b,i)=>{
        const ph = b.h*(0.9+0.1*Math.sin(t+i*.4));
        const grad=ctx.createLinearGradient(0,H-40-ph,0,H-40);
        grad.addColorStop(0,b.color);

        grad.addColorStop(
            1,
            'rgba(34,197,94,0.20)'
        );
        ctx.fillStyle=grad;
        ctx.fillRect(b.x,H-40-ph,b.w,ph);
        if(b.w>12){
          ctx.fillStyle='rgba(255,255,255,0.5)';
          for(let wy=H-40-ph+8;wy<H-44;wy+=12){
            for(let wx=b.x+3;wx<b.x+b.w-3;wx+=8){
              ctx.fillRect(wx,wy,4,6);
            }
          }
        }
      });
      ctx.fillStyle='rgba(240,253,244,0.8)';
      ctx.fillRect(0,H-42,W,42);
      ctx.fillStyle='#166534'; ctx.font='9px Inter,sans-serif';
      ctx.textAlign='center'; ctx.fillText('Price (₹ Lakh)',W/2,H-12);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizKohli(){
    const c=document.getElementById('viz-kohli'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    const pts=[]; let t=0;
    function reset(){
      pts.length=0;
      for(let i=0;i<60;i++) pts.push({
        x:Math.random(),y:Math.random(),
        r:1+Math.random()*Math.random()*8,
        opp:Math.random()>.5?'home':'away',
        phase:Math.random()*Math.PI*2
      });
    }
    reset();
    function draw(){
      t+=0.012;
      const W=c.width,H=c.height,pad=40;
      ctx.fillStyle='rgba(255,251,235,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center'; ctx.fillText('Kohli — Runs vs Opposition (sized by avg)',W/2,20);
      ctx.strokeStyle='rgba(180,180,180,0.4)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad);
      ctx.lineTo(W-pad,H-pad); ctx.stroke();
      pts.forEach(p=>{
        const x=pad+p.x*(W-pad*2);
        const y=H-pad-p.y*(H-pad*2);
        const pulse=1+0.15*Math.sin(t+p.phase);
        ctx.beginPath();
        ctx.arc(x,y,p.r*pulse,0,Math.PI*2);
        ctx.fillStyle=p.opp==='home'?'rgba(245,158,11,0.65)':'rgba(37,99,235,0.5)';
        ctx.fill();
      });
      ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.beginPath(); ctx.arc(W-90,H-20,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(107,114,128,0.7)'; ctx.font='9px Inter,sans-serif'; ctx.textAlign='left';
      ctx.fillText('Home',W-80,H-17);
      ctx.fillStyle='rgba(37,99,235,0.7)'; ctx.beginPath(); ctx.arc(W-40,H-20,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(107,114,128,0.7)'; ctx.fillText('Away',W-30,H-17);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizJobs(){
    const c=document.getElementById('viz-jobs'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    let t=0;
    const skills=['Python','SQL','Power BI','Excel','Tableau','ML','Statistics','Git','Pandas','NumPy'];
    const nodes=[]; const edges=[];
    function reset(){
      nodes.length=0; edges.length=0;
      const W=c.width, H=c.height;
      skills.forEach((s,i)=>{
        nodes.push({
          x:W*.1+Math.random()*W*.8,
          y:H*.1+Math.random()*H*.8,
          label:s, r:8+Math.random()*10,
          phase:Math.random()*Math.PI*2
        });
      });
      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        if(Math.random()>.45) edges.push([i,j]);
      }
    }
    reset();
    window.addEventListener('resize',reset);
    function draw(){
      t+=0.01;
      const W=c.width,H=c.height;
      ctx.fillStyle='rgba(238,242,255,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center'; ctx.fillText('Skill Co-occurrence in Job Postings',W/2,20);
      edges.forEach(([a,b])=>{
        ctx.beginPath();
        ctx.moveTo(nodes[a].x,nodes[a].y);
        ctx.lineTo(nodes[b].x,nodes[b].y);
        ctx.strokeStyle='rgba(79,70,229,0.12)'; ctx.lineWidth=1; ctx.stroke();
      });
      nodes.forEach((n,i)=>{
        const pulse=1+0.15*Math.sin(t+n.phase);
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pulse,0,Math.PI*2);
        const h=220+i*8;
        ctx.fillStyle=`hsla(${h},70%,55%,0.75)`; ctx.fill();
        ctx.fillStyle='rgba(31,41,55,0.6)'; ctx.font='9px Inter,sans-serif';
        ctx.textAlign='center'; ctx.fillText(n.label,n.x,n.y+n.r*pulse+10);
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizScreen(){
    const c=document.getElementById('viz-screen'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    let t=0;
    const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const entertain=[3,2.5,2.8,3.2,4.5,6,5.5];
    const education=[1.5,1.8,1.6,2,1.2,1,1.3];
    function draw(){
      t+=0.008;
      const W=c.width,H=c.height,pad=40;
      ctx.fillStyle='rgba(240,249,255,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px Inter,sans-serif'; ctx.fillStyle='rgba(107,114,128,0.8)';
      ctx.textAlign='center'; ctx.fillText('Daily Screen Time (hours)',W/2,20);
      function drawArea(data,color,fill){
        ctx.beginPath();
        data.forEach((v,i)=>{
          const x=pad+i*(W-pad*2)/6;
          const y=H-pad-(v*(1+0.05*Math.sin(t+i)))/(8)*(H-pad-30);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        });
        ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();
        ctx.lineTo(pad+(data.length-1)*(W-pad*2)/6,H-pad);
        ctx.lineTo(pad,H-pad); ctx.closePath();
        ctx.fillStyle=fill; ctx.fill();
      }
      drawArea(entertain,'#0ea5e9','rgba(14,165,233,0.15)');
      drawArea(education,'#22c55e','rgba(34,197,94,0.15)');
      days.forEach((d,i)=>{
        const x=pad+i*(W-pad*2)/6;
        ctx.fillStyle='rgba(107,114,128,0.6)'; ctx.font='9px Inter,sans-serif';
        ctx.textAlign='center'; ctx.fillText(d,x,H-pad+14);
      });
      ctx.fillStyle='rgba(14,165,233,0.8)'; ctx.beginPath(); ctx.arc(W-100,H-18,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(107,114,128,0.7)'; ctx.font='9px Inter'; ctx.textAlign='left'; ctx.fillText('Entertainment',W-90,H-15);
      ctx.fillStyle='rgba(34,197,94,0.8)'; ctx.beginPath(); ctx.arc(W-100,H-5,5,0,Math.PI*2); ctx.fill();
      ctx.fillText('Education',W-90,H-2);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  (function vizNews(){
    const c=document.getElementById('viz-news'); if(!c) return;
    const ctx=c.getContext('2d');
    function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
    resize(); window.addEventListener('resize',resize);
    const headlines=[
      ['BREAKING:', 'Local man discovers data', 'has feelings — apologises'],
      ['EXCLUSIVE:', 'Python replaces coffee', 'as analyst fuel of 2025'],
      ['ALERT:', 'Excel pivot table achieves', 'sentience, demands respect'],
      ['UPDATE:', 'SQL query returns null', 'existential crisis follows'],
      ['REPORT:', 'Dashboard so beautiful,', 'stakeholders start crying']
    ];
    let hIdx=0, charIdx=0, lineIdx=0, pause=0, t=0;
    function draw(){
      t+=0.016;
      const W=c.width,H=c.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='rgba(254,252,232,0.7)'; ctx.fillRect(0,0,W,H);
      for(let i=0;i<3;i++){
        ctx.beginPath();
        ctx.arc(W/2+Math.cos(t+i*2.1)*W*.35,H/2+Math.sin(t*.7+i*2.1)*H*.3,6+i*3,0,Math.PI*2);
        ctx.fillStyle=`hsla(${40+i*30},80%,60%,0.2)`; ctx.fill();
      }
      const hl=headlines[hIdx];
      ctx.textAlign='center';
      ctx.fillStyle='#d97706'; ctx.font='bold 11px Inter,sans-serif';
      ctx.fillText(hl[0],W/2,H*0.32);
      ctx.fillStyle='rgba(17,24,39,0.85)'; ctx.font='500 13px Inter,sans-serif';
      ctx.fillText(hl[1],W/2,H*0.52);
      if(lineIdx>=1 || pause>0){
        ctx.font='300 12px Inter,sans-serif'; ctx.fillStyle='rgba(55,65,81,0.8)';
        ctx.fillText(hl[2].substring(0,charIdx),W/2,H*0.68);
      }
      if(Math.floor(t*2)%2===0){
        ctx.fillStyle='rgba(217,119,6,0.8)'; ctx.fillRect(W/2+50,H*0.64,2,14);
      }
      if(pause>0){ pause--; if(pause===0){hIdx=(hIdx+1)%headlines.length;charIdx=0;lineIdx=0;} }
      else if(lineIdx===0){ lineIdx=1; }
      else{ charIdx++; if(charIdx>hl[2].length){ pause=90; } }
      requestAnimationFrame(draw);
    }
    draw();
  })();
}

const projObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ initProjectViz(); projObserver.disconnect(); } });
},{threshold:0.05});
projObserver.observe(document.getElementById('scene-projects'));

(function methodCanvas(){
  const c=document.getElementById('method-canvas'); if(!c) return;
  const ctx=c.getContext('2d');
  c.width=c.offsetWidth; c.height=c.offsetHeight;
  const W=c.width,H=c.height;
  let t=0;
  const nodes=[
    {label:'Question',sub:'Define it precisely',y:0.1,color:'#2563EB'},
    {label:'Data',sub:'Collect & understand',y:0.25,color:'#4F46E5'},
    {label:'Clean',sub:'Decisions, not defaults',y:0.4,color:'#0EA5E9'},
    {label:'Explore',sub:'Find the surprise',y:0.55,color:'#0284C7'},
    {label:'Visualise',sub:'One idea per chart',y:0.7,color:'#2563EB'},
    {label:'Story',sub:'Non-technical clarity',y:0.85,color:'#4F46E5'},
  ];
  function draw(){
    t+=0.01;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(247,246,242,0.4)'; ctx.fillRect(0,0,W,H);
    nodes.forEach((n,i)=>{
      if(i<nodes.length-1){
        const y1=n.y*H+20, y2=nodes[i+1].y*H+20;
        const x=W/2;
        const pulse=0.3+0.2*Math.sin(t*2+i*.8);
        ctx.beginPath(); ctx.setLineDash([4,8]);
        ctx.moveTo(x,y1+22); ctx.lineTo(x,y2-22);
        ctx.strokeStyle=`rgba(37,99,235,${pulse})`; ctx.lineWidth=1.5; ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x-5,y2-25); ctx.lineTo(x,y2-15); ctx.lineTo(x+5,y2-25);
        ctx.strokeStyle=`rgba(37,99,235,${pulse})`; ctx.lineWidth=1.5; ctx.stroke();
      }
    });
    nodes.forEach((n,i)=>{
      const cy=n.y*H+20;
      const pulse=0.97+0.03*Math.sin(t+i*.5);
      const cw=W*0.7, cx=(W-cw)/2;
      ctx.fillStyle='rgba(255,255,255,0.95)';
      ctx.shadowColor='rgba(37,99,235,0.08)'; ctx.shadowBlur=16; ctx.shadowOffsetY=4;
      ctx.beginPath(); ctx.roundRect(cx,cy-18,cw*pulse,38,8); ctx.fill();
      ctx.shadowBlur=0; ctx.shadowOffsetY=0;
      ctx.strokeStyle=n.color+'44'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(cx,cy-18,cw*pulse,38,8); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+20,cy+2,6,0,Math.PI*2);
      ctx.fillStyle=n.color+'cc'; ctx.fill();
      ctx.fillStyle=n.color; ctx.font='500 12px Inter,sans-serif';
      ctx.textAlign='left'; ctx.fillText(n.label,cx+34,cy-2);
      ctx.fillStyle='rgba(107,114,128,0.8)'; ctx.font='300 10px Inter,sans-serif';
      ctx.fillText(n.sub,cx+34,cy+12);
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


(function futureCanvas(){
  const c=document.getElementById('future-canvas'); if(!c) return;
  const ctx=c.getContext('2d');
  function resize(){ c.width=c.offsetWidth; c.height=c.offsetHeight; }
  resize(); window.addEventListener('resize',resize);
  const stars=[]; let t=0;
  for(let i=0;i<120;i++) stars.push({
    x:Math.random(), y:Math.random(),
    r:Math.random()*.8+.2, a:Math.random()*.4+.05,
    phase:Math.random()*Math.PI*2
  });
  function draw(){
    t+=0.008;
    const W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      const a=s.a*(0.7+0.3*Math.sin(t+s.phase));
      ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(37,99,235,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

(function skillsNetwork(){

const canvas = document.getElementById("skills-network");
if(!canvas) return;

const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener("resize",resize);

const tooltip = document.getElementById("skill-tooltip");

const nodes = [

{
name:"Data Analytics",
x:0.52,
y:0.50,
projects:"The intersection of data, tools and storytelling"
},

{
name:"Python",
x:0.22,y:0.35,
projects:"AQI Analysis • Screen Time • Funny News Generator"
},

{
name:"SQL",
x:0.50,y:0.22,
projects:"Heart Disease • Job Market Analysis"
},

{
name:"Power BI",
x:0.80,y:0.45,
projects:"Heart Disease • Job Market"
},

{
name:"Excel",
x:0.30,y:0.55,
projects:"Early Analytics Work"
},

{
name:"Pandas",
x:0.17,y:0.75,
projects:"AQI • Screen Time"
},

{
name:"NumPy",
x:0.38,y:0.88,
projects:"Machine Learning • AQI"
},

{
name:"PostgreSQL",
x:0.35,y:0.37,
projects:"Job Market Analysis"
},

{
name:"Tableau",
x:0.70,y:0.50,
projects:"Real Estate Analysis"
},

{
name:"Statistics",
x:0.78,y:0.20,
projects:"Machine Learning"
},

{
name:"Git",
x:0.55,y:0.36,
projects:"All Projects"
},

{
name:"ML",
x:0.93,y:0.46,
projects:"Real Estate Prediction"
},

{
name:"Storytelling",
x:0.10,y:0.50,
projects:"Every Dashboard"
},

{name:"Data Cleaning",
x:0.85,y:0.75,
projects:"All Project"
},

{
  name:"Matplotlib",
  x:0.50,y:0.80,
  projects:"AQI • Heart Disease"
},

{
  name:"Seaborn",
  x:0.70,y:0.105,
  projects:"AQI • Heart Disease"
},

];

const links = [
[0,1],   
[0,2],
[0,3],
[0,4],
[0,7],
[0,8],
[0,9],
[0,12],
[0,13],
[0,14],
[0,15],

[1,5],
[1,6],
[1,14],
[1,15],
[1,7], 

[2,7],
[2,4],
[2,10],

[3,8],
[3,14],
[3,15],

[9,11],
[9,15],

[13,5],
[13,2],

[14,15],

[12,3],
[12,8],

[10,1],
[10,2]

];

let mouse = null;

canvas.addEventListener("mousemove",(e)=>{

const rect = canvas.getBoundingClientRect();

mouse = {
x:e.clientX-rect.left,
y:e.clientY-rect.top
};

});

canvas.addEventListener("mouseleave",()=>{

mouse=null;

tooltip.innerHTML=
"Hover over a skill to explore connections.";

});

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

let hovered = -1;

nodes.forEach((n,i)=>{

const x=n.x*canvas.width;
const y=n.y*canvas.height;

if(mouse){

const d=Math.hypot(mouse.x-x,mouse.y-y);

if(d<20) hovered=i;

}

});

links.forEach(([a,b])=>{

const A=nodes[a];
const B=nodes[b];

ctx.beginPath();

ctx.moveTo(
A.x*canvas.width,
A.y*canvas.height
);

ctx.lineTo(
B.x*canvas.width,
B.y*canvas.height
);

ctx.strokeStyle=
(hovered===a || hovered===b)
?
"rgba(37,99,235,.5)"
:
"rgba(37,99,235,.12)";

ctx.lineWidth=
(hovered===a || hovered===b)
?
2
:
1;

ctx.stroke();

});

nodes.forEach((n,i)=>{

const x=n.x*canvas.width;
const y=n.y*canvas.height;

const active = hovered===i;

ctx.beginPath();

ctx.arc(
x,
y,
active?12:8,
0,
Math.PI*2
);

ctx.fillStyle=
active
?
"#2563EB"
:
"rgba(37,99,235,.65)";

ctx.fill();

ctx.fillStyle=
"rgba(31,41,55,.75)";

ctx.font=
active
?
"600 14px Inter"
:
"500 12px Inter";

ctx.textAlign="center";

ctx.fillText(
n.name,
x,
y+28
);

if(active){

tooltip.innerHTML=
`
<strong>${n.name}</strong><br>
${n.projects}
`;

}

});

requestAnimationFrame(draw);

}

draw();

})();
