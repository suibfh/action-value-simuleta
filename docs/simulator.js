document.getElementById('add-effect-row').addEventListener('click', function () {
  const table = document.getElementById('effects-table').querySelector('tbody');
  const newRow = table.rows[0].cloneNode(true);
  [...newRow.querySelectorAll('input')].forEach(input => input.value = '');
  table.appendChild(newRow);
});

document.getElementById('run-sim').addEventListener('click', function () {
  const unitNames = [...document.querySelectorAll('.unit-name')].map(input => input.value || 'ユニット');
  const unitAgis = [...document.querySelectorAll('.unit-agi')].map(input => parseInt(input.value) || 0);

  const effects = [...document.querySelectorAll('#effects-table tbody tr')].map(row => ({
    turn: parseInt(row.querySelector('.turn').value),
    caster: parseInt(row.querySelector('.caster').value),
    target: row.querySelector('.target').value,
    type: row.querySelector('.effect-type').value,
    value: parseInt(row.querySelector('.value').value),
    duration: parseInt(row.querySelector('.duration').value),
    probability: parseInt(row.querySelector('.probability').value)
  }));

  const results = document.getElementById('results');
  results.innerHTML = '<h2>（仮）入力確認</h2><pre>' + JSON.stringify({ unitNames, unitAgis, effects }, null, 2) + '</pre>';
});
