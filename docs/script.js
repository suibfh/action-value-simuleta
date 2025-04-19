const queue=[];

function n(id){const v=parseInt(document.getElementById(id).value,10);return isNaN(v)?null:v;}

function addRow(obj){
  const tb=document.querySelector('#queueTable tbody');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${obj.step}</td><td>${obj.type}</td><td>${obj.unit||'-'}</td><td>${obj.value||'-'}</td><td>${obj.turns||'-'}</td><td>✕</td>`;
  tr.querySelector('td:last-child').onclick=()=>{tb.removeChild(tr);queue.splice(queue.indexOf(obj),1);};
  tb.appendChild(tr);
}

function openPanel(step, unit){
  document.getElementById('panelStep').value=step;
  document.getElementById('panelUnit').value=unit;
  document.getElementById('panelType').value='Buff';
  togglePanelFields();
  document.getElementById('panel').classList.add('open');
}

function closePanel(){
  document.getElementById('panel').classList.remove('open');
}

function togglePanelFields(){
  const type = document.getElementById('panelType').value;
  document.getElementById('panelValGroup').style.display = (type==='Heavy'?'none':'block');
  document.getElementById('panelTurnsGroup').style.display = (type==='AV'?'none':'block');
}

document.getElementById('panelClose').addEventListener('click', closePanel);
document.getElementById('panelType').addEventListener('change', togglePanelFields);

document.getElementById('panelAdd').addEventListener('click', ()=>{
  const step=n('panelStep'), unit=n('panelUnit');
  const type=document.getElementById('panelType').value;
  const value = n('panelVal');
  const turns = n('panelTurns');
  const obj = {step, type, unit, value, turns};
  queue.push(obj);
  addRow(obj);
  closePanel();
});

document.getElementById('simulate').addEventListener('click', simulate);

function simulate(){
  const startY=window.scrollY;
  const base=[];
  for(let i=1;i<=10;i++){base.push(n('agi'+i)||0);}
  const eff=Array.from({length:10},()=>[]);
  const av=new Array(10).fill(0);
  const tbody=document.querySelector('#log-table tbody');tbody.innerHTML='';
  const q=[...queue].sort((a,b)=>a.step-b.step);
  let qi=0;
  for(let step=1; step<=50; step++){
    while(qi<q.length && q[qi].step===step){
      const e=q[qi];
      if(e.type==='Buff' && e.unit && e.value!=null && e.turns){
        eff[e.unit-1].push({type:'Buff', value:e.value/100, rem:e.turns});
      } else if(e.type==='Heavy' && e.unit && e.turns){
        eff[e.unit-1].push({type:'Heavy', rem:e.turns});
      } else if(e.type==='AV' && e.unit && e.value!=null){
        av[e.unit-1]+=e.value;
      }
      qi++;
    }
    for(let i=0;i<10;i++){
      let ag=base[i];
      eff[i].forEach(x=>{if(x.rem>0 && x.type==='Heavy'){ag-=Math.floor(ag*0.3);}});
      eff[i].forEach(x=>{if(x.rem>0 && x.type==='Buff'){ag=Math.floor(ag*(1+x.value));}});
      av[i]+=ag+100;
    }
    const tr=document.createElement('tr');
    const actors=[];
    for(let i=0;i<10;i++){if(av[i]>=1000)actors.push({idx:i,av:av[i]});}
    actors.sort((a,b)=>b.av-a.av);
    tr.innerHTML='<td>'+step+'</td>'+av.map((v,i)=>'<td class="'+(v>=1000?'action':'')+'">'+v+'</td>').join('');
    tbody.appendChild(tr);
    tbody.querySelectorAll('td.action').forEach(cell=>{
      cell.onclick=()=>{
        const st = +cell.parentNode.firstChild.textContent;
        const idx = Array.from(cell.parentNode.children).indexOf(cell);
        openPanel(st, idx);
      };
    });
    actors.forEach(a=>{av[a.idx]=0;eff[a.idx].forEach(e=>{if(e.rem>0)e.rem--;});});
  }
  window.scrollTo({top:startY,behavior:'auto'});
}
