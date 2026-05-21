import { CanvasEdgeMode } from './config.js';

export class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;

    this.generateSeeds();
    this.reset();
  }

  reset() {
    this.trailLength = this.config.particles.trailLength;
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.trails = {
      x: [],
      y: []
    }
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
    this.vx = this.vxSeed * this.config.particles.speed;
    this.vy = this.vySeed * this.config.particles.speed;
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
    if (this.trailLength > 0) {
      this.trails.x.push(this.x)
      this.trails.y.push(this.y)
      if (this.trails.x.length > this.trailLength) {
        this.trails.x.shift();
        this.trails.y.shift();
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

    if (this.trailLength > 0) {
      const trailAlpha = 1 / (this.trailLength + 1);
      let i = this.trailLength - this.trails.x.length;
      for (; i < this.trailLength; i++) {
        let strength = (trailAlpha * (i + 1));
        ctx.beginPath();
        ctx.globalAlpha = this.alpha * strength;
        ctx.arc(this.trails.x[i], this.trails.y[i], this.radius * strength, 0, Math.PI * 2);
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