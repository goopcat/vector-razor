class Drone {
    constructor(x, y) {
        this.r = BASE_SIZES.DRONE_R * GAME_SCALE;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.a = 0;
        this.shieldHits = 0;
        this.shotTimer = Math.random() * 2.0;
        this.baseRotation = Math.random() * Math.PI * 2;
    }

    update(dt) {
        const targetX = ship ? ship.x : canvas.width / 2;
        const targetY = ship ? ship.y : canvas.height / 2;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = distBetweenPoints(this.x, this.y, targetX, targetY);

        const angleToShip = Math.atan2(dy, dx);
        this.a = angleToShip;

        const thrustMag = 100;
        let thrustAngle = angleToShip;

        if (dist > DRONE_ORBIT_DISTANCE * 1.1) {
            // 1. Fleeing: Move toward ship
            thrustAngle = angleToShip;
        } else if (dist < DRONE_ORBIT_DISTANCE * 0.9) {
            // 2. Too close: Move away from ship
            thrustAngle = angleToShip + Math.PI;
        } else {
            // 3. In orbit range: Move perpendicular to ship
            thrustAngle = angleToShip + Math.PI / 2;
        }

        // Add wobble for organic movement
        const wobbleAngle = Math.sin(Date.now() / 500) * 0.5;
        thrustAngle += wobbleAngle;

        this.vx += thrustMag * Math.cos(thrustAngle) * dt;
        this.vy += thrustMag * Math.sin(thrustAngle) * dt;

        this.vx *= 1 - 0.2 * dt; // Drag
        this.vy *= 1 - 0.2 * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Screen wrapping
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Shooting timer (only if ship exists)
        if (ship) {
            this.shotTimer -= dt;
            if (this.shotTimer <= 0) {
                this.shoot();
                this.shotTimer = 2.0;
            }
        }
    }

    shoot() {
        if (!ship) return;

        const dx = ship.x - this.x;
        const dy = ship.y - this.y;
        const angle = Math.atan2(dy, dx);

        droneBullets.push({
            x: this.x + this.r * Math.cos(angle),
            y: this.y + this.r * Math.sin(angle),
            vx: 300 * Math.cos(angle),
            vy: 300 * Math.sin(angle),
            r: BASE_SIZES.BULLET_R.DRONE * GAME_SCALE,
            color: COLOR_MAGENTA,
        });
    }

    draw() {
        const r = this.r;

        // Color shift based on damage (green -> cyan -> orange -> red)
        let currentHues;
        if (this.shieldHits < 2) currentHues = COLOR_GREEN;
        else if (this.shieldHits < 4) currentHues = COLOR_CYAN;
        else if (this.shieldHits < 6) currentHues = COLOR_ORANGE;
        else currentHues = COLOR_RED;

        ctx.strokeStyle = currentHues;
        ctx.lineWidth = 2;
        ctx.shadowColor = currentHues;
        ctx.shadowBlur = 8;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.baseRotation + Date.now() * 0.001);

        // Draw Central Core (Hexagon)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = r * 0.5 * Math.cos(angle);
            const y = r * 0.5 * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw Outer Shells (Hexagonal rings, fading based on shield hits)
        const shells = 3;
        for (let i = 0; i < shells; i++) {
            if (i * 2 < DRONE_SHIELD_MAX_HITS - this.shieldHits) {
                const scale = 1.0 + i * 0.2;
                ctx.globalAlpha = 1 - i * 0.2;

                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const angle = (j * Math.PI) / 3;
                    const x = r * scale * Math.cos(angle);
                    const y = r * scale * Math.sin(angle);
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}