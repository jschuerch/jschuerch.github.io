import { CanvasEdgeMode } from './config.js';

export function initUI(config) {

  function selectTab(groupId, index, mode) {
    const group = document.getElementById(groupId);
    const buttons = group.querySelectorAll('button');
    const slider = group.querySelector('.toggle-slider');

    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    const activeBtn = buttons[index];
    slider.style.left = activeBtn.offsetLeft + 'px';
    slider.style.width = activeBtn.offsetWidth + 'px';

    config.canvasMode = mode;
  }

  /* Configuration toggle */
  const configContainer = document.querySelector('.configuration');
  const configToggle = configContainer.querySelector('.config-toggle');
  if (configContainer && configToggle) {
    configToggle.addEventListener('click', () => {
      configContainer.classList.toggle('open');
      configToggle.setAttribute(
        'aria-expanded',
        configContainer.classList.contains('open')
      );
    });
  }

  window.addEventListener('load', () => {
    // Initialise on page load
    document.querySelectorAll('.toggle-group').forEach(group => {
      const isOpen = configContainer.classList.contains('open');
      if (!isOpen) configContainer.classList.add('open');
      let idx = 0;
      if (config.canvasMode == CanvasEdgeMode.WRAP) idx = 1;
      const activeBtn = group.querySelectorAll('button')[idx];
      const slider = group.querySelector('.toggle-slider');
      activeBtn.classList.add('active');
      slider.style.left = activeBtn.offsetLeft + 'px';
      slider.style.width = activeBtn.offsetWidth + 'px';
      if (!isOpen) configContainer.classList.remove('open');
    });
  });

  const buttons = document.querySelectorAll('.toggle-group button');
  buttons.forEach((button, index) => {

    button.addEventListener('click', () => {
      selectTab("theme-toggle", index, button.dataset.mode);
    });

  });
}
