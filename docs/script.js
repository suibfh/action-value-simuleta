document.getElementById('simulate').addEventListener('click', simulate);

function getInputNumber(id) {
  const v = parseInt(document.getElementById(id).value, 10);
  return isNaN(v) ? null : v;
}

function simulate() {
  // Gather base AGI
  const baseAgi = [];
  for (let i = 1; i <= 10; i++) {
    const val = getInputNumber('agi' + i);
    baseAgi.push(val !== null ? val : 0);
  }

  // Gather effects
  const effects = Array.from({ length: 10 }, () => []);

  // AGI Buff
  const buffTarget = getInputNumber('buffTarget');
  const buffValue = getInputNumber('buffValue');
  const buffTurns = getInputNumber('buffTurns');
  if (buffTarget && buffValue !== null && buffTurns) {
    effects[buffTarget - 1].push({
      type: 'agiBuff',
      value: buffValue / 100,
      remaining: buffTurns
    });
  }

  // Heavy Pressure
  const hpTarget = getInputNumber('hpTarget');
  const hpTurns = getInputNumber('hpTurns');
  if (hpTarget && hpTurns) {
    effects[hpTarget - 1].push({
      type: 'heavyPressure',
      value: -0.3,
      remaining: hpTurns
    });
  }

  // AV Up/Down (one‑shot)
  const avTarget = getInputNumber('avTarget');
  const avValue = getInputNumber('avValue');
  let avUpDownApplied = false;

  // Prepare AV array
  const av = new Array(10).fill(0);

  // Prepare log table
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const MAX_STEP = 50;
  for (let step = 1; step <= MAX_STEP; step++) {
    // Apply AV Up/Down once at the start of first computation
    if (!avUpDownApplied && avTarget && avValue !== null) {
      av[avTarget - 1] += avValue;
      avUpDownApplied = true;
    }

    // Increment AV with modified AGI
    for (let i = 0; i < 10; i++) {
      let agiMod = baseAgi[i];
      // Apply effects sequentially: debuffs then buffs
      effects[i].forEach(eff => {
        if (eff.remaining > 0) {
          if (eff.type === 'heavyPressure') {
            agiMod = Math.floor(agiMod * (1 + eff.value));
          }
        }
      });
      effects[i].forEach(eff => {
        if (eff.remaining > 0) {
          if (eff.type === 'agiBuff') {
            agiMod = Math.floor(agiMod * (1 + eff.value));
          }
        }
      });
      av[i] += agiMod + 100;
    }

    // Build row
    const row = document.createElement('tr');
    const stCell = document.createElement('td');
    stCell.textContent = step;
    row.appendChild(stCell);

    // Determine actors
    const actors = [];
    for (let i = 0; i < 10; i++) {
      if (av[i] >= 1000) {
        actors.push({ idx: i, av: av[i] });
      }
    }
    actors.sort((a, b) => b.av - a.av);

    // Render each unit cell
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement('td');
      cell.textContent = av[i];
      row.appendChild(cell);
    }

    tbody.appendChild(row);

    // Handle actions and effect turn reduction
    actors.forEach(actor => {
      const idx = actor.idx;
      av[idx] = 0;
      // Reduce effect turns if this unit acted
      effects[idx].forEach(eff => {
        if (eff.remaining > 0) eff.remaining -= 1;
      });
    });
  }
}
