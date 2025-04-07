
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
  const effects = [];

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

  html += '<tr><td>AGI</td>';
  units.forEach(u => {
    html += `<td>${u.currentAgi}</td>`;
  });
  html += '</tr>';

  resultTable.forEach((row, turnIdx) => {
    html += `<tr><td>${turnIdx + 1}</td>`;
    row.forEach((cell, unitIdx) => {
      if (cell.acted) {
        html += `<td><span class="acted" data-unit="${unitIdx}" data-turn="${turnIdx + 1}" data-value="${cell.value}">${cell.value} 🟢</span></td>`;
      } else {
        html += `<td>${cell.value}</td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  results.innerHTML = html;

  // Event listener for effect input
  document.querySelectorAll('.acted').forEach(span => {
    span.addEventListener('click', () => {
      const unit = parseInt(span.dataset.unit);
      const turn = parseInt(span.dataset.turn);
      const value = parseInt(span.dataset.value);
      const effect = prompt(`🛠 効果を設定
ユニット${unit + 1} の ターン${turn} 行動値 ${value}

入力形式：
種類(agi_buff/slow/action_up/action_down), 対象(番号 or all), 値, 持続(ターン), 発動確率(%)
例: agi_buff, all, 20, 3, 100`);
      if (effect) {
        effects.push({ turn, unit, effect });
        span.style.backgroundColor = '#ffd';
        span.title = 'Effect: ' + effect;
      }
    });
  });

  console.log("Effects set:", effects);
});
