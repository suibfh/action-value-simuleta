// v011c-logic: extract simulate logic into pure function

function computeStepEffects(baseAgis, effectsQueue, steps = 50) {
  const n = baseAgis.length;
  const effArr = Array.from({ length: n }, () => []);
  const av = new Array(n).fill(0);
  const log = [];
  const queue = effectsQueue.slice().sort((a, b) => a.step - b.step);
  let qi = 0;
  for (let step = 1; step <= steps; step++) {
    // enqueue
    while (qi < queue.length && queue[qi].step === step) {
      const e = { ...queue[qi], remaining: queue[qi].turns };
      effArr[e.unit - 1].push(e);
      qi++;
    }
    // compute increments
    for (let i = 0; i < n; i++) {
      let delta = 0;
      for (const x of effArr[i]) {
        if (x.remaining > 0) {
          if (x.type === 'Buff') delta += Math.floor(baseAgis[i] * x.value);
          else if (x.type === 'Heavy') delta -= Math.floor(baseAgis[i] * 0.3);
        }
      }
      av[i] += baseAgis[i] + delta + 100;
    }
    // record
    log.push({ step: step, avs: av.slice() });
    // resolve actions
    const actors = [];
    for (let i = 0; i < n; i++) {
      if (av[i] >= 1000) actors.push({ idx: i, av: av[i] });
    }
    actors.sort((a, b) => b.av - a.av || a.idx - b.idx);
    for (const a of actors) {
      av[a.idx] = 0;
      for (const x of effArr[a.idx]) {
        if (x.remaining > 0) x.remaining--;
      }
    }
  }
  return log;
}

// render log
function renderLog(log) {
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';
  for (const row of log) {
    const tr = document.createElement('tr');
    let html = `<td>${row.step}</td>`;
    for (const av of row.avs) {
      html += `<td>${av}</td>`;
    }
    tr.innerHTML = html;
    tbody.appendChild(tr);
  }
}

// override simulate
document.getElementById('simulate').onclick = () => {
  const base = [];
  for (let i = 1; i <= 10; i++) {
    const v = parseInt(document.getElementById('agi' + i).value, 10);
    base.push(isNaN(v) ? 0 : v);
  }
  const effectsQueue = [];
  document.querySelectorAll('#queueTable tbody tr').forEach(tr => {
    const cells = tr.children;
    effectsQueue.push({
      step: parseInt(cells[0].textContent, 10),
      type: cells[1].textContent,
      unit: parseInt(cells[2].textContent, 10),
      value: parseFloat(cells[3].textContent),
      turns: parseInt(cells[4].textContent, 10)
    });
  });
  const log = computeStepEffects(base, effectsQueue, 50);
  renderLog(log);
};
