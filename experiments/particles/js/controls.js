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

  // Header row
  const header = document.createElement('div');
  header.className = 'slider-header';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const inputNumber = document.createElement('input');
  inputNumber.type = 'number';
  inputNumber.min = min;
  inputNumber.max = max;
  inputNumber.step = step;
  inputNumber.value = value;
  inputNumber.className = 'slider-number-input';

  header.append(labelEl, inputNumber);

  // Slider
  const inputRange = document.createElement('input');
  inputRange.type = 'range';
  inputRange.min = min;
  inputRange.max = max;
  inputRange.step = step;
  inputRange.value = value;

  function updateValue(newValue) {
    const parsed = Number(newValue);

    inputRange.value = parsed;
    inputNumber.value = parsed;

    onChange?.(parsed);
  }

  inputRange.addEventListener('input', () => {
    updateValue(inputRange.value);
  });

  inputNumber.addEventListener('change', () => {
    let value = Number(inputNumber.value);

    // Clamp value
    value = Math.max(min, Math.min(max, value));

    updateValue(value);
  });

  wrapper.append(header, inputRange);

  parent.appendChild(wrapper);

  return {
    wrapper,
    inputRange,
    inputNumber
  };
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