
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
    if (mode == ParticleMode.WRAP) idx = 1;
    const activeBtn = group.querySelectorAll('button')[idx];
    const slider = group.querySelector('.toggle-slider');
    activeBtn.classList.add('active');
    slider.style.left = activeBtn.offsetLeft + 'px';
    slider.style.width = activeBtn.offsetWidth + 'px';
    if (!isOpen) configContainer.classList.remove('open');
  });
});



const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles;

const config = {
  particles: {
    count: 120,
    radius: 2.5,
    speed: 1
  },

  edges: {
    maxDist: 120,
  },

  mouse: {
    x: -9999,
    y: -9999,
    repelRadius: 90,
    repelForce: 8
  },

  colors: {
    particle: '#ef77b5',
    edge: '#ef77b5',
    mouse: '#ef77b5', //'white',
    background: '#1f1f1f'
  },

  // visuals: {
  //   glow: true,
  //   trails: false
  // }
};

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vxRand = (Math.random() - 0.5);
    this.vx = this.vxRand * config.particles.speed;
    this.vyRand = (Math.random() - 0.5);
    this.vy = this.vyRand * config.particles.speed;
    this.rvx = 0;
    this.rvy = 0;
    this.color = config.colors.particle;
    this.radiusRand = (Math.random() * 0.8 + 0.2);
    this.radius = this.radiusRand * config.particles.radius;
    this.alpha = (Math.random() * 0.8 + 0.2);
  }

  update() {
    const dx = this.x - config.mouse.x;
    const dy = this.y - config.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < config.mouse.repelRadius && dist > 0) {
      const f = 1 - dist / config.mouse.repelRadius;
      let dirX = dx / dist;
      let dirY = dy / dist;
      this.rvx = dirX * f * config.mouse.repelForce;
      this.rvy = dirY * f * config.mouse.repelForce;
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
  particles = Array.from({ length: config.particles.count }, () => new Particle());
}


init();
loop();

window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', (e) => { config.mouse.x = e.clientX; config.mouse.y = e.clientY });
window.addEventListener('touchmove', (e) => {
  config.mouse.x = e.touches[0].clientX;
  config.mouse.y = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener('mouseleave', (e) => { config.mouse.x = -9999; config.mouse.y = -9999 })
