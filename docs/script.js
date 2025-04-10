document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("result-table");
  const tbody = table?.querySelector("tbody");
  const form = document.getElementById("agility-form");
  const unitCount = 10;
  const turnLimit = 50;

  if (!form || !tbody || !table) return;

  function getInitialAgilities() {
    const inputs = document.querySelectorAll(".unit-agility");
    return Array.from(inputs).map((input) => Number(input.value) || 0);
  }

  function calculateTurnOrder() {
    const initialAgilities = getInitialAgilities();
    let currentPoints = Array(unitCount).fill(0);
    let actionHistory = [];
    const activeBuffs = Array(unitCount).fill(null).map(() => []);
    const pendingEffects = {};

    tbody.innerHTML = "";

    for (let turn = 1; turn <= turnLimit; turn++) {
      let actedUnits = [];

      for (let i = 0; i < unitCount; i++) {
        const buffs = activeBuffs[i];
        let base = initialAgilities[i];
        let adjusted = base;
        let effectLogs = [];

        buffs.forEach((buff) => {
          if (turn >= buff.appliedTurn) {
            if (buff.type === "buff") {
              adjusted += Math.floor(base * (buff.value / 100));
              effectLogs.push(`+${buff.value}%`);
            } else if (buff.type === "pressure") {
              adjusted += Math.floor(base * -0.3);
              effectLogs.push("-30%");
            }
          }
        });

        const gain = adjusted + 100;
        currentPoints[i] += gain;

        const cell = tbody.rows[turn - 1]?.cells[i + 1] || null;
        if (cell) {
          cell.innerText = `${currentPoints[i]}${effectLogs.length > 0 ? " (" + effectLogs.join(", ") + ")" : ""}`;
        }
      }

      for (let i = 0; i < unitCount; i++) {
        if (currentPoints[i] >= 1000) {
          actedUnits.push({ index: i, points: currentPoints[i] });
        }
      }

      if (actedUnits.length > 0) {
        actedUnits.sort((a, b) => b.points - a.points || a.index - b.index);
        const currentTurn = turn;

        actedUnits.forEach(({ index }) => {
          actionHistory.push({ turn: currentTurn, unit: index + 1 });

          if (pendingEffects[`unit${index + 1}-turn${turn}`]) {
            const effect = pendingEffects[`unit${index + 1}-turn${turn}`];
            effect.targets.forEach((target) => {
              activeBuffs[target].push({
                ...effect,
                appliedTurn: turn + 1,
                actionCount: 0,
                remaining: Number(effect.duration),
                pending: true,
              });
            });
          }

          currentPoints[index] = 0;
        });
      }

      for (let i = 0; i < unitCount; i++) {
        if (actedUnits.some((u) => u.index === i)) {
          const updatedBuffs = activeBuffs[i].map((buff) => {
            if (turn >= buff.appliedTurn) {
              if (buff.pending) {
                buff.pending = false;
              } else {
                buff.actionCount += 1;
              }
            }
            return buff;
          }).filter((buff) => buff.actionCount < buff.remaining);

          activeBuffs[i] = updatedBuffs;
        }
      }
    }

    for (let turn = 1; turn <= turnLimit; turn++) {
      const row = tbody.insertRow();
      row.insertCell().innerText = turn;
      for (let j = 0; j < unitCount; j++) {
        row.insertCell().innerText = currentPoints[j];
      }

      const act = actionHistory.filter((a) => a.turn === turn);
      act.forEach(({ unit }) => {
        row.cells[unit].classList.add("acted");
      });
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculateTurnOrder();
  });
});
