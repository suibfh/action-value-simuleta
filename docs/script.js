document.getElementById('simulate').addEventListener('click', simulate);

function num(id) {
  const v = parseInt(document.getElementById(id).value, 10);
  return isNaN(v) ? null : v;
}

function simulate() {
  // Preserve current scroll position
  const startScrollY = window.scrollY;

  const baseAgi = [];
  for (let i = 1; i <= 10; i++) {
    const v = num('agi' + i);
    baseAgi.push(v !== null ? v : 0);
  }

  const effects = Array.from({ length: 10 }, () => []);
  const queue = [];

  const bs = num('buffStep'), bt = num('buffTarget'), bv = num('buffValue'), bT = num('buffTurns');
  if (bs && bt && bv !== null && bT) queue.push({ step: bs, action: () => effects[bt-1].push({type:'agiBuff', value:bv/100, remaining:bT}) });

  const hs = num('hpStep'), ht = num('hpTarget'), hT = num('hpTurns');
  if (hs && ht && hT) queue.push({ step: hs, action: () => effects[ht-1].push({type:'heavyPressure', remaining:hT}) });

  const as = num('avStep'), at = num('avTarget'), avVal = num('avValue');
  if (as && at && avVal !== null) queue.push({ step: as, action: (avArr)=>{ avArr[at-1]+=avVal;} });

  queue.sort((a,b)=>a.step-b.step);

  const av = new Array(10).fill(0);
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const MAX_STEP = 50;
  let qi=0;
  for(let step=1; step<=MAX_STEP; step++){
    while(qi<queue.length && queue[qi].step===step){
      queue[qi].action(av);
      qi++;
    }

    for(let i=0;i<10;i++){
      let ag = baseAgi[i];
      effects[i].forEach(e=>{ if(e.remaining>0 && e.type==='heavyPressure'){ ag -= Math.floor(ag*0.3);} });
      effects[i].forEach(e=>{ if(e.remaining>0 && e.type==='agiBuff'){ ag = Math.floor(ag*(1+e.value));} });
      av[i]+=ag+100;
    }

    const tr=document.createElement('tr');
    const tdStep=document.createElement('td');tdStep.textContent=step;tr.appendChild(tdStep);
    const actors=[];
    for(let i=0;i<10;i++){ if(av[i]>=1000)actors.push({idx:i,av:av[i]});}
    actors.sort((a,b)=>b.av-a.av);
    for(let i=0;i<10;i++){
      const td=document.createElement('td');
      td.textContent=av[i];
      if(av[i]>=1000)td.classList.add('action');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);

    actors.forEach(a=>{
      av[a.idx]=0;
      effects[a.idx].forEach(e=>{ if(e.remaining>0) e.remaining-=1;});
    });
  }

  // Return to original scroll position
  window.scrollTo({top: startScrollY, behavior: 'auto'});
}
