document.getElementById('simulate').addEventListener('click', simulate);

function num(id) {
  const v = parseInt(document.getElementById(id).value, 10);
  return isNaN(v) ? null : v;
}

function simulate() {
  // === setup ===
  const baseAgi = [];
  for (let i = 1; i <= 10; i++) {
    const v = num('agi' + i);
    baseAgi.push(v !== null ? v : 0);
  }

  // per‑unit ongoing effects
  const effects = Array.from({ length: 10 }, () => []);

  // queue of effects to apply at specific computation steps
  const effectQueue = [];

  // AGI Buff entry
  const bs = num('buffStep'), bt = num('buffTarget'), bv = num('buffValue'), bT = num('buffTurns');
  if (bs && bt && bv !== null && bT) {
    effectQueue.push({
      step: bs,
      action: () => {
        effects[bt - 1].push({ type: 'agiBuff', value: bv / 100, remaining: bT });
      }
    });
  }

  // Heavy Pressure entry
  const hs = num('hpStep'), ht = num('hpTarget'), hT = num('hpTurns');
  if (hs && ht && hT) {
    effectQueue.push({
      step: hs,
      action: () => {
        effects[ht - 1].push({ type: 'heavyPressure', remaining: hT });
      }
    });
  }

  // AV Up/Down entry
  const as = num('avStep'), at = num('avTarget'), avVal = num('avValue');
  if (as && at && avVal !== null) {
    effectQueue.push({
      step: as,
      action: (avArr) => {
        avArr[at - 1] += avVal;
      }
    });
  }

  // sort queue by step just in case
  effectQueue.sort((a, b) => a.step - b.step);

  // AV storage
  const av = new Array(10).fill(0);

  // log table
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const MAX_STEP = 50;
  let qIndex = 0;

  for (let step = 1; step <= MAX_STEP; step++) {
    // apply queued effects scheduled for this step
    while (qIndex < effectQueue.length && effectQueue[qIndex].step === step) {
      const entry = effectQueue[qIndex];
      // pass av array in case action needs it
      entry.action(av);
      qIndex++;
    }

    // increment AV
    for (let i = 0; i < 10; i++) {
      let agiMod = baseAgi[i];

      // heavy pressure debuffs first
      effects[i].forEach(e => {
        if (e.remaining > 0 && e.type === 'heavyPressure') {
          const reduction = Math.floor(agiMod * 0.3);
          agiMod -= reduction;
        }
      });

      // agi buffs
      effects[i].forEach(e => {
        if (e.remaining > 0 && e.type === 'agiBuff') {
          agiMod = Math.floor(agiMod * (1 + e.value));
        }
      });

      av[i] += agiMod + 100;
    }

    // build row
    const row = document.createElement('tr');
    const cellStep = document.createElement('td');
    cellStep.textContent = step;
    row.appendChild(cellStep);

    const actors = [];
    for (let i = 0; i < 10; i++) {
      if (av[i] >= 1000) actors.push({ idx: i, av: av[i] });
    }
    actors.sort((a, b) => b.av - a.av);

    for (let i = 0; i < 10; i++) {
      const c = document.createElement('td');
      c.textContent = av[i];
      if (av[i] >= 1000) c.classList.add('action');
      row.appendChild(c);
    }
    tbody.appendChild(row);
    row.scrollIntoView(false); // auto‑scroll to newest row

    // resolve actions
    actors.forEach(a => {
      av[a.idx] = 0;
      effects[a.idx].forEach(eff => {
        if (eff.remaining > 0) eff.remaining -= 1;
      });
    });
  }
}
