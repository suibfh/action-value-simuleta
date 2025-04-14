
const effectMap = {};
let currentModalContext = { unit: null, turn: null };

document.getElementById("start-simulation").addEventListener("click", simulate);

function simulate() {
  const agilityBase = [];
  for (let i = 1; i <= 10; i++) {
    const val = parseInt(document.getElementById(`agility-${i}`).value) || 0;
    agilityBase.push(val);
  }

  const agilityCurrent = agilityBase.slice();
  const actionValue = new Array(10).fill(0);
  const result = Array.from({ length: 10 }, () => []);

  // 行動回数と現在の効果状態を記録
  const turnCounter = new Array(10).fill(0);
  const effectState = Array.from({ length: 10 }, () => ({
    skill: 0,
    bb: 0,
    pressure: false,
    remaining: []  // 各効果の残りターン数 [{type, value, turns}]
  }));

  for (let turn = 0; turn < 50; turn++) {
    // 前演算で発動した効果を適用
    for (let key in effectMap) {
      const [_, unitStr, __, turnStr] = key.split(/[-]/);
      const effTurn = parseInt(turnStr);
      if (effTurn === turn - 1) {
        const eff = effectMap[key];
        eff.targets.forEach(t => {
          if (eff.type === "av-up") {
            actionValue[t] += eff.value;
          } else if (eff.type === "av-down") {
            actionValue[t] -= eff.value;
          } else {
            // 持続ターン効果を追加
            effectState[t].remaining.push({
              type: eff.type,
              value: eff.value,
              turns: eff.turns
            });
          }
        });
      }
    }

    // 効果を反映して行動値加算
    for (let i = 0; i < 10; i++) {
      let agi = agilityBase[i];
      let skill = 0;
      let bb = 0;
      let pressure = false;

      // 有効な効果を抽出して反映
      effectState[i].remaining.forEach(e => {
        if (e.type === "agility-skill") {
          skill = Math.max(skill, e.value);
        } else if (e.type === "agility-bb") {
          bb = Math.max(bb, e.value);
        } else if (e.type === "pressure") {
          pressure = true;
        }
      });

      if (pressure) agi -= Math.floor(agi * 0.3);
      if (skill > 0) agi += Math.floor(agi * (skill / 100));
      if (bb > 0) agi += Math.floor(agi * (bb / 100));

      agilityCurrent[i] = agi;
      actionValue[i] += agi + 100;
      result[i][turn] = actionValue[i];
    }

    // 行動判定とリセット
    for (let i = 0; i < 10; i++) {
      if (result[i][turn] >= 1000) {
        actionValue[i] = 0;
        turnCounter[i]++;

        // 行動したユニットはターン数を減算
        effectState[i].remaining.forEach(e => e.turns--);
        effectState[i].remaining = effectState[i].remaining.filter(e => e.turns > 0);
      }
    }
  }

  renderTable(result);
}

function renderTable(data) {
  const container = document.getElementById("simulation-result");
  container.innerHTML = "";

  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = "<th>Unit\Turn</th>" + Array.from({ length: 50 }, (_, i) => `<th>${i + 1}</th>`).join("");
  table.appendChild(header);

  data.forEach((row, unitIndex) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Unit ${unitIndex + 1}</td>` + row.map((value, turnIndex) => {
      const isActed = value >= 1000;
      const key = `unit-${unitIndex}-turn-${turnIndex}`;
      const hasEffect = effectMap[key] !== undefined;
      const cell = `<td class='${isActed ? "acted" : ""} ${hasEffect ? "effect-applied" : ""}'>
        ${value}
        ${isActed ? `<button class='gear-button' data-unit='${unitIndex}' data-turn='${turnIndex}'>⚙</button>` : ""}
      </td>`;
      return cell;
    }).join("");
    table.appendChild(tr);
  });

  container.appendChild(table);

  document.querySelectorAll(".gear-button").forEach(button => {
    button.addEventListener("click", () => {
      const unit = button.getAttribute("data-unit");
      const turn = button.getAttribute("data-turn");
      currentModalContext = { unit, turn };
      document.getElementById("effect-modal").dataset.unit = unit;
      document.getElementById("effect-modal").dataset.turn = turn;
      document.getElementById("effect-modal").classList.remove("hidden");
    });
  });
}

document.getElementById("effect-close").addEventListener("click", () => {
  document.getElementById("effect-modal").classList.add("hidden");
});

document.getElementById("effect-save").addEventListener("click", () => {
  const type = document.getElementById("effect-type").value;
  const value = parseInt(document.getElementById("effect-value").value) || 0;
  const turns = parseInt(document.getElementById("effect-turns").value) || 1;
  const targets = Array.from(document.querySelectorAll(".effect-target:checked")).map(cb => parseInt(cb.value));

  const unit = currentModalContext.unit;
  const turn = currentModalContext.turn;
  const key = `unit-${unit}-turn-${turn}`;
  effectMap[key] = { type, value, turns, targets };

  console.log("Effect stored:", key, effectMap[key]);
  document.getElementById("effect-modal").classList.add("hidden");
});


// Reset effect map and refresh view
document.getElementById("reset-effects").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all effects?")) {
    for (const key in effectMap) delete effectMap[key];
    simulate();  // re-render with cleared effects
  }
});

// Update effect summary in modal
function updateEffectSummary(unit, turn) {
  const summaryContainer = document.getElementById("effect-summary");
  const key = `unit-${unit}-turn-${turn}`;
  const effect = effectMap[key];
  if (!effect) {
    summaryContainer.innerText = "No effect set.";
    return;
  }

  const effectNameMap = {
    "agility-skill": "Agility Buff (Skill)",
    "agility-bb": "Agility Buff (BB)",
    "pressure": "Pressure",
    "av-up": "AV Up",
    "av-down": "AV Down"
  };

  const targetList = effect.targets.map(t => `Unit ${t + 1}`).join(", ");
  const lines = [
    `Effect: ${effectNameMap[effect.type] || effect.type}`,
    `Value: ${effect.value}`,
    `Turns: ${effect.turns}`,
    `Targets: ${targetList}`
  ];

  summaryContainer.innerText = lines.join("\n");
}


// Delete button logic
document.getElementById("effect-delete").addEventListener("click", () => {
  const unit = currentModalContext.unit;
  const turn = currentModalContext.turn;
  const key = `unit-${unit}-turn-${turn}`;
  if (effectMap[key]) {
    delete effectMap[key];
    alert("Effect deleted.");
    document.getElementById("effect-modal").classList.add("hidden");
    simulate();
  }
});

// Prefill modal fields when opened
function prefillModal(unit, turn) {
  const key = `unit-${unit}-turn-${turn}`;
  const effect = effectMap[key];
  if (!effect) return;

  document.getElementById("effect-type").value = effect.type;
  document.getElementById("effect-value").value = effect.value;
  document.getElementById("effect-turns").value = effect.turns;

  document.querySelectorAll(".effect-target").forEach(cb => {
    cb.checked = effect.targets.includes(parseInt(cb.value));
  });

  // Update input state and summary
  const event = new Event("change");
  document.getElementById("effect-type").dispatchEvent(event);
  updateEffectSummary(unit, turn);
}

// Add tooltip when rendering cells
function renderTable(data) {
  const container = document.getElementById("simulation-result");
  container.innerHTML = "";

  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = "<th>Unit\Turn</th>" + Array.from({ length: 50 }, (_, i) => `<th>${i + 1}</th>`).join("");
  table.appendChild(header);

  data.forEach((row, unitIndex) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Unit ${unitIndex + 1}</td>` + row.map((value, turnIndex) => {
      const isActed = value >= 1000;
      const key = `unit-${unitIndex}-turn-${turnIndex}`;
      const hasEffect = effectMap[key] !== undefined;
      const tooltip = hasEffect ? generateTooltip(effectMap[key]) : "";
      const cell = \`<td class='\${isActed ? "acted" : ""} \${hasEffect ? "effect-applied" : ""}' title="\${tooltip}">
        \${value}
        \${isActed ? \`<button class='gear-button' data-unit='\${unitIndex}' data-turn='\${turnIndex}'>⚙</button>\` : ""}
      </td>\`;
      return cell;
    }).join("");
    table.appendChild(tr);
  });

  container.appendChild(table);

  document.querySelectorAll(".gear-button").forEach(button => {
    button.addEventListener("click", () => {
      const unit = button.getAttribute("data-unit");
      const turn = button.getAttribute("data-turn");
      currentModalContext = { unit, turn };
      document.getElementById("effect-modal").dataset.unit = unit;
      document.getElementById("effect-modal").dataset.turn = turn;
      prefillModal(unit, turn);
      document.getElementById("effect-modal").classList.remove("hidden");
    });
  });
}


function generateTooltip(effect) {
  const map = {
    "agility-skill": "Agility Buff (Skill)",
    "agility-bb": "Agility Buff (BB)",
    "pressure": "Pressure",
    "av-up": "AV Up",
    "av-down": "AV Down"
  };

  const label = map[effect.type] || effect.type;
  const value = effect.value;
  const turns = effect.turns;

  const tooltip = `${label}: ${value} / ${turns} Turns`;
  return tooltip;
}

