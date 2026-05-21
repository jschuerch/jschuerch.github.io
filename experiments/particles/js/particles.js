import { CanvasEdgeMode } from './config.js';

export class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    this.generateSeeds();
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.trails = []
    this.updateProperties();
    this.rvx = 0;
    this.rvy = 0;
  }

  generateSeeds() {
    this.vxSeed = (Math.random() - 0.5);
    this.vySeed = (Math.random() - 0.5);
    this.radiusSeed = (Math.random() * 0.8 + 0.2);
    this.alpha = (Math.random() * 0.8 + 0.2);
  }

  updateProperties() {
    const dirX = Math.sign(this.vx || this.vxSeed);
    const dirY = Math.sign(this.vy || this.vySeed);

    this.vx = Math.abs(this.vxSeed * this.config.particles.speed) * dirX;
    this.vy = Math.abs(this.vySeed * this.config.particles.speed) * dirY;

    this.color = this.config.colors.particle;
    this.radius = this.radiusSeed * this.config.particles.radius;
  }

  update() {
    if (this.config.mouse.active) {
      const dx = this.x - this.config.mouse.x;
      const dy = this.y - this.config.mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.config.mouse.repelRadius && dist > 0) {
        const f = 1 - dist / this.config.mouse.repelRadius;
        let dirX = dx / dist;
        let dirY = dy / dist;
        this.rvx = dirX * f * this.config.mouse.repelForce;
        this.rvy = dirY * f * this.config.mouse.repelForce;
      }
    }
    if (this.config.particles.showTrails) {
      this.trails.push({ x: this.x, y: this.y });
      while (this.trails.length > this.config.particles.trailLength) {
        this.trails.shift();
      }
    }
    this.x += this.vx + this.rvx;
    this.y += this.vy + this.rvy;
    this.rvx *= 0.98;
    this.rvy *= 0.98;

    // Keep particles inside the canvas
    if (this.config.canvasMode === CanvasEdgeMode.BOUNCE) {
      if (this.x < 0 || this.x > this.canvas.width) {
        this.vx *= -1;
        if (this.x < 0) this.x = 0;
        if (this.x > this.canvas.width) this.x = this.canvas.width;
      }
      if (this.y < 0 || this.y > this.canvas.height) {
        this.vy *= -1;
        if (this.y < 0) this.y = 0;
        if (this.y > this.canvas.height) this.y = this.canvas.height;
      }
    } else if (this.config.canvasMode === CanvasEdgeMode.WRAP) {
      this.wrapParticles();
    }
  }

  wrapParticles() {
    if (this.x < 0) {
      this.x = this.canvas.width;
    } else if (this.x > this.canvas.width) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = this.canvas.height;
    } else if (this.y > this.canvas.height) {
      this.y = 0;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;

    if (this.config.particles.showTrails) {
      const trailAlpha = 1 / (this.config.particles.trailLength + 1);
      let offset = this.config.particles.trailLength - this.trails.length;
      for (let i = 0; i < this.trails.length; i++) {
        let strength = (trailAlpha * (offset + i + 1));
        ctx.beginPath();
        ctx.globalAlpha = this.alpha * strength;
        ctx.arc(this.trails[i].x, this.trails[i].y, this.radius * strength, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.globalAlpha = this.alpha;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

