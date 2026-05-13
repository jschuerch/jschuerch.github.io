
/* CONFIGURATION */
const ParticleMode = {
  BOUNCE: "bounce",
  WRAP: "wrap"
};
let mode = ParticleMode.BOUNCE;

function selectTab(groupId, index, newMode) {
  const group = document.getElementById(groupId);
  const buttons = group.querySelectorAll('button');
  const slider = group.querySelector('.toggle-slider');

  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  const activeBtn = buttons[index];
  slider.style.left = activeBtn.offsetLeft + 'px';
  slider.style.width = activeBtn.offsetWidth + 'px';

  mode = newMode;
}

/* Configuration toggle */
const config = document.querySelector('.configuration');
const configToggle = config.querySelector('.config-toggle');
if (config && configToggle) {
  configToggle.addEventListener('click', () => {
    config.classList.toggle('open');
    configToggle.setAttribute(
      'aria-expanded',
      config.classList.contains('open')
    );
  });
}

// Initialise on page load
document.querySelectorAll('.toggle-group').forEach(group => {
  const isOpen = config.classList.contains('open');
  if (!isOpen) config.classList.add('open');
  let idx = 0;
  if (mode == ParticleMode.WRAP) idx = 1;
  const activeBtn = group.querySelectorAll('button')[idx];
  const slider = group.querySelector('.toggle-slider');
  activeBtn.classList.add('active');
  slider.style.left = activeBtn.offsetLeft + 'px';
  slider.style.width = activeBtn.offsetWidth + 'px';
  if (!isOpen) config.classList.remove('open');
});



const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles;
let mouse = { x: -9999, y: -9999 };

const count = 120;
const radius = 2.5;
const maxEdgeDist = 120;
const speed = 1;
const repel = 90;
const force = 8;
const color = '#ef77b5';
const colorMouse = 'white';
let colorBackground = '#1f1f1f';

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.rvx = 0;
    this.rvy = 0;
    this.color = color;
    this.radius = (Math.random() * 0.8 + 0.2) * radius;
    this.alpha = (Math.random() * 0.8 + 0.2);
  }

  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < repel && dist > 0) {
      const f = 1 - dist / repel;
      let dirX = dx / dist;
      let dirY = dy / dist;
      this.rvx = dirX * f * force;
      this.rvy = dirY * f * force;
    }
    this.x += this.vx + this.rvx;
    this.y += this.vy + this.rvy;
    this.rvx *= 0.98;
    this.rvy *= 0.98;

    // Keep particles inside the canvas
    if (mode == ParticleMode.BOUNCE) {
      if (this.x < 0 || this.x > W) {
        this.vx *= -1;
        if (this.x < 0) this.x = 0;
        if (this.x > W) this.x = W;
      }
      if (this.y < 0 || this.y > H) {
        this.vy *= -1;
        if (this.y < 0) this.y = 0;
        if (this.y > H) this.y = H;
      }
    } else if (mode == ParticleMode.WRAP) {
      this.wrapParticles();
    }
  }

  wrapParticles() {
    if (this.x < 0) {
      this.x = W;
    } else if (this.x > W) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = H;
    } else if (this.y > H) {
      this.y = 0;
    }
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMouse() {
  useFilter = true;
  if (useFilter) {
    // Set the blur intensity
    ctx.filter = 'blur(30px)';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, repel / 2, 0, Math.PI * 2);
    ctx.fillStyle = colorMouse;
    ctx.fill();

    ctx.globalAlpha = 1;
    // Reset filter for future drawings
    ctx.filter = 'none';
  } else {
    ctx.shadowColor = colorMouse;

    ctx.shadowBlur = 40;
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.fillStyle = colorBackground;
    ctx.arc(mouse.x, mouse.y, repel / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4;

    ctx.beginPath();
    ctx.fillStyle = colorMouse;
    ctx.arc(mouse.x, mouse.y, repel / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

}

function drawEdges() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < particles.length; j++) {
      dx = Math.abs(particles[i].x - particles[j].x)
      dy = Math.abs(particles[i].y - particles[j].y)
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxEdgeDist) {
        ctx.globalAlpha = (1 - dist / maxEdgeDist) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  particles.forEach((p) => p.reset());
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawMouse();
  particles.forEach((p) => { p.update(); p.draw(); });
  drawEdges();
  requestAnimationFrame(loop);
}

function init() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  particles = Array.from({ length: count }, () => new Particle());
}


init();
loop();

window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY });
window.addEventListener('touchmove', (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener('mouseleave', (e) => { mouse.x = -9999; mouse.y = -9999 })
