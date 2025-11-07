class Ship {
    constructor() {
        this.r = BASE_SIZES.SHIP_R * GAME_SCALE;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.a = Math.PI / 2; // Angle pointing up (or to the right if 0)
        this.vx = 0;
        this.vy = 0;
        this.canShoot = true; // Fire rate limiter via setTimeout
        this.thrusting = false;
        this.tripleShotActive = false;
        this.tripleShotTimer = 0;
        this.invincible = true; // Start invincible
        this.invincibleTimer = 3.0;
        this.lastBarrelFired = 9; // Alternating barrels (indices 1 and 9 of vertices)
    }

    getVertices() {
        const r = this.r;
        const a = this.a;
        return [
            { x: r * 1.4 * Math.cos(a), y: r * 1.4 * Math.sin(a) }, // Front Tip (idx 0)
            { x: r * 0.35 * Math.cos(a + 1.2), y: r * 0.35 * Math.sin(a + 1.2) }, // Right Barrel (idx 1)
            { x: r * 0.9 * Math.cos(a + 0.4), y: r * 0.9 * Math.sin(a + 0.4) },
            { x: r * 1.0 * Math.cos(a + Math.PI * 0.45), y: r * 1.0 * Math.sin(a + Math.PI * 0.45) },
            { x: r * 0.6 * Math.cos(a + Math.PI * 0.7), y: r * 0.6 * Math.sin(a + Math.PI * 0.7) }, // Right Engine (idx 4)
            { x: r * 0.5 * Math.cos(a + Math.PI), y: r * 0.5 * Math.sin(a + Math.PI) }, // Back Center (idx 5)
            { x: r * 0.6 * Math.cos(a - Math.PI * 0.7), y: r * 0.6 * Math.sin(a - Math.PI * 0.7) }, // Left Engine (idx 6)
            { x: r * 1.0 * Math.cos(a - Math.PI * 0.45), y: r * 1.0 * Math.sin(a - Math.PI * 0.45) },
            { x: r * 0.9 * Math.cos(a - 0.4), y: r * 0.9 * Math.sin(a - 0.4) },
            { x: r * 0.35 * Math.cos(a - 1.2), y: r * 0.35 * Math.sin(a - 1.2) }, // Left Barrel (idx 9)
        ];
    }

    shoot() {
        if (!this.canShoot || bullets.length >= BULLET_MAX) return;

        this.canShoot = false;
        const vertices = this.getVertices();

        if (this.tripleShotActive) {
            // Triple Shot Mode: fires three thin, magenta beams forward
            const centerBarrelVertex = vertices[0];
            const shotOrigin = {
                x: this.x + centerBarrelVertex.x * 0.7,
                y: this.y + centerBarrelVertex.y * 0.7,
            };
            const shotAngles = [this.a - 0.2, this.a, this.a + 0.2];
            const tripleBulletLife = BULLET_LIFE + TRIPLE_SHOT_LIFE_BOOST;

            shotAngles.forEach((angle) => {
                bullets.push({
                    x: shotOrigin.x,
                    y: shotOrigin.y,
                    vx: BULLET_SPEED * Math.cos(angle),
                    vy: BULLET_SPEED * Math.sin(angle),
                    life: tripleBulletLife,
                    r: 1.5 * GAME_SCALE,
                    color: COLOR_MAGENTA,
                    isTriple: true,
                });
            });
        } else {
            // Normal Shot Mode: fires a single, alternating orange octagon
            const normalBulletLife = BULLET_LIFE;
            const barrelIndex = this.lastBarrelFired === 1 ? 9 : 1;
            const barrel = vertices[barrelIndex];
            this.lastBarrelFired = barrelIndex;

            const shotOrigin = {
                x: this.x + barrel.x,
                y: this.y + barrel.y,
            };

            bullets.push({
                x: shotOrigin.x,
                y: shotOrigin.y,
                vx: BULLET_SPEED * Math.cos(this.a),
                vy: BULLET_SPEED * Math.sin(this.a),
                life: normalBulletLife,
                r: BASE_SIZES.BULLET_R.PLAYER * GAME_SCALE,
                color: COLOR_ORANGE,
                isTriple: false,
            });
        }

        // Re-enable shooting after delay
        setTimeout(() => {
            this.canShoot = true;
        }, FIRE_DELAY * 1000);
    }

    update(dt) {
        // Handle rotation based on controls
        if (controls.left) {
            this.a -= SHIP_TURN_SPEED * dt;
        }
        if (controls.right) {
            this.a += SHIP_TURN_SPEED * dt;
        }

        // Apply thrust and friction
        this.thrusting = controls.forward;
        if (this.thrusting) {
            this.vx += SHIP_THRUST * Math.cos(this.a) * dt;
            this.vy += SHIP_THRUST * Math.sin(this.a) * dt;
        } else {
            this.vx -= this.vx * SHIP_FRICTION * dt;
            this.vy -= this.vy * SHIP_FRICTION * dt;
        }

        // Update position and screen wrapping
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        scoreOffset -= this.vx * dt;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Update power-up and invincibility timers
        if (this.tripleShotActive) {
            this.tripleShotTimer -= dt;
            if (this.tripleShotTimer <= 0) {
                this.tripleShotActive = false;
            }
        }
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    draw() {
        const vertices = this.getVertices();

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw Ship Hull (Yellow Outline)
        ctx.strokeStyle = COLOR_YELLOW;
        ctx.lineWidth = 2;
        ctx.shadowColor = COLOR_YELLOW;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw Ship Thrust Trail (Rez Vector Trails)
        if (this.thrusting) {
            const v5 = vertices[5];
            const v4 = vertices[4];
            const v6 = vertices[6];

            const flameInner = '#ffffff';
            const flameMid = COLOR_ORANGE;
            const flameOuter = COLOR_RED;
            const baseFlameLength = this.r * 1.8;

            // Draw enhanced flames
            [v4, v6].forEach((v, i) => {
                const offset = i === 0 ? 0.2 : -0.2;
                const angle_back = this.a + Math.PI;
                const flameLength = baseFlameLength + Math.random() * this.r * 0.5;

                // Outer flame
                ctx.fillStyle = flameOuter;
                ctx.shadowColor = flameOuter;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(v.x, v.y);
                ctx.lineTo(
                    v.x + flameLength * Math.cos(angle_back + offset * 1.2),
                    v.y + flameLength * Math.sin(angle_back + offset * 1.2)
                );
                ctx.lineTo(
                    v.x + flameLength * 0.7 * Math.cos(angle_back - offset),
                    v.y + flameLength * 0.7 * Math.sin(angle_back - offset)
                );
                ctx.closePath();
                ctx.fill();

                // Inner flame
                ctx.fillStyle = flameInner;
                ctx.shadowColor = flameInner;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(v.x, v.y);
                ctx.lineTo(
                    v.x + flameLength * 0.5 * Math.cos(angle_back + offset * 0.4),
                    v.y + flameLength * 0.5 * Math.sin(angle_back + offset * 0.4)
                );
                ctx.lineTo(
                    v.x + flameLength * 0.3 * Math.cos(angle_back - offset * 0.4),
                    v.y + flameLength * 0.3 * Math.sin(angle_back - offset * 0.4)
                );
                ctx.closePath();
                ctx.fill();
            });

            // Draw Center Thruster
            ctx.fillStyle = flameMid;
            ctx.shadowColor = flameMid;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(
                v5.x,
                v5.y,
                this.r * 0.5,
                this.a + Math.PI - 0.5,
                this.a + Math.PI + 0.5
            );
            ctx.lineTo(
                v5.x + this.r * 2 * Math.cos(this.a + Math.PI),
                v5.y + this.r * 2 * Math.sin(this.a + Math.PI)
            );
            ctx.closePath();
            ctx.fill();
        }

        // Invincibility shield effect (flashing cyan ring)
        if (this.invincible && (this.invincibleTimer * 100) % 20 > 5) {
            ctx.strokeStyle = COLOR_CYAN;
            ctx.lineWidth = 4;
            ctx.shadowColor = COLOR_CYAN;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, this.r * 1.5, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        // Draw blaster glows
        const barrelColor = COLOR_YELLOW;
        const barrelWidth = BASE_SIZES.BLASTER_SIZE * GAME_SCALE;

        [vertices[1], vertices[9]].forEach((v) => {
            ctx.fillStyle = barrelColor;
            ctx.shadowColor = barrelColor;
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.arc(v.x, v.y, barrelWidth * 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    die() {
        if (this.invincible) return;

        lives--;
        triggerShake(SHAKE_MAX_INTENSITY * 2);

        // Particle explosions
        createParticles(50, this.x, this.y, COLOR_RED, 4.0, 1.5, 300);
        createParticles(30, this.x, this.y, '#ffffff', 2.0, 1.0, 200);

        // Reset combo on death
        combo = 1;
        comboTimer = 0;

        if (lives <= 0) {
            gameOver();
        } else {
            // Respawn logic
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.vx = 0;
            this.vy = 0;
            this.invincible = true;
            this.invincibleTimer = 3.0;
            this.tripleShotActive = false;
            this.tripleShotTimer = 0;

            droneBullets = [];
        }
    }
}