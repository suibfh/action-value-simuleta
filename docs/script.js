document.getElementById("start-simulation").addEventListener("click", () => {
  const agility = [];
  for (let i = 1; i <= 10; i++) {
    const val = parseInt(document.getElementById(`agility-${i}`).value) || 0;
    agility.push(val);
  }

  const result = Array.from({ length: 10 }, () => []);
  const actionValue = new Array(10).fill(0);

  for (let turn = 0; turn < 50; turn++) {
    for (let i = 0; i < 10; i++) {
      actionValue[i] += agility[i] + 100;
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
      const cell = `<td class='${isActed ? "acted" : ""}'>
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
      document.getElementById("effect-modal").classList.remove("hidden");
    });
  });
}

document.getElementById("effect-close").addEventListener("click", () => {
  document.getElementById("effect-modal").classList.add("hidden");
});
