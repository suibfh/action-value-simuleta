
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

      // Update points
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
          currentPoints[i] = basePoints[i]; // reset after action
        }
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
  });
});
