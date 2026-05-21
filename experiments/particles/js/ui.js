import { CanvasEdgeMode } from './config.js';
import { createSection, createSlider, createCheckbox } from './controls.js'

const configContainer = document.querySelector('.configuration');

export function initUI(config, engine) {

  initConfigurationContainer(config);
  initCanvasEdgeMode(config);
}

function initConfigurationContainer(config) {
  /* Configuration toggle */
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
}


function initCanvasEdgeMode(config) {
  window.addEventListener('load', () => {
    // Initialise on page load
    document.querySelectorAll('.toggle-group').forEach(group => {
      const isOpen = configContainer.classList.contains('open');
      if (!isOpen) configContainer.classList.add('open');
      let idx = 0;
      if (config.canvasMode === CanvasEdgeMode.WRAP) idx = 1;
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
      let group = button.closest('.toggle-group');
      selectTab(group, index, button.dataset.mode);
    });

  });

  function selectTab(group, index, mode) {
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
}

export function buildConfigurations(config, engine) {

  const particlesSection = createSection('Particles');
  configContainer.appendChild(particlesSection);

  createSlider({
    parent: particlesSection,
    label: 'Count',
    min: 0,
    max: 1000,
    step: 1,
    value: config.particles.count,
    onChange: (value) => {
      engine.setParticleCount(value);
    }
  });

  createSlider({
    parent: particlesSection,
    label: 'Speed',
    min: 0,
    max: 20,
    step: 0.1,
    value: config.particles.speed,
    onChange: (value) => {
      engine.setParticleSpeed(value);
    }
  });


  const edgesSection = createSection('Edges');
  configContainer.appendChild(edgesSection);

  createCheckbox({
    parent: edgesSection,
    label: 'Show',
    checked: true,
    onChange: (value) => {
      config.edges.show = value;
    }
  });
}
