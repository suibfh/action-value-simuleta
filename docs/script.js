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
  const effObj = {
    step,
    type,
    giver,
    receiver,
    value,
    turns,
    remaining: turns,
    appliedActions: 0,
    active: false
  };
  queue.push(effObj);
  addRow(effObj);
  closePanel();
});

document.getElementById('simulate').addEventListener('click', simulate);

function simulate() {
  const startY = window.scrollY;
  const base = [];
  for (let i = 1; i <= 10; i++) {
    const v = n('agi' + i);
    base.push(v !== null ? v : 0);
  }
  const effArr = Array.from({ length: 10 }, () => []);
  const av = new Array(10).fill(0);
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const q = [...queue].sort((a, b) => a.step - b.step);
  let qi = 0;

  for (let step = 1; step <= 50; step++) {
    const flags = Array.from({ length: 10 }, () => []);

    // Enqueue effects at correct step
    while (qi < q.length && q[qi].step === step) {
      const x = Object.assign({}, q[qi]);
      x.remaining = x.turns;
      x.appliedActions = 0;
      x.active = false;
      effArr[x.receiver - 1].push(x);
      flags[x.receiver - 1].push(`${x.giver}→${x.receiver}`);
      qi++;
    }

    // Compute AV increments
    for (let i = 0; i < 10; i++) {
      let delta = 0;
      effArr[i].forEach(x => {
        if (x.remaining > 0 && x.active) {
          if (x.type === 'Heavy') {
            delta -= Math.floor(base[i] * 0.3);
          } else if (x.type === 'Buff') {
            delta += Math.floor(base[i] * x.value);
          } else if (x.type === 'AV') {
            delta += x.value;
          }
        }
      });
      av[i] += base[i] + delta + 100;
    }

    // Render row
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

    // Handle action resolution and effect activation/decrement
    const actors = [];
    for (let i = 0; i < 10; i++) {
      if (av[i] >= 1000) actors.push({ idx: i, av: av[i] });
    }
    // Sort by AV desc, then idx asc
    actors.sort((a, b) => b.av - a.av || a.idx - b.idx);

    actors.forEach(a => {
      // Reset AV
      av[a.idx] = 0;

      // Update effects for this actor
      effArr[a.idx].forEach(x => {
        const same = x.step === step;
        const isGiver = x.giver - 1 === a.idx;
        const isReceiver = x.receiver - 1 === a.idx;

        // Activation logic
        if (!x.active) {
          if (same) {
            if (!isGiver && isReceiver && x.giver <= x.receiver) {
              x.active = true;
            }
          } else if (x.step < step && isReceiver) {
            x.active = true;
          }
        }

        // Decrement remaining on each action if active
        if (x.active) {
          x.appliedActions++;
          if (x.appliedActions <= x.turns) {
            x.remaining--;
          }
          if (x.remaining <= 0) {
            x.active = false;
          }
        }
      });
    });

    // Attach click listener for new action cells
    tr.querySelectorAll('td.action').forEach(cell => {
      cell.onclick = () => {
        const st = +cell.parentNode.firstChild.textContent;
        const idx = Array.from(cell.parentNode.children).indexOf(cell);
        openPanel(st, idx + 1);
      };
    });
  }

  // Restore scroll
  window.scrollTo({ top: startY, behavior: 'auto' });
}
