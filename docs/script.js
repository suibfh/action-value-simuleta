document.addEventListener('DOMContentLoaded', () => {
  const unitCount = 10;
  const unitInputs = document.getElementById('unit-inputs');
  const form = document.getElementById('agility-form');
  const resultTable = document.getElementById('result-table');

  const effectMap = {};

  for (let i = 1; i <= unitCount; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.name = `unit${i}`;
    input.placeholder = `Unit${i} Agility`;
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

          const btn = document.createElement('button');
          btn.textContent = '⚙';
          btn.title = 'Set Effect';
          btn.onclick = () => openEffectModal(i, iteration);
          cell.appendChild(btn);
        } else {
          cell.textContent = actionValues[i];
        }

        row.appendChild(cell);
      }

      resultTable.appendChild(row);
    }
  }

  function openEffectModal(unitIndex, turnNumber) {
    closeModal();

    const modal = document.createElement('div');
    modal.id = 'effect-modal';
    modal.style.position = 'fixed';
    modal.style.top = '30%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -30%)';
    modal.style.padding = '20px';
    modal.style.backgroundColor = 'white';
    modal.style.border = '1px solid #ccc';
    modal.style.zIndex = '1000';

    const header = document.createElement('div');
    header.textContent = `Effect Settings - Unit${unitIndex + 1}, Turn ${turnNumber}`;
    modal.appendChild(header);

    const typeSelect = document.createElement('select');
    const effectTypes = [
      { label: 'Agility Buff', value: 'agility_buff' },
      { label: 'Pressure', value: 'pressure' },
      { label: 'Action Value Up', value: 'av_up' },
      { label: 'Action Value Down', value: 'av_down' }
    ];

    effectTypes.forEach(effect => {
      const option = document.createElement('option');
      option.value = effect.value;
      option.textContent = effect.label;
      typeSelect.appendChild(option);
    });
    modal.appendChild(typeSelect);

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.placeholder = 'Value';
    modal.appendChild(valueInput);

    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.placeholder = 'Turns';
    durationInput.id = 'duration-input';
    modal.appendChild(durationInput);

    typeSelect.addEventListener('change', () => {
      const selected = typeSelect.value;
      const durationField = document.getElementById('duration-input');
      if (selected === 'av_up' || selected === 'av_down') {
        durationField.style.display = 'none';
      } else {
        durationField.style.display = '';
      }
    });
    typeSelect.dispatchEvent(new Event('change')); // initial trigger

    const targetLabel = document.createElement('div');
    targetLabel.textContent = 'Target Units:';
    modal.appendChild(targetLabel);

    const targets = [];
    for (let i = 0; i < unitCount; i++) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = i;
      checkbox.id = `target-${i}`;
      const label = document.createElement('label');
      label.htmlFor = `target-${i}`;
      label.textContent = `Unit${i + 1}`;
      modal.appendChild(checkbox);
      modal.appendChild(label);
      targets.push(checkbox);
    }

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
      if (!effectMap[unitIndex]) {
        effectMap[unitIndex] = {};
      }
      const selectedTargets = targets.filter(cb => cb.checked).map(cb => Number(cb.value));
      const selectedType = typeSelect.value;
      const fixedDuration = (selectedType === 'av_up' || selectedType === 'av_down') ? 1 : Number(durationInput.value);
      effectMap[unitIndex][turnNumber] = {
        type: selectedType,
        value: Number(valueInput.value),
        duration: fixedDuration,
        targets: selectedTargets
      };
      closeModal();
    };
    modal.appendChild(saveBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => {
      if (effectMap[unitIndex]) {
        delete effectMap[unitIndex][turnNumber];
      }
      closeModal();
    };
    modal.appendChild(resetBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = closeModal;
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);
  }

  function closeModal() {
    const modal = document.getElementById('effect-modal');
    if (modal) {
      modal.remove();
    }
  }
});
