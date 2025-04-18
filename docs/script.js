document.getElementById('simulate').addEventListener('click', simulate);

function simulate() {
  const agi = [];
  for (let i = 1; i <= 10; i++) {
    const val = parseInt(document.getElementById('agi' + i).value, 10);
    agi.push(isNaN(val) ? 0 : val);
  }

  const av = new Array(10).fill(0);
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';

  const MAX_STEP = 50;

  for (let step = 1; step <= MAX_STEP; step++) {
    for (let i = 0; i < 10; i++) {
      av[i] += agi[i] + 100;
    }

    const row = document.createElement('tr');
    const stepCell = document.createElement('td');
    stepCell.textContent = step;
    row.appendChild(stepCell);

    for (let i = 0; i < 10; i++) {
      const cell = document.createElement('td');
      if (av[i] >= 1000) {
        cell.classList.add('action');
        cell.textContent = av[i];
        av[i] = 0;
      } else {
        cell.textContent = av[i];
      }
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }
}
