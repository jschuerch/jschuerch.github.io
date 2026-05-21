export function createSection(title) {
  const section = document.createElement('div');
  section.className = 'config-group';

  const label = document.createElement('span');
  label.className = 'config-label';
  label.textContent = title;

  section.appendChild(label);

  return section;
}

export function createSlider({
  parent,
  label,
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'slider-control';

  const topRow = document.createElement('div');
  topRow.className = 'slider-header';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.textContent = value;

  topRow.append(labelEl, valueEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  input.addEventListener('input', () => {
    const newValue = Number(input.value);

    valueEl.textContent = newValue;

    onChange?.(newValue);
  });

  wrapper.append(topRow, input);

  parent.appendChild(wrapper);

  return input;
}

export function createCheckbox({
  parent,
  label,
  checked = false,
  onChange
}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'checkbox-control';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;

  const text = document.createElement('span');
  text.textContent = label;

  input.addEventListener('change', () => {
    onChange?.(input.checked);
  });

  wrapper.append(input, text);

  parent.appendChild(wrapper);

  return input;
}