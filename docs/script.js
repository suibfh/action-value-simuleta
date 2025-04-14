document.addEventListener("DOMContentLoaded", () => {
  const unitCount = 10;
  const turnCount = 50;
  const agilityInputs = document.getElementById("agility-inputs");
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  const actionTable = document.getElementById("action-table");

  const agilities = new Array(unitCount).fill(null);
  const actionValues = new Array(unitCount).fill(0);
  const actionLog = Array.from({ length: turnCount }, () => new Array(unitCount).fill(0));

  // 入力欄を生成
  for (let i = 0; i < unitCount; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = `Unit ${i + 1}`;
    input.value = "";
    input.dataset.index = i;
    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.index);
      if (e.target.value === "") {
        agilities[idx] = null;
      } else {
        agilities[idx] = Number(e.target.value);
      }
    });
    agilityInputs.appendChild(input);
  }

  function simulate() {
    // 初期化
    for (let i = 0; i < unitCount; i++) {
      actionValues[i] = 0;
    }
    for (let t = 0; t < turnCount; t++) {
      for (let u = 0; u < unitCount; u++) {
        actionLog[t][u] = 0;
      }
    }

    for (let t = 0; t < turnCount; t++) {
      for (let u = 0; u < unitCount; u++) {
        if (agilities[u] === null) continue;
        actionValues[u] += agilities[u];
        actionLog[t][u] = actionValues[u];
        if (actionValues[u] >= 1000) {
          // 1000超えた行動値をそのまま表示（リセットはしない）
          // 視覚的には色で強調
        }
      }
    }
    renderTable();
  }

  function renderTable() {
    actionTable.innerHTML = "";
    const header = document.createElement("tr");
    header.innerHTML = `<th>Cycle</th>${[...Array(unitCount)].map((_, i) => `<th>Unit ${i + 1}</th>`).join("")}`;
    actionTable.appendChild(header);

    for (let t = 0; t < turnCount; t++) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${t + 1}</td>` +
        [...Array(unitCount)].map((_, u) => {
          const val = actionLog[t][u];
          const className = val >= 1000 ? "acted" : "";
          return `<td class="${className}">${val > 0 ? Math.floor(val) : ""}</td>`;
        }).join("");
      actionTable.appendChild(row);
    }
  }

  startBtn.addEventListener("click", simulate);

  resetBtn.addEventListener("click", () => {
    for (let i = 0; i < unitCount; i++) {
      agilityInputs.children[i].value = "";
      agilities[i] = null;
    }
    actionTable.innerHTML = "";
  });
});