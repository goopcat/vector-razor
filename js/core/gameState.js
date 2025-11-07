// Game State Variables
let canvas, ctx, ship, controls;
let GAME_SCALE = 1;
let gameLoopRunning;

// Game Object Arrays
let asteroids, bullets, droneBullets, particles, powerups, drones;
let illuminationPoints;

// Game Status Variables
let playing;
let lastTime;
let level;
let lives;
let maxScore;
let scoreOffset;
let displayScore;
let targetScore;
let last1UpScore;
let combo;
let comboTimer;
let shakeIntensity;
let initialDroneTimer;
let droneSpawnTimer;
let synesthesiaScale;

function initializeState() {
    ship = new Ship();
    asteroids = [];
    bullets = [];
    droneBullets = [];
    particles = [];
    powerups = [];
    drones = [];
    illuminationPoints = [];

    lives = 3;
    level = 0;
    lastTime = performance.now();
    scoreOffset = 0;
    displayScore = 0;
    targetScore = 0;
    last1UpScore = 0;
    combo = 1;
    comboTimer = 0;
    shakeIntensity = 0;
    initialDroneTimer = 0;
    droneSpawnTimer = 0;
    synesthesiaScale = 0;

    controls = { forward: false, left: false, right: false, shoot: false };
}

function triggerShake(intensity = SHAKE_MAX_INTENSITY) {
    shakeIntensity = Math.max(shakeIntensity, intensity * GAME_SCALE);
}

function killConfirmed() {
    if (comboTimer > 0 || combo === 1) {
        combo++;
    }
    comboTimer = COMBO_MAX_TIME;
    synesthesiaScale = Math.min(1.0, synesthesiaScale + 0.5);
}

function addToScore(points) {
    const pointsToAdd = points * combo;
    targetScore += pointsToAdd;
    return pointsToAdd;
}

function nextLevel() {
    level++;

    if (ship) {
        ship.invincible = true;
        ship.invincibleTimer = 1.5;
    }

    // Clear bullets/drones and preserve existing 1-UPs
    bullets = [];
    droneBullets = [];
    drones = [];
    powerups = powerups.filter((p) => p.type === 'life');
    powerups.forEach((p) => {
        if (p.type === 'life') {
            p.life = POWERUP_TOTAL_LIFE;
        }
    });

    // Level difficulty calculation
    const initialLargeRocks = ASTEROID_NUM + (level - 1);
    const megaRockCount = level >= 3 ? Math.floor((level - 3) / 3) + 1 : 0;

    // Spawn initial large rocks
    asteroids = createAsteroids(initialLargeRocks, ship, BASE_SIZES.ASTEROID_SIZE.LARGE);

    // Spawn Mega rocks if needed
    for (let i = 0; i < megaRockCount; i++) {
        asteroids.push(...createAsteroids(1, ship, BASE_SIZES.ASTEROID_SIZE.MEGA));
    }

    // Reset drone timers for new level cycle
    initialDroneTimer = 0;
    droneSpawnTimer = 0;
}

function gameOver() {
    // Save final score and get updated list
    const highScores = saveHighScore(targetScore);

    // Update UI elements
    document.getElementById('final-score-text').textContent = `FINAL SCORE: ${targetScore.toLocaleString()}`;

    // Generate HTML High Score List
    const ul = document.getElementById('high-score-list');
    ul.innerHTML = '';

    highScores.forEach((s, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}.</span><span>${s.score.toLocaleString()}</span>`;
        if (s.isNew) {
            li.classList.add('new-high');
            li.innerHTML = `<span>${index + 1}.</span><span>${s.score.toLocaleString()} (NEW)</span>`;
        }
        ul.appendChild(li);
    });

    // Show Game Over Menu
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-over-menu').style.display = 'flex';
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('gameplay-title').style.display = 'none';
}

function readyAndStartGame() {
    // Hide Menu, Show Gameplay Title
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-over-menu').style.display = 'none';
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('gameplay-title').style.display = 'block';

    startGame();
}

function startGame() {
    playing = true;
    initializeState();
    lastTime = performance.now();
    nextLevel();
}