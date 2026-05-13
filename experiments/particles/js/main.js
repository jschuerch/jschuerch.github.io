import { CanvasEdgeMode, config } from './config.js';
import { Particle } from './particles.js';
import { initUI } from './ui.js';

// setup
initUI(config);

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles;

// input

// animation
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles.forEach((p) => p.reset());
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMouse();
  particles.forEach((p) => { p.update(); p.draw(ctx); });
  drawEdges();
  requestAnimationFrame(loop);
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = Array.from({ length: config.particles.count }, () => new Particle(canvas, config));
}

init();
loop();

// rendering helpers
function drawMouse() {
  if (!config.mouse.active)
    return;

  const useFilter = true;
  if (useFilter) {
    // Set the blur intensity
    ctx.filter = 'blur(30px)';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(config.mouse.x, config.mouse.y, config.mouse.repelRadius / 2, 0, Math.PI * 2);
    ctx.fillStyle = config.colors.mouse;
    ctx.fill();

    ctx.globalAlpha = 1;
    // Reset filter for future drawings
    ctx.filter = 'none';
  } else {
    ctx.shadowColor = config.colors.mouse;

    ctx.shadowBlur = 40;
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.fillStyle = config.colors.background;
    ctx.arc(config.mouse.x, config.mouse.y, config.mouse.repelRadius / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4;

    ctx.beginPath();
    ctx.fillStyle = config.colors.mouse;
    ctx.arc(config.mouse.x, config.mouse.y, config.mouse.repelRadius / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

}

function drawEdges() {
  if (!config.edges.show)
    return;

  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < particles.length; j++) {
      const dx = Math.abs(particles[i].x - particles[j].x)
      const dy = Math.abs(particles[i].y - particles[j].y)
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.edges.maxDist) {
        ctx.globalAlpha = (1 - dist / config.edges.maxDist) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = config.colors.edge;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// utility functions
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', (e) => { config.mouse.x = e.clientX; config.mouse.y = e.clientY; config.mouse.active = true; });
window.addEventListener('touchmove', (e) => {
  config.mouse.x = e.touches[0].clientX;
  config.mouse.y = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener('mouseleave', (e) => { config.mouse.x = -9999; config.mouse.y = -9999; config.mouse.active = false; })
