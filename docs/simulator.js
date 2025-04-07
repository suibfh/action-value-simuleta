
document.getElementById('run-sim').addEventListener('click', function () {
  const unitNames = [...document.querySelectorAll('.unit-name')].map(input => input.value || 'ユニット');
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
    // 演算ごとに行動値加算（敏捷 + 100）
    units.forEach(unit => {
      const gain = Math.floor(unit.currentAgi + 100);
      unit.actionValue += gain;
    });

    // 行動順を決める
    const actedThisTurn = [];
    units.forEach((unit, idx) => {
      if (unit.actionValue >= 1000) {
        actedThisTurn.push({
          idx,
          name: unit.name,
          actionValue: unit.actionValue
        });
      }
    });

    // 行動順決定：行動値が多い順 → 同値は先のユニット優先
    actedThisTurn.sort((a, b) => b.actionValue - a.actionValue || a.idx - b.idx);

    // 行動処理
    actedThisTurn.forEach(a => {
      units[a.idx].actionValue = 0;
      units[a.idx].actedTurns.push(t);
    });

    // ログ保存
    resultTable.push(units.map(unit => ({
      name: unit.name,
      agi: unit.currentAgi,
      value: unit.actionValue,
      acted: unit.actedTurns.includes(t)
    })));
  }

  // 表示出力
  const results = document.getElementById('results');
  let html = '<h2>シミュレーション結果（バフなし）</h2><table><thead><tr><th>演算</th>';

  units.forEach(u => {
    html += `<th>${u.name}</th>`;
  });
  html += '</tr></thead><tbody>';

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
