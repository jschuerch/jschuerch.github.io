import { CanvasEdgeMode, setMousePosition } from './config.js';
import { Particle } from './particles.js';

export class ParticleEngine {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d');
    this.config = config;

    this.particles = [];

    this.config = config;

    this.initParticles();

    this.addEventListeners();
  }

  initParticles() {
    this.particles = Array.from({ length: this.config.particles.count }, () => new Particle(this.canvas, this.config));
  }

  setParticleCount(value) {
    this.config.particles.count = value;
    if (value < this.particles.length) {
      this.particles = this.particles.slice(0, value);
    } else {
      const newParticles = Array.from(
        { length: value - this.particles.length },
        () => new Particle(this.canvas, this.config)
      );
      this.particles.push(...newParticles);
    }
  }

  setParticleSpeed(value) {
    this.config.particles.speed = value;
    this.particles.forEach(p => p.updateProperties());
  }

  resize = () => {
    const ratioX = window.innerWidth / this.canvas.width;
    const ratioY = window.innerHeight / this.canvas.height;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.particles.forEach((p) => { p.x *= ratioX; p.y *= ratioY; });
  }

  update() {
    this.particles.forEach((p) => p.update());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawMouse();
    this.drawEdges();

    this.particles.forEach((p) => p.draw(this.ctx));
  }

  drawMouse() {
    if (!this.config.mouse.active) return;

    this.ctx.save();

    const useFilter = true;
    if (useFilter) {
      this.ctx.filter = 'blur(30px)';
      this.ctx.globalAlpha = 0.2;
      this.ctx.beginPath();
      this.ctx.arc(this.config.mouse.x, this.config.mouse.y, this.config.mouse.repelRadius / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.colors.mouse;
      this.ctx.fill();
    } else {
      this.ctx.shadowColor = this.config.colors.mouse;

      this.ctx.shadowBlur = 40;
      this.ctx.globalAlpha = 1;

      this.ctx.beginPath();
      this.ctx.fillStyle = this.config.colors.background;
      this.ctx.arc(this.config.mouse.x, this.config.mouse.y, this.config.mouse.repelRadius / 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 0.4;

      this.ctx.beginPath();
      this.ctx.fillStyle = this.config.colors.mouse;
      this.ctx.arc(this.config.mouse.x, this.config.mouse.y, this.config.mouse.repelRadius / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawEdges() {
    if (!this.config.edges.show) return;

    this.ctx.strokeStyle = this.config.colors.edge;
    this.ctx.lineWidth = 0.6;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.config.edges.maxDist) {
          this.ctx.globalAlpha = (1 - dist / this.config.edges.maxDist) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
  }

  addEventListeners() {
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('mousemove', (e) => { setMousePosition(e.clientX, e.clientY); this.config.mouse.active = true; });
    window.addEventListener('touchmove', (e) => {
      setMousePosition(e.touches[0].clientX, e.touches[0].clientY); this.config.mouse.active = true;
    }, { passive: true });
    this.canvas.addEventListener('mouseleave', (e) => this.config.mouse.active = false);
  }

  loop = () => {
    this.update();
    this.draw();

    requestAnimationFrame(this.loop);
  }

  start() {
    this.loop();
  }
}