class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.r = (type === 'triple' ? BASE_SIZES.POWERUP_R : BASE_SIZES.POWERUP_R * 1.2) * GAME_SCALE;
        this.type = type;
        this.a = Math.random() * Math.PI * 2;
        this.life = POWERUP_TOTAL_LIFE;

        if (type === 'triple') {
            this.color = COLOR_ORANGE;
            this.symbol = 'T';
            this.symbolColor = COLOR_MAGENTA;
        } else {
            this.color = COLOR_GREEN;
            this.symbol = '+';
            this.symbolColor = COLOR_GREEN;
        }
    }

    update(dt) {
        // Powerups remain stationary but rotate
        this.a += 1 * dt;
        this.life -= dt;

        // Screen wrapping (though powerups usually spawn safely in the middle)
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        // Drawing logic includes fading and blinking when expiration approaches
        let opacity = 1;
        let blink = false;

        if (this.life < POWERUP_FADE_TIME && this.life > 0) {
            blink = Math.floor(this.life * 5) % 2 === 0;
            opacity = Math.max(0, this.life / POWERUP_FADE_TIME);
        } else if (this.life <= 0) {
            return;
        }

        if (blink) return;

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.a);

        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -this.r);
        ctx.lineTo(this.r, 0);
        ctx.lineTo(0, this.r);
        ctx.lineTo(-this.r, 0);
        ctx.closePath();
        ctx.stroke();

        // Draw inner symbol
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.symbolColor;
        ctx.shadowColor = this.symbolColor;
        ctx.font = `${this.r}px Monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(this.symbol, 0, 0);

        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}