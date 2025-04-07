
function runSimulation(unitNames, unitAgis, effects, totalIterations = 50) {
  const units = unitNames.map((name, i) => ({
    name,
    baseAgi: unitAgis[i],
    currentAgi: unitAgis[i],
    actionValue: 0,
    agiBuffs: [],
    actedTurns: [],
    actionLog: []
  }));

  const resultTable = [];

  for (let turn = 1; turn <= totalIterations; turn++) {
    units.forEach(u => { delete u.__actedValue; u.__actedThisTurn = false; });

    effects.filter(e => e.turn === turn - 1).forEach(e => {
      const targets = e.target === 'all' ? [...Array(units.length).keys()] : [parseInt(e.target) - 1];
      targets.forEach(t => {
        if (e.type === 'agi_buff' || e.type === 'slow') {
          units[t].agiBuffs.push({
            value: e.value,
            remainingTurns: e.duration,
            actedCount: 0,
            appliedAt: turn,
            activated: false,
            actedCountStarted: false
          });
        }
        if (e.type === 'action_up' || e.type === 'action_down') {
          units[t].actionValue += e.value;
        }
      });
    });

    units.forEach(unit => {
      const totalBuff = unit.agiBuffs.reduce((sum, b) => sum + b.value, 0);
      unit.currentAgi = Math.floor(unit.baseAgi * (1 + totalBuff / 100));
    });

    units.forEach(unit => {
      unit.actionValue += Math.floor(unit.currentAgi + 100);
    });

    const acted = units
      .map((u, i) => ({ idx: i, val: u.actionValue }))
      .filter(u => u.val >= 1000)
      .sort((a, b) => b.val - a.val || a.idx - b.idx);

    acted.forEach(a => {
      const u = units[a.idx];
      u.__actedThisTurn = true;
      u.__actedValue = u.actionValue;
      u.actedTurns.push(turn);
      u.actionValue = 0;
      if (u.agiBuffs) {
        let counted = false;
      u.agiBuffs.forEach(buff => {
        if (buff.appliedAt < turn) {
          if (buff.activated && buff.actedCountStarted && !counted) {
            buff.actedCount++;
            counted = true;
          } else if (buff.activated && !buff.actedCountStarted) {
            buff.actedCountStarted = true;
            counted = true;
          } else if (!buff.activated) {
            buff.activated = true;
          }
            if (buff.activated && buff.actedCountStarted) buff.actedCount++;
            else if (buff.activated) buff.actedCountStarted = true;
            else buff.activated = true;
          }
        });
      }
    });

    units.forEach(unit => {
      unit.agiBuffs = unit.agiBuffs.filter(buff => buff.actedCount < buff.remainingTurns);
    });

    resultTable.push(units.map((u, i) => ({
      name: u.name,
      agi: u.currentAgi,
      value: u.__actedValue !== undefined ? u.__actedValue : u.actionValue,
      acted: acted.some(a => a.idx === i)
    })));
  }

  return resultTable;
}

document.getElementById('run-sim').addEventListener('click', function () {
  const unitNames = [...document.querySelectorAll('.unit-name')].map(input => input.value || 'Unit');
  const unitAgis = [...document.querySelectorAll('.unit-agi')].map(input => parseInt(input.value) || 0);
  const results = document.getElementById('results');
  const totalIterations = 50;
  let effects = [];

  const modal = document.createElement('div');
  modal.id = 'effect-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3 id="modal-title"></h3>
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
      <button id="close-modal">キャンセル</button>
    </div>
  `;
  document.body.appendChild(modal);

  const outputAndBind = () => {
    const resultTable = runSimulation(unitNames, unitAgis, effects, totalIterations);
    let html = '<h2>Simulation Result (Effects Applied)</h2><table><thead><tr><th>演算</th>';
    unitNames.forEach(name => html += `<th>${name}</th>`);
    html += '</tr></thead><tbody>';
    html += '<tr><td>AGI</td>';
    unitAgis.forEach(val => html += `<td>${val}</td>`);
    html += '</tr>';
    resultTable.forEach((row, t) => {
      html += `<tr><td>${t + 1}</td>`;
      row.forEach((cell, idx) => {
        html += `<td${cell.acted ? ` class="acted-cell" data-unit="${idx}" data-turn="${t + 1}"` : ''}>${cell.value}${cell.acted ? ' 🟢' : ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    results.innerHTML = html;

    document.querySelectorAll('.acted-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const unit = cell.dataset.unit;
        const turn = cell.dataset.turn;
        let selectedType = '';
        let selectedTarget = '';
        document.getElementById('modal-title').innerText = `効果設定 - ユニット${parseInt(unit) + 1} / 演算${turn}`;
        modal.dataset.unit = unit;
        modal.dataset.turn = turn;
        modal.style.display = 'flex';

        modal.querySelectorAll('.type-btn').forEach(btn => {
          btn.onclick = () => {
            selectedType = btn.dataset.type;
            modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          };
        });
        modal.querySelectorAll('.target-btn').forEach(btn => {
          btn.onclick = () => {
            selectedTarget = btn.dataset.target;
            modal.querySelectorAll('.target-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          };
        });
        document.getElementById('save-effect').onclick = () => {
          const val = parseInt(document.getElementById('effect-value').value);
          const dur = parseInt(document.getElementById('effect-duration').value);
          if (selectedType && selectedTarget && val && dur) {
            let actualValue = val;
            if (selectedType === 'slow' || selectedType === 'action_down') actualValue = -Math.abs(val);
            effects.push({ turn: parseInt(turn), caster: parseInt(unit) + 1, type: selectedType, target: selectedTarget, value: actualValue, duration: dur });
            modal.style.display = 'none';
            outputAndBind();
          } else {
            alert("全項目を入力・選択してください");
          }
        };
      });
    });
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
  };

  outputAndBind();
});
