class Collectible extends Particle {
    constructor(x, y, vx = 0, vy = 0) {
        // Collectibles are gold dust particles attracted to the ship
        super(x, y, COLOR_ORANGE, BASE_SIZES.PARTICLE_R * GAME_SCALE, 7.0, 0, 0);
        this.vx = vx;
        this.vy = vy;
        this.inGravityWell = false;
        this.age = 0;
    }

    draw() {
        const glitterPulse = 3 + Math.sin(Date.now() / 50) * 3;
        ctx.globalAlpha = this.opacity * (Math.random() * 0.4 + 0.6);

        ctx.fillStyle = this.color;
        ctx.shadowColor = COLOR_ORANGE;
        ctx.shadowBlur = glitterPulse;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}