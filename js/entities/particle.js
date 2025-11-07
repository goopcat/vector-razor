class Particle {
    constructor(x, y, color, size, life, speed, angle) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.r = size;
        this.life = life;
        this.decay = 1 / life;
        this.age = 0;
        this.opacity = 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.age += dt;
        this.opacity = 1 - this.age * this.decay;
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class TextParticle extends Particle {
    constructor(x, y, text, color = COLOR_GREEN) {
        super(x, y, color, 0, 1.0, 50 * GAME_SCALE, -Math.PI / 2);
        this.text = text;
        this.baseOpacity = 0.8;
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.opacity * this.baseOpacity);
        const fontSize = 24 * GAME_SCALE;

        ctx.font = `bold ${fontSize}px Monospace`;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(this.text, this.x, this.y);

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}