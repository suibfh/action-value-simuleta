const effectMap = {};

document.getElementById("start-simulation").addEventListener("click", () => {
  const agilityBase = [];
  for (let i = 1; i <= 10; i++) {
    const val = parseInt(document.getElementById(`agility-${i}`).value) || 0;
    agilityBase.push(val);
  }

  const agilityCurrent = agilityBase.slice();
  const actionValue = new Array(10).fill(0);
  const result = Array.from({ length: 10 }, () => []);

  const activeEffects = Array.from({ length: 10 }, () => ({
    skill: 0,
    bb: 0,
    pressure: false
  }));

  for (let turn = 0; turn < 50; turn++) {
    // Apply effectMap entries that activate this turn
    for (let key in effectMap) {
      const [_, unitStr, __, turnStr] = key.split(/[-]/);
      const unit = parseInt(unitStr);
      const effectTurn = parseInt(turnStr);
      if (effectTurn === turn - 1) {
        const eff = effectMap[key];
        eff.targets.forEach(t => {
          const target = activeEffects[t];
          if (eff.type === "agility-skill") {
            target.skill = Math.max(target.skill, eff.value);
          } else if (eff.type === "agility-bb") {
            target.bb = Math.max(target.bb, eff.value);
          } else if (eff.type === "pressure") {
            target.pressure = true;
          } else if (eff.type === "av-up") {
            actionValue[t] += eff.value;
          } else if (eff.type === "av-down") {
            actionValue[t] -= eff.value;
          }
        });
      }
    }

    // Calculate agility-based action value
    for (let i = 0; i < 10; i++) {
      let agi = agilityBase[i];
      const { skill, bb, pressure } = activeEffects[i];

      if (pressure) agi += Math.floor(agi * -0.3);
      if (skill > 0) agi += Math.floor(agi * (skill / 100));
      if (bb > 0) agi += Math.floor(agi * (bb / 100));

      agilityCurrent[i] = agi;

      actionValue[i] += agi + 100;
      result[i][turn] = actionValue[i];
    }

    for (let i = 0; i < 10; i++) {
      if (result[i][turn] >= 1000) {
        actionValue[i] = 0;
      }
    }
  }

  renderTable(result);
});

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

  const unit = document.getElementById("effect-modal").dataset.unit;
  const turn = document.getElementById("effect-modal").dataset.turn;
  const key = `unit-${unit}-turn-${turn}`;
  effectMap[key] = { type, value, turns, targets };

  console.log("Effect stored:", key, effectMap[key]);

  document.getElementById("effect-modal").classList.add("hidden");
});
