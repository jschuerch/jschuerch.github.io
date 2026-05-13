import { CanvasEdgeMode, config, setMousePosition } from './config.js';
import { Particle } from './particles.js';
import { initUI } from './ui.js';

initUI(config);

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles;

// animation
function resize() {
  let ratioX = window.innerWidth / canvas.width;
  let ratioY = window.innerHeight / canvas.height;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles.forEach((p) => { p.x *= ratioX; p.y *= ratioY; });
}

function loop() {
  particles.forEach((p) => p.update());

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMouse();
  drawEdges();
  particles.forEach((p) => p.draw(ctx));

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

  ctx.strokeStyle = config.colors.edge;
  ctx.lineWidth = 0.6;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = Math.abs(particles[i].x - particles[j].x)
      const dy = Math.abs(particles[i].y - particles[j].y)
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.edges.maxDist) {
        ctx.globalAlpha = (1 - dist / config.edges.maxDist) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// utility functions
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', (e) => { setMousePosition(e.clientX, e.clientY); config.mouse.active = true; });
window.addEventListener('touchmove', (e) => {
  config.mouse.x = e.touches[0].clientX;
  config.mouse.y = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener('mouseleave', (e) => { setMousePosition(-9999, -9999); config.mouse.active = false; })
