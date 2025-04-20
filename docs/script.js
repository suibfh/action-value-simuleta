const queue = [];

function n(id) {
  const v = parseInt(document.getElementById(id).value, 10);
  return isNaN(v) ? null : v;
}

function addRow(o) {
  const tb = document.querySelector('#queueTable tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${o.step}</td><td>${o.type}</td><td>${o.giver}</td><td>${o.receiver}</td><td>${o.value||'-'}</td><td>${o.turns||'-'}</td><td>✕</td>`;
  tr.querySelector('td:last-child').onclick = () => {
    queue.splice(queue.indexOf(o), 1);
    tb.removeChild(tr);
  };
  tb.appendChild(tr);
}

function openPanel(step, giver) {
  document.getElementById('panelStep').value = step;
  document.getElementById('panelGiver').value = giver;
  document.getElementById('panelReceiver').value = giver;
  document.getElementById('panelType').value = 'Buff';
  togglePanelFields();
  document.getElementById('panel').classList.add('open');
}

function closePanel() {
  document.getElementById('panel').classList.remove('open');
}

function togglePanelFields() {
  const t = document.getElementById('panelType').value;
  document.getElementById('panelValGroup').style.display = (t === 'Heavy' ? 'none' : 'block');
  document.getElementById('panelTurnsGroup').style.display = (t === 'AV' ? 'none' : 'block');
}

document.getElementById('panelClose').addEventListener('click', closePanel);
document.getElementById('panelType').addEventListener('change', togglePanelFields);
document.getElementById('panelAdd').addEventListener('click', () => {
  const step = n('panelStep'),
        giver = n('panelGiver'),
        receiver = n('panelReceiver');
  const type = document.getElementById('panelType').value;
  const value = n('panelVal'),
        turns = n('panelTurns');
  const o = { step, type, giver, receiver, value, turns };
  queue.push(o);
  addRow(o);
  closePanel();
});

document.getElementById('simulate').addEventListener('click', simulate);

function simulate() {
  const startY = window.scrollY;
  // Read base AGI values from inputs
  const base = [];
  for (let i = 1; i <= 10; i++) {
    const v = n('agi' + i);
    base.push(v !== null ? v : 0);
  }
  const eff = Array.from({ length: 10 }, () => []);
  const av = new Array(10).fill(0);
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const q = [...queue].sort((a, b) => a.step - b.step);
  let qi = 0;

  for (let step = 1; step <= 50; step++) {
    const flags = Array.from({ length: 10 }, () => []);
    while (qi < q.length && q[qi].step === step) {
      const e = q[qi];
      eff[e.receiver - 1].push({ ...e, rem: e.turns, applied: 0 });
      flags[e.receiver - 1].push(`${e.giver}→${e.receiver}`);
      qi++;
    }
    for (let i = 0; i < 10; i++) {
      let delta = 0;
      eff[i].forEach(x => {
        if (x.rem > 0) {
          const same = x.step === step;
          let apply = false;
          if (same) {
            if (x.giver === x.receiver) {
              if (x.applied > 0) apply = true;
              x.applied++;
            } else {
              if (x.giver <= x.receiver) apply = true;
            }
          } else if (x.step < step) {
            apply = true;
          }
          if (apply) {
            if (x.type === 'Heavy') {
              delta -= Math.floor(base[i] * 0.3);
            } else if (x.type === 'Buff') {
              delta += Math.floor(base[i] * x.value);
            } else if (x.type === 'AV') {
              delta += x.value;
            }
            x.rem--;
          }
        }
      });
      av[i] += base[i] + delta + 100;
    }
    const tr = document.createElement('tr');
    const tdStep = document.createElement('td');
    tdStep.textContent = step;
    tr.appendChild(tdStep);
    for (let i = 0; i < 10; i++) {
      const td = document.createElement('td');
      td.textContent = av[i];
      if (av[i] >= 1000) td.classList.add('action');
      flags[i].forEach(f => {
        const span = document.createElement('span');
        span.classList.add('flag');
        span.textContent = f;
        td.appendChild(span);
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    tr.querySelectorAll('td.action').forEach(cell => {
      cell.onclick = () => {
        const st = +cell.parentNode.firstChild.textContent;
        const idx = Array.from(cell.parentNode.children).indexOf(cell);
        openPanel(st, idx);
      };
    });
    const actors = [];
    for (let i = 0; i < 10; i++) {
      if (av[i] >= 1000) actors.push({ idx: i, av: av[i] });
    }
    actors.sort((a, b) => b.av - a.av || a.idx - b.idx);
    actors.forEach(a => {
      av[a.idx] = 0;
      eff[a.idx].forEach(x => {
        if (x.rem > 0) x.rem--;
      });
    });
  }

  window.scrollTo({ top: startY, behavior: 'auto' });
}
