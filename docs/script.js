const queue=[];

const scenarios = {
  scenario1: function(){
    queue.length=0;
    document.querySelector('#queueTable tbody').innerHTML='';
    const o={step:1, type:'Buff', unit:1, value:50, turns:2};
    queue.push(o); addRow(o);
  },
  scenario2: function(){
    queue.length=0;
    document.querySelector('#queueTable tbody').innerHTML='';
    const o1={step:1, type:'Heavy', unit:1, turns:1};
    const o2={step:1, type:'Buff', unit:1, value:50, turns:1};
    [o1,o2].forEach(o=>{queue.push(o); addRow(o);});
  },
  scenario3: function(){
    queue.length=0;
    document.querySelector('#queueTable tbody').innerHTML='';
    const o1={step:1, type:'Buff', unit:1, value:50, turns:1};
    const o2={step:1, type:'Heavy', unit:1, turns:1};
    [o1,o2].forEach(o=>{queue.push(o); addRow(o);});
  },
  scenario4: function(){
    queue.length=0;
    document.querySelector('#queueTable tbody').innerHTML='';
    const o={step:3, type:'Buff', unit:1, value:50, turns:2};
    queue.push(o); addRow(o);
  }
};

function n(id){const v=parseInt(document.getElementById(id).value,10);return isNaN(v)?null:v;}

function addRow(obj){
  const tb=document.querySelector('#queueTable tbody');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${obj.step}</td><td>${obj.type}</td><td>${obj.unit||'-'}</td><td>${obj.value||'-'}</td><td>${obj.turns||'-'}</td><td>✕</td>`;
  tr.querySelector('td:last-child').onclick=()=>{tb.removeChild(tr); queue.splice(queue.indexOf(obj),1);};
  tb.appendChild(tr);
}

document.getElementById('loadScenario').onclick=()=>{
  const sc = document.getElementById('scenarioSelect').value;
  if(scenarios[sc]) scenarios[sc]();
};

function openPanel(step, unit){
  document.getElementById('panelStep').value=step;
  document.getElementById('panelUnit').value=unit;
  document.getElementById('panelType').value='Buff';
  togglePanelFields();
  document.getElementById('panel').classList.add('open');
}

function closePanel(){ document.getElementById('panel').classList.remove('open'); }
function togglePanelFields(){
  const t=document.getElementById('panelType').value;
  document.getElementById('panelValGroup').style.display=(t==='Heavy'?'none':'block');
  document.getElementById('panelTurnsGroup').style.display=(t==='AV'?'none':'block');
}

document.getElementById('panelClose').addEventListener('click', closePanel);
document.getElementById('panelType').addEventListener('change', togglePanelFields);
document.getElementById('panelAdd').addEventListener('click', ()=>{
document.getElementById('panelAdd').addEventListener('click', ()=>{
  const step=n('panelStep'), unit=n('panelUnit');
  const type=document.getElementById('panelType').value;
  const value=n('panelVal'), turns=n('panelTurns');
  const obj={step,type,unit,value,turns,remaining:turns,appliedActions:0,active:false};
  queue.push(obj); addRow(obj); closePanel();
});

document.getElementById('simulate').addEventListener('click', simulate);

function simulate(){
  const startY=window.scrollY;
  const base=[]; for(let i=1;i<=10;i++){const v=parseInt(document.getElementById('agi'+i).value,10); base.push(isNaN(v)?0:v);} 
  const eff=Array.from({length:10},()=>[]);
  const av=new Array(10).fill(0);
  const tbody=document.querySelector('#log-table tbody'); tbody.innerHTML='';
  const q=[...queue].sort((a,b)=>a.step-b.step); let qi=0;
  for(let step=1;step<=50;step++){
    // enqueue effects
    while(qi<q.length&&q[qi].step===step){
      const e=q[qi];
      eff[e.unit-1].push({...e,remaining:e.turns,appliedActions:0,active:false});
      qi++;
    }
    // compute
    for(let i=0;i<10;i++){
      let delta=0;
      eff[i].forEach(x=>{
        if(x.active&&x.remaining>0){
          if(x.type==='Buff') delta+=Math.floor(base[i]*x.value);
          else if(x.type==='Heavy') delta-=Math.floor(base[i]*0.3);
          else if(x.type==='AV') delta+=x.value;
        }
      });
      av[i]+=base[i]+delta+100;
    }
    // determine actors
    const actors=[];
    for(let i=0;i<10;i++){if(av[i]>=1000) actors.push({idx:i,av:av[i]});}
    actors.sort((a,b)=>b.av-a.av||a.idx-b.idx);
    // apply effects on action
    actors.forEach(a=>{
      av[a.idx]=0;
      eff[a.idx].forEach(x=>{
        const same=x.step===step;
        const isSelf=x.unit-1===a.idx;
        const isOther=x.unit<=a.idx+1&&x.unit-1!==a.idx;
        if(!x.active){
          if(isSelf){ x.active=true; }
          else if(same&&isOther){ x.active=true; }
          else if(!same&&x.step<step){ x.active=true; }
        }
        if(x.active&&x.remaining>0){ x.remaining--; }
      });
    });
  }
  window.scrollTo({top:startY,behavior:'auto'});
      }
      qi++;
    }
    for(let i=0;i<10;i++){
      const baseAgi = base[i];
      let delta = 0;
      eff[i].forEach(x=>{
        if(x.rem>0){
          if(x.type==='Heavy'){
            delta -= Math.floor(baseAgi * 0.3);
          } else if(x.type==='Buff'){
            if(x.skipFirst){
              x.skipFirst = false; // skip first buff compute
            } else {
              delta += Math.floor(baseAgi * x.value);
            }
          }
        }
      });
      const agMod = baseAgi + delta;
      av[i] += agMod + 100;
    }
    const tr=document.createElement('tr');
    const cellStep=document.createElement('td'); cellStep.textContent=step; tr.appendChild(cellStep);
    for(let i=0;i<10;i++){
      const td=document.createElement('td');
      td.textContent=av[i];
      if(av[i]>=1000) td.classList.add('action');
      flags[i].forEach(f=>{
        const span=document.createElement('span');
        span.classList.add('flag'); span.textContent=f;
        td.appendChild(span);
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    tr.querySelectorAll('td.action').forEach(cell=>{
      cell.onclick=()=>{
        const st=+cell.parentNode.firstChild.textContent;
        const idx=Array.from(cell.parentNode.children).indexOf(cell);
        openPanel(st, idx);
      };
    });
    const actors=[]; for(let i=0;i<10;i++){ if(av[i]>=1000) actors.push({idx:i,av:av[i]}); }
    actors.sort((a,b)=>b.av-a.av);
    actors.forEach(a=>{ av[a.idx]=0; eff[a.idx].forEach(x=>{ if(x.rem>0)x.rem--; }); });
  }
  window.scrollTo({top:startY,behavior:'auto'});
}