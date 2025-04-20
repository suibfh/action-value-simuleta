const queue=[];
function n(id){const v=parseInt(document.getElementById(id).value,10);return isNaN(v)?null:v;}
function addRow(o){const tb=document.querySelector('#queueTable tbody');const tr=document.createElement('tr');tr.innerHTML=`<td>${o.step}</td><td>${o.type}</td><td>${o.giver}</td><td>${o.receiver}</td><td>${o.value||'-'}</td><td>${o.turns||'-'}</td><td>✕</td>`;tr.querySelector('td:last-child').onclick=()=>{queue.splice(queue.indexOf(o),1);tb.removeChild(tr);};tb.appendChild(tr);}
function openPanel(step,giver){document.getElementById('panelStep').value=step;document.getElementById('panelGiver').value=giver;document.getElementById('panel').style.display='block';}
document.getElementById('simulate').addEventListener('click',()=>{
  const base=Array(10).fill(100),eff=Array.from({length:10},()=>[]),av=Array(10).fill(0);
  const q=[...queue].sort((a,b)=>a.step-b.step);let qi=0;
  for(let step=1;step<=50;step++){
    // apply effects
    while(qi<q.length&&q[qi].step===step){
      eff[q[qi].receiver-1].push({...q[qi],rem:q[qi].turns,applied:0});qi++;
    }
    // calc
    for(let i=0;i<10;i++){
      let delta=0;
      eff[i].forEach(e=>{
        if(e.rem>0){
          const same=e.step===step;
          let apply=false;
          if(same){if(e.giver===e.receiver){if(e.applied>0){apply=true;}e.applied++;}else{if(e.giver<=e.receiver)apply=true;}}
          else if(e.step<step)apply=true;
          if(apply){delta+= e.type==='Buff'?Math.floor(base[i]*e.value): e.type==='Heavy'? -Math.floor(base[i]*0.3):e.type==='AV'?e.value:0; e.rem--;}
        }
      });
      av[i]+=base[i]+delta+100;
    }
    // log
    const tb=document.querySelector('#log-table tbody');if(!tb)continue;
    const tr=document.createElement('tr');tr.innerHTML='<td>'+step+'</td>'+av.map(v=>'<td>'+v+'</td>').join('');tb.appendChild(tr);
  }
});
