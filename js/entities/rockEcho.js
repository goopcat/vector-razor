class RockEcho extends Particle {
    constructor(x, y, r, vert, offs, vx, vy, life) {
        const scaledR = r * (Math.random() * 0.7 + 0.3);
        super(x, y, COLOR_GREY_GREEN, scaledR, life, 0, 0);

        this.vx = vx;
        this.vy = vy;

        this.originalVert = vert;
        this.originalOffs = offs;
        this.a = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
        this.isEcho = true; // Flag used for draw order
    }

    update(dt) {
        super.update(dt);
        this.a += this.rotationSpeed * dt;
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.opacity * 0.4);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.a);

        ctx.beginPath();
        for (let i = 0; i < this.originalVert; i++) {
            let angle = (i / this.originalVert) * Math.PI * 2;
            let radius = this.r * this.originalOffs[i];
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}