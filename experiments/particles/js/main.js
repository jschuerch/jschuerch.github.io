import { config } from './config.js';
import { ParticleEngine } from './engine.js'
import { initUI, buildConfigurations } from './ui.js';

const canvas = document.getElementById('particle-canvas');

const engine = new ParticleEngine(canvas, config);

initUI(config, engine);

engine.start();

buildConfigurations(config, engine);