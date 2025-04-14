document.addEventListener("DOMContentLoaded", () => {
  const unitCount = 10;
  const turnCount = 50;
  const agilityInputs = document.getElementById("agility-inputs");
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  const actionTable = document.getElementById("action-table");

  const agilities = new Array(unitCount).fill(0);
  const actionValues = new Array(unitCount).fill(0);
  const actionLog = Array.from({ length: turnCount }, () => []);

  // 入力欄を生成
  for (let i = 0; i < unitCount; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = `ユニット${i + 1}`;
    input.value = 0;
    input.dataset.index = i;
    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.index);
      agilities[idx] = Number(e.target.value) || 0;
    });
    agilityInputs.appendChild(input);
  }

  function simulate() {
    // 初期化
    for (let i = 0; i < unitCount; i++) {
      actionValues[i] = 0;
    }
    for (let i = 0; i < turnCount; i++) {
      actionLog[i] = [];
    }

    for (let t = 0; t < turnCount; t++) {
      for (let u = 0; u < unitCount; u++) {
        actionValues[u] += agilities[u];
        if (actionValues[u] >= 1000) {
          actionValues[u] -= 1000;
          actionLog[t].push(u);
        }
      }
    }
    renderTable();
  }

  function renderTable() {
    actionTable.innerHTML = "";
    const header = document.createElement("tr");
    header.innerHTML = `<th>演算</th>${[...Array(unitCount)].map((_, i) => `<th>ユニット${i + 1}</th>`).join("")}`;
    actionTable.appendChild(header);

    for (let t = 0; t < turnCount; t++) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${t + 1}</td>` +
        [...Array(unitCount)].map((_, u) => {
          return `<td class="${actionLog[t].includes(u) ? "acted" : ""}">${actionLog[t].includes(u) ? "⚙" : ""}</td>`;
        }).join("");
      actionTable.appendChild(row);
    }
  }

  startBtn.addEventListener("click", simulate);

  resetBtn.addEventListener("click", () => {
    for (let i = 0; i < unitCount; i++) {
      agilityInputs.children[i].value = 0;
      agilities[i] = 0;
    }
    actionTable.innerHTML = "";
  });
});