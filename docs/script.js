document.addEventListener('DOMContentLoaded', () => {
  const unitCount = 10;
  const unitInputs = document.getElementById('unit-inputs');
  const form = document.getElementById('agility-form');
  const resultTable = document.getElementById('result-table');

  // Create input fields
  for (let i = 1; i <= unitCount; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.name = `unit${i}`;
    input.placeholder = `Unit${i} Agility`;
    // required removed
    unitInputs.appendChild(input);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateTurnOrder();
  });

  function calculateTurnOrder() {
    const agilityValues = [];
    const inputs = form.querySelectorAll('input');

    inputs.forEach((input) => {
      const value = input.value.trim();
      const agility = value === '' ? 0 : Number(value);
      agilityValues.push(agility);
    });

    const actionValues = new Array(unitCount).fill(0);
    const maxIterations = 50;
    resultTable.innerHTML = '';

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = `#${iteration}`;
      row.appendChild(labelCell);

      for (let i = 0; i < unitCount; i++) {
        actionValues[i] += agilityValues[i] + 100;

        const cell = document.createElement('td');

        if (actionValues[i] >= 1000) {
          cell.textContent = `${actionValues[i]} ●`;
          actionValues[i] = 0;
        } else {
          cell.textContent = actionValues[i];
        }

        row.appendChild(cell);
      }

      resultTable.appendChild(row);
    }
  }
});
