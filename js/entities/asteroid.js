class Asteroid {
    constructor(x, y, r, a, vx, vy, initialSizeID) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.a = a;
        this.vx = vx;
        this.vy = vy;

        const baseRockRadius = BASE_SIZES.ASTEROID_SIZE_MULT * GAME_SCALE;
        this.vert = Math.floor(r / baseRockRadius) + 7;
        this.offs = []; // Vertices offset for rough shape
        for (let i = 0; i < this.vert; i++) {
            this.offs.push(Math.random() * 0.4 + 0.8);
        }

        // Mega asteroids are magenta; others are cyan/blue
        this.color = initialSizeID === BASE_SIZES.ASTEROID_SIZE.MEGA
            ? COLOR_MAGENTA
            : COLOR_BLUE_ASTEROID;
        this.id = initialSizeID;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Screen wrapping logic
        const r = this.r * 1.5;
        if (this.x < -r) this.x = canvas.width + r;
        if (this.x > canvas.width + r) this.x = -r;
        if (this.y < -r) this.y = canvas.height + r;
        if (this.y > canvas.height + r) this.y = -r;
    }

    draw() {
        // Draw as a glowing wireframe
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        for (let i = 0; i < this.vert; i++) {
            let angle = (i / this.vert) * Math.PI * 2;
            let radius = this.r * this.offs[i];
            let x = this.x + radius * Math.cos(angle);
            let y = this.y + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}