
document.getElementById('run-sim').addEventListener('click', function () {
  const unitNames = [...document.querySelectorAll('.unit-name')].map(input => input.value || 'Unit');
  const unitAgis = [...document.querySelectorAll('.unit-agi')].map(input => parseInt(input.value) || 0);

  const units = unitNames.map((name, i) => ({
    name,
    agi: unitAgis[i],
    actionValue: 0,
    actedTurns: [],
    currentAgi: unitAgis[i],
    actionLog: []
  }));

  const resultTable = [];
  const totalIterations = 50;

  for (let t = 1; t <= totalIterations; t++) {
    units.forEach(unit => {
      const gain = Math.floor(unit.currentAgi + 100);
      unit.actionValue += gain;
    });

    const actedThisTurn = [];
    const actedValues = {};

    units.forEach((unit, idx) => {
      if (unit.actionValue >= 1000) {
        actedThisTurn.push({ idx, value: unit.actionValue });
        actedValues[idx] = unit.actionValue;
      }
    });

    actedThisTurn.sort((a, b) => b.value - a.value || a.idx - b.idx);
    actedThisTurn.forEach(a => {
      units[a.idx].actedTurns.push(t);
    });

    resultTable.push(units.map((unit, idx) => ({
      name: unit.name,
      agi: unit.currentAgi,
      value: actedValues.hasOwnProperty(idx) ? actedValues[idx] : unit.actionValue,
      acted: actedValues.hasOwnProperty(idx)
    })));

    actedThisTurn.forEach(a => {
      units[a.idx].actionValue = 0;
    });
  }

  // Display
  const results = document.getElementById('results');
  let html = '<h2>Simulation Result (No Buffs)</h2><table><thead><tr><th>Turn</th>';
  units.forEach(u => {
    html += `<th>${u.name}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Agility Row
  html += '<tr><td>AGI</td>';
  units.forEach(u => {
    html += `<td>${u.currentAgi}</td>`;
  });
  html += '</tr>';

  resultTable.forEach((row, idx) => {
    html += `<tr><td>${idx + 1}</td>`;
    row.forEach(cell => {
      html += `<td>${cell.value}${cell.acted ? ' 🟢' : ''}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  results.innerHTML = html;
});
