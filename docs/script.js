
let currentUnit = null;
let currentTurn = null;

window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".unit-grid");
  for (let i = 1; i <= 10; i++) {
    const block = document.createElement("div");
    block.className = "unit-block";
    block.innerHTML = `
      <label for="agility-${i}">Unit ${i} Agility:</label>
      <input type="number" id="agility-${i}" name="agility-${i}" min="0" />
    `;
    container.appendChild(block);
  }

  const effectTypeField = document.getElementById("effect-type");
  const durationField = document.getElementById("effect-duration");

  if (effectTypeField) {
    effectTypeField.addEventListener("change", () => {
      const type = effectTypeField.value;
      if (type === "valueup" || type === "valuedown") {
        durationField.value = "1";
        durationField.disabled = true;
      } else {
        durationField.disabled = false;
        durationField.value = "";
      }
    });
  }

  document.getElementById("agility-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const agilities = [];
    for (let i = 1; i <= 10; i++) {
      const value = parseInt(document.getElementById("agility-" + i).value, 10);
      agilities.push(isNaN(value) ? 0 : value);
    }

    const basePoints = agilities.map(a => a + 100);
    const currentPoints = Array(10).fill(0);
    const tbody = document.querySelector("#result-table tbody");
    tbody.innerHTML = "";

    for (let turn = 1; turn <= 50; turn++) {
      const row = document.createElement("tr");
      const turnCell = document.createElement("td");
      turnCell.textContent = turn;
      row.appendChild(turnCell);

      for (let i = 0; i < 10; i++) {
        currentPoints[i] += basePoints[i];
      }

      const actedUnits = currentPoints.map((val, idx) => ({ idx, val }))
        .filter(u => u.val >= 1000)
        .sort((a, b) => b.val - a.val || a.idx - b.idx);

      const actedIdx = actedUnits.map(u => u.idx);

      for (let i = 0; i < 10; i++) {
        const cell = document.createElement("td");
        cell.textContent = currentPoints[i];
        if (actedIdx.includes(i)) {
          cell.classList.add("action");
          cell.addEventListener("click", () => openModal(i + 1, turn));
          currentPoints[i] = basePoints[i];
        }
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
  });
});

function openModal(unitIndex, turn) {
  currentUnit = unitIndex;
  currentTurn = turn;

  // 初期化
  document.getElementById("effect-type").value = "";
  document.getElementById("effect-value").value = "";
  document.getElementById("effect-duration").value = "";
  document.getElementById("effect-duration").disabled = false;
  document.querySelectorAll('input[name="targets"]').forEach(c => c.checked = false);

  // ヘッダー更新
  document.getElementById("modal-header").textContent = `Set Effect for Unit ${unitIndex} / Turn ${turn}`;

  document.getElementById("modal-overlay").classList.add("active");
  document.getElementById("effect-modal").classList.add("active");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
  document.getElementById("effect-modal").classList.remove("active");
}

function saveEffect() {
  const type = document.getElementById("effect-type").value;
  const value = document.getElementById("effect-value").value;
  const duration = document.getElementById("effect-duration").value;
  const targets = Array.from(document.querySelectorAll('input[name="targets"]:checked')).map(cb => cb.value);

  console.log(`Saved for Unit ${currentUnit} on Turn ${currentTurn}`);
  console.log({ type, value, duration, targets });

  closeModal();
}


// 効果保存用のグローバルデータ構造: { "unit-turn": {type, value, duration, targets} }
const effectDataMap = {};

function saveEffect() {
  const type = document.getElementById("effect-type").value;
  const value = document.getElementById("effect-value").value;
  const duration = document.getElementById("effect-duration").value;
  const targets = Array.from(document.querySelectorAll('input[name="targets"]:checked')).map(cb => cb.value);

  const key = `unit${currentUnit}-turn${currentTurn}`;
  effectDataMap[key] = { type, value, duration, targets };

  console.log(`Saved for ${key}`);
  console.log(effectDataMap[key]);

  closeModal();
}


// 効果を適用する敏捷補正値（turn → unit → 敏捷補正値）と行動値補正（turn → unit → 数値）
const agilityModifiers = {};   // e.g. agilityModifiers[12][3] = -30 (Unit 3 gets -30 on Turn 12)
const actionValueModifiers = {}; // e.g. actionValueModifiers[12][3] = +200

// シミュレーション用の処理（修正箇所）
document.getElementById("agility-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const agilities = [];
  for (let i = 1; i <= 10; i++) {
    const value = parseInt(document.getElementById("agility-" + i).value, 10);
    agilities.push(isNaN(value) ? 0 : value);
  }

  const activeBuffs = Array(10).fill(null).map(() => []); // 各ユニットのバフ履歴
  const basePoints = agilities.map(a => a + 100);
  const currentPoints = Array(10).fill(0);
  const tbody = document.querySelector("#result-table tbody");
  tbody.innerHTML = "";

  for (let turn = 1; turn <= 50; turn++) {
    const row = document.createElement("tr");
    const turnCell = document.createElement("td");
    turnCell.textContent = turn;
    row.appendChild(turnCell);

    // このターンに影響するバフ等を処理（持続ターン減少）
    for (let i = 0; i < 10; i++) {
      activeBuffs[i] = activeBuffs[i].filter(buff => --buff.remaining > 0);
    }

    for (let i = 0; i < 10; i++) {
      const baseAgility = agilities[i];
      let modified = baseAgility;

      for (const buff of activeBuffs[i]) {
        if (buff.type === "buff") {
          modified += Math.floor(baseAgility * (+buff.value / 100));
        } else if (buff.type === "pressure") {
          modified -= Math.floor(baseAgility * (+buff.value / 100));
        }
      }

      const basePoint = modified + 100;
      currentPoints[i] += basePoint;

      if (!isNaN(actionValueModifiers[turn]?.[i])) {
        currentPoints[i] += actionValueModifiers[turn][i];
      }
    }

    const actedUnits = currentPoints.map((val, idx) => ({ idx, val }))
      .filter(u => u.val >= 1000)
      .sort((a, b) => b.val - a.val || a.idx - b.idx);

    const actedIdx = actedUnits.map(u => u.idx);

    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("td");
      cell.textContent = currentPoints[i];
      if (actedIdx.includes(i)) {
        const unitIndex = i + 1;
        const key = `unit${unitIndex}-turn${turn}`;

        const effect = effectDataMap[key];
        if (effect) {
          for (const target of effect.targets) {
            const targetIdx = parseInt(target, 10) - 1;
            if (effect.type === "buff" || effect.type === "pressure") {
              activeBuffs[targetIdx].push({
                type: effect.type,
                value: effect.value,
                remaining: parseInt(effect.duration, 10)
              });
            } else if (effect.type === "valueup" || effect.type === "valuedown") {
              const value = parseInt(effect.value, 10) || 0;
              if (!actionValueModifiers[turn + 1]) actionValueModifiers[turn + 1] = {};
              actionValueModifiers[turn + 1][targetIdx] = actionValueModifiers[turn + 1][targetIdx] || 0;
              actionValueModifiers[turn + 1][targetIdx] += (effect.type === "valueup" ? value : -value);
            }
          }
        }

        cell.classList.add("action");
        cell.addEventListener("click", () => openModal(unitIndex, turn));
        currentPoints[i] = agilities[i] + 100; // reset after action
      }
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }
});
