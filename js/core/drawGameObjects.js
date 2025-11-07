function drawBullets() {
    // Draw player bullets
    bullets.forEach((b) => {
        // Draw glowing trail
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.r * 2;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 5;
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 0.05, b.y - b.vy * 0.05);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw bullet body
        if (b.isTriple) {
            const beamWidth = 4 * GAME_SCALE;
            const beamLength = 15 * GAME_SCALE;
            const angle = Math.atan2(b.vy, b.vx);

            ctx.fillStyle = COLOR_MAGENTA;
            ctx.shadowColor = COLOR_MAGENTA;
            ctx.shadowBlur = 10;

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(beamLength, 0);
            ctx.lineTo(0, beamWidth / 2);
            ctx.lineTo(-beamLength / 3, 0);
            ctx.lineTo(0, -beamWidth / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else {
            drawPolygon(b.x, b.y, b.r, 8, b.color);
        }
    });

    // Draw drone bullets
    droneBullets.forEach((b) => {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.r * 2;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 0.05, b.y - b.vy * 0.05);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.rect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
        ctx.fill();
    });
}

function drawGameObjects() {
    // Draw rock echoes first (background effect)
    particles.filter((p) => p.isEcho).forEach((p) => p.draw());

    // Draw main game objects
    asteroids.forEach((a) => a.draw());
    drones.forEach((d) => d.draw());
    if (ship) ship.draw();

    // Draw foreground particles
    particles.filter((p) => !(p instanceof RockEcho)).forEach((p) => p.draw());
    powerups.forEach((p) => p.draw());
}