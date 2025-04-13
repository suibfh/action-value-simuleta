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
  }

  renderTable(result);
});

function renderTable(data) {
  const container = document.getElementById("simulation-result");
  container.innerHTML = "";

  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = "<th>ユニット\\演算</th>" + Array.from({ length: 50 }, (_, i) => `<th>${i + 1}</th>`).join("");
  table.appendChild(header);

  data.forEach((row, unitIndex) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>ユニット${unitIndex + 1}</td>` + row.map(value => {
      return value >= 1000 ? `<td class='acted'>${value}</td>` : `<td>${value}</td>`;
    }).join("");
    table.appendChild(tr);
  });

  container.appendChild(table);
}
