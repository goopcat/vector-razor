// --- Canvas Drawing Functions ---
function setupCanvasSize() {
    const container = document.getElementById('game-container');
    let w = window.innerWidth * 0.95;
    let h = window.innerHeight * 0.95;

    if (w / h > 16 / 9) {
        w = (h * 16) / 9;
    } else {
        h = (w * 9) / 16;
    }

    const maxWidth = 1600;
    if (w > maxWidth) {
        w = maxWidth;
        h = (w * 9) / 16;
    }

    canvas.width = w;
    canvas.height = h;
    container.style.width = w + 'px';
    container.style.height = h + 'px';
    document.documentElement.style.setProperty('--canvas-width', w + 'px');

    const scaleX = w / REFERENCE_WIDTH;
    const scaleY = h / REFERENCE_HEIGHT;
    GAME_SCALE = Math.min(scaleX, scaleY);

    if (ship) {
        ship.r = BASE_SIZES.SHIP_R * GAME_SCALE;
    }
}

function drawGrid() {
    const gridSize = BASE_SIZES.GRID_SIZE * GAME_SCALE;
    const minDim = Math.min(canvas.width, canvas.height);
    const illuminationRadius = minDim * 0.25;

    // 1. Draw Regional Illumination Sources
    illuminationPoints.forEach((p) => {
        const ageRatio = p.age / p.life;
        const opacity = 1.0 * (1 - ageRatio);

        ctx.globalAlpha = opacity;
        const lightRadius = illuminationRadius;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, lightRadius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${Math.max(0, opacity * 0.2)})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 255, ${Math.max(0, opacity * 0.1)})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    ctx.globalAlpha = 1;

    // 2. Calculate Synesthesia Pulse Color
    const REZ_COLOR_BASE_RGB = [0, 102, 102];
    const REZ_COLOR_HIGH_RGB = [255, 170, 0];

    const r = REZ_COLOR_BASE_RGB[0] + (REZ_COLOR_HIGH_RGB[0] - REZ_COLOR_BASE_RGB[0]) * synesthesiaScale;
    const g = REZ_COLOR_BASE_RGB[1] + (REZ_COLOR_HIGH_RGB[1] - REZ_COLOR_BASE_RGB[1]) * synesthesiaScale;
    const b = REZ_COLOR_BASE_RGB[2] + (REZ_COLOR_HIGH_RGB[2] - REZ_COLOR_BASE_RGB[2]) * synesthesiaScale;

    const gridColor = `rgb(${r}, ${g}, ${b})`;

    const explosionScale = shakeIntensity / (10 * GAME_SCALE);
    const baseOpacity = 0.03;
    const maxPulseOpacity = 0.07;
    const maxExplosionOpacity = 0.15;

    // 3. Apply Global Opacity and Glow
    ctx.globalAlpha = baseOpacity + maxPulseOpacity * synesthesiaScale + maxExplosionOpacity * explosionScale;
    ctx.shadowColor = gridColor;
    ctx.shadowBlur = 30 * (1 + explosionScale * 0.5);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // 4. Draw Scrolling Lines
    const startX = scoreOffset % gridSize;
    const startY = scoreOffset % gridSize;

    for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function drawHUD() {
    drawTopHudBox();
    drawScore();
    drawBottomHUD();
}

function drawTopHudBox() {
    const margin = 10 * GAME_SCALE;
    const height = 45 * GAME_SCALE;
    const boxY = 40 * GAME_SCALE;

    ctx.strokeStyle = COLOR_CYAN;
    ctx.lineWidth = 2 * GAME_SCALE;
    ctx.shadowColor = COLOR_CYAN;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.rect(margin, boxY - height / 2, canvas.width - margin * 2, height);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
}

function drawFilledText(text, x, y, size, color, shadowColor, alignment, shadowBlur = 15) {
    ctx.font = `bold ${size * GAME_SCALE}px Monospace`;
    ctx.fillStyle = color;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

function drawOutlinedText(text, x, y, size, color, shadowColor, alignment, lineWidth = 2, shadowBlur = 10) {
    ctx.font = `bold ${size * GAME_SCALE}px Monospace`;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth * GAME_SCALE;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';
    ctx.strokeText(text, x, y);
    ctx.shadowBlur = 0;
}

function drawScore() {
    const baseSize = 24;
    const shadowColor = COLOR_ORANGE;
    const hudY = 40 * GAME_SCALE;

    const xCoords = {
        level: 20 * GAME_SCALE,
        lives: canvas.width * 0.25,
        combo: canvas.width * 0.43,
        triple: canvas.width * 0.61,
        score: canvas.width * 0.8,
        maxScore: canvas.width - 20 * GAME_SCALE,
    };

    // Level Status
    const rockCount = ASTEROID_NUM + (level > 0 ? level - 1 : 0);
    const levelText = `Level: ${level} (${rockCount} Rocks)`;
    drawFilledText(levelText, xCoords.level, hudY, baseSize, COLOR_ORANGE, shadowColor, 'left', 10);

    // Lives
    const livesText = `Lives: ${ship ? lives : 0}`;
    drawFilledText(livesText, xCoords.lives, hudY, baseSize, COLOR_GREEN, shadowColor, 'center', 10);

    // Combo Multiplier & Meter
    if (combo > 1 && playing) {
        const comboRatio = Math.max(0, comboTimer / COMBO_MAX_TIME);
        const barWidth = 80 * GAME_SCALE;
        const barHeight = 6 * GAME_SCALE;
        const barY = hudY + 10 * GAME_SCALE;
        const currentBarWidth = barWidth * comboRatio;

        const comboText = `COMBO: x${combo}`;
        const comboColor = combo % 5 === 0 ? COLOR_MAGENTA : COLOR_ORANGE;
        drawFilledText(comboText, xCoords.combo, hudY - baseSize * 0.25, baseSize * 0.9, comboColor, comboColor, 'center', 15);

        // Combo Decay Bar
        ctx.strokeStyle = COLOR_DARK_CYAN;
        ctx.lineWidth = 2 * GAME_SCALE;
        ctx.beginPath();
        ctx.rect(xCoords.combo - barWidth / 2, barY, barWidth, barHeight);
        ctx.stroke();

        ctx.fillStyle = comboRatio < 0.3 && Date.now() % 200 > 100 ? COLOR_RED : COLOR_ORANGE;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 5;
        ctx.fillRect(xCoords.combo - barWidth / 2, barY, currentBarWidth, barHeight);
    }

    // Triple Shot Timer
    if (ship && ship.tripleShotActive) {
        const tripleX = xCoords.triple;
        const timeRemaining = Math.max(0, ship.tripleShotTimer).toFixed(1);

        drawFilledText('TRIPLE', tripleX, hudY - baseSize * 0.25, baseSize * 0.9, COLOR_ORANGE, COLOR_ORANGE, 'center', 10);
        drawFilledText(`${timeRemaining}s`, tripleX, hudY + baseSize * 0.5, baseSize * 0.7, COLOR_GREEN, COLOR_GREEN, 'center', 5);
    }

    // Score
    const scoreText = `Score: ${displayScore.toLocaleString()}`;
    drawFilledText(scoreText, xCoords.score, hudY, baseSize, COLOR_ORANGE, shadowColor, 'right', 10);

    // High Score
    const maxScoreText = `High Score: ${maxScore.toLocaleString()}`;
    drawFilledText(maxScoreText, xCoords.maxScore, hudY, baseSize, COLOR_CYAN, COLOR_CYAN, 'right', 10);
}

function drawBottomHUD() {
    const baseSize = 20;
    const bottomY = canvas.height - 20 * GAME_SCALE;

    if (droneSpawnTimer > 0) {
        const timeRemaining = Math.ceil(droneSpawnTimer);
        const droneText = `REINFORCE ARRIVAL IN: ${timeRemaining}s`;

        // Draw glowing background bar
        const barWidth = 350 * GAME_SCALE;
        const barHeight = 25 * GAME_SCALE;
        const barX = canvas.width / 2 - barWidth / 2;

        ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
        ctx.shadowColor = COLOR_MAGENTA;
        ctx.shadowBlur = 15;
        ctx.fillRect(barX, bottomY - barHeight / 2, barWidth, barHeight);
        ctx.shadowBlur = 0;

        drawFilledText(droneText, canvas.width / 2, bottomY, baseSize * 0.8, COLOR_MAGENTA, COLOR_CYAN, 'center', 10);
    }
}

function drawMenu() {
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay.style.display !== 'flex') return;

    const visibleMenuId = document.getElementById('start-menu').style.display !== 'none'
        ? 'start-menu'
        : 'game-over-menu';
    const menuElement = document.getElementById(visibleMenuId);
    const h1Element = menuElement.querySelector('h1');

    if (!h1Element) return;

    // Map HTML H1 position to canvas coordinates
    const h1Rect = h1Element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const targetX = h1Rect.left + h1Rect.width / 2 - canvasRect.left;
    const targetY = h1Rect.top + h1Rect.height / 2 - canvasRect.top;

    const titleText = h1Element.textContent;
    const titleSize = 75;

    ctx.save();
    ctx.shadowBlur = 0;

    drawOutlinedText(titleText, targetX, targetY, titleSize, COLOR_CYAN, COLOR_ORANGE, 'center', 7, 35);

    ctx.restore();
}

function draw() {
    let offsetX = 0;
    let offsetY = 0;
    if (shakeIntensity > 0) {
        offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
        offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
    }

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Clear the canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0 - offsetX, 0 - offsetY, canvas.width + offsetX * 2, canvas.height + offsetY * 2);

    drawGrid();

    // Draw all game elements
    bullets.length > 0 && drawBullets();
    drawGameObjects();
    drawHUD();

    if (!playing) {
        drawMenu();
    }

    ctx.restore();
}