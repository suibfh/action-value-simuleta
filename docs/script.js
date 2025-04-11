document.addEventListener('DOMContentLoaded', () => {
  const unitCount = 10;
  const unitInputs = document.getElementById('unit-inputs');
  const form = document.getElementById('agility-form');
  const resultTable = document.getElementById('result-table');

  // 入力欄を生成
  for (let i = 1; i <= unitCount; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.name = `unit${i}`;
    input.placeholder = `Unit${i} Agility`;
    input.required = true;
    unitInputs.appendChild(input);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateTurnOrder();
  });

  function calculateTurnOrder() {
    // 初期敏捷値を取得
    const agilityValues = [];
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input) => {
      agilityValues.push(Number(input.value));
    });

    // 初期化
    const actionValues = new Array(unitCount).fill(0);
    const turnHistory = [];
    const maxIterations = 50;

    resultTable.innerHTML = '';

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = `#${iteration}`;
      row.appendChild(labelCell);

      for (let i = 0; i < unitCount; i++) {
        actionValues[i] += agilityValues[i] + 100;

        let cell = document.createElement('td');
        if (actionValues[i] >= 1000) {
          cell.textContent = `${actionValues[i]} ●`; // アクション発動
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
