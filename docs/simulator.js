
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

  html += '</tbody></table><div id="effect-form-container"></div>';
  results.innerHTML = html;

  document.querySelectorAll('.acted').forEach(span => {
    span.addEventListener('click', () => {
      const unit = parseInt(span.dataset.unit);
      const turn = parseInt(span.dataset.turn);
      const value = parseInt(span.dataset.value);

      const formContainer = document.getElementById('effect-form-container');
      const effectForm = `
        <div class="effect-form">
          <h3>🛠 効果設定 - ユニット${unit + 1} / ターン${turn}</h3>
          <div>
            <label>効果種別:</label>
            <button class="type-btn" data-type="agi_buff">敏捷バフ</button>
            <button class="type-btn" data-type="slow">重圧</button>
            <button class="type-btn" data-type="action_up">行動値アップ</button>
            <button class="type-btn" data-type="action_down">行動値ダウン</button>
          </div>
          <div>
            <label>対象:</label>
            ${[...Array(10)].map((_, i) => `<button class="target-btn" data-target="${i+1}">${i+1}</button>`).join('')}
            <button class="target-btn" data-target="all">all</button>
          </div>
          <div>
            <label>効果値:</label>
            <input type="number" id="effect-value" />
          </div>
          <div>
            <label>持続ターン:</label>
            <input type="number" id="effect-duration" />
          </div>
          <button id="save-effect">保存</button>
        </div>
      `;
      formContainer.innerHTML = effectForm;

      let selectedType = '';
      let selectedTarget = '';

      document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedType = btn.dataset.type;
          document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });

      document.querySelectorAll('.target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTarget = btn.dataset.target;
          document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });

      document.getElementById('save-effect').addEventListener('click', () => {
        const val = parseInt(document.getElementById('effect-value').value);
        const dur = parseInt(document.getElementById('effect-duration').value);
        if (selectedType && selectedTarget && val && dur) {
          effects.push({ turn, caster: unit + 1, type: selectedType, target: selectedTarget, value: val, duration: dur });
          span.style.backgroundColor = '#ffd';
          span.title = `${selectedType}, ${selectedTarget}, ${val}, ${dur}`;
          formContainer.innerHTML = '';
        } else {
          alert("すべての項目を入力・選択してください");
        }
      });
    });
  });

  console.log("Effects set:", effects);
});
