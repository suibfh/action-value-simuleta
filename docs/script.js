const queue = [];

function n(id){const v=parseInt(document.getElementById(id).value,10);return isNaN(v)?null:v;}

function addRow(obj){
  const tb=document.querySelector('#queueTable tbody');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${obj.step}</td><td>${obj.type}</td><td>${obj.unit??'-'}</td><td>${obj.value??'-'}</td><td>${obj.turns??'-'}</td><td>✕</td>`;
  tr.querySelector('td:last-child').onclick=()=>{tb.removeChild(tr);queue.splice(queue.indexOf(obj),1);};
  tb.appendChild(tr);
}

document.getElementById('addBuff').onclick=()=>{
  const o={step:n('bStep'),type:'Buff',unit:n('bUnit'),value:n('bVal'),turns:n('bTurns')};
  if(o.step&&o.unit&&o.value!==null&&o.turns) {queue.push(o);addRow(o);}
};

document.getElementById('addHP').onclick=()=>{
  const o={step:n('hStep'),type:'Heavy',unit:n('hUnit'),turns:n('hTurns')};
  if(o.step&&o.unit&&o.turns){queue.push(o);addRow(o);}
};

document.getElementById('addAV').onclick=()=>{
  const o={step:n('aStep'),type:'AV',unit:n('aUnit'),value:n('aVal')};
  if(o.step&&o.unit&&o.value!==null){queue.push(o);addRow(o);}
};

document.getElementById('simulate').addEventListener('click',simulate);

function simulate(){
  const startY=window.scrollY;
  const base=[];for(let i=1;i<=10;i++){const v=n('agi'+i);base.push(v??0);}
  const eff=Array.from({length:10},()=>[]);
  const av=new Array(10).fill(0);
  const tbody=document.querySelector('#log-table tbody');tbody.innerHTML='';
  const q=[...queue].sort((a,b)=>a.step-b.step);
  let qi=0;
  const max=50;
  for(let step=1;step<=max;step++){
    while(qi<q.length && q[qi].step===step){
      const e=q[qi];
      if(e.type==='Buff'){eff[e.unit-1].push({type:'Buff',value:e.value/100,rem:e.turns});}
      else if(e.type==='Heavy'){eff[e.unit-1].push({type:'Heavy',rem:e.turns});}
      else if(e.type==='AV'){av[e.unit-1]+=e.value;}
      qi++;
    }
    for(let i=0;i<10;i++){
      let ag=base[i];
      eff[i].forEach(x=>{if(x.rem>0 && x.type==='Heavy'){ag-=Math.floor(ag*0.3);} });
      eff[i].forEach(x=>{if(x.rem>0 && x.type==='Buff'){ag=Math.floor(ag*(1+x.value));} });
      av[i]+=ag+100;
    }
    const tr=document.createElement('tr');
    tr.innerHTML='<td>'+step+'</td>'+av.map(v=>'<td'+(v>=1000?' class="action"':'')+'>'+v+'</td>').join('');
    tbody.appendChild(tr);
    const actors=[];for(let i=0;i<10;i++){if(av[i]>=1000)actors.push(i);}
    actors.forEach(idx=>{av[idx]=0;eff[idx].forEach(e=>{if(e.rem>0)e.rem-=1;});});
  }
  window.scrollTo({top:startY,behavior:'auto'});
}
