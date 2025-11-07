function update(dt) {
    // Global decay effects
    shakeIntensity = Math.max(0, shakeIntensity - 100 * dt);
    synesthesiaScale = Math.max(0, synesthesiaScale - dt * 2.0);

    illuminationPoints = illuminationPoints.filter((p) => {
        p.age += dt;
        return p.age < p.life;
    });

    if (!playing && ship) {
        return;
    }

    // Combo decay and reset logic
    if (comboTimer > 0) {
        comboTimer -= dt;
    } else {
        if (combo > 1) {
            if (ship) {
                particles.push(new TextParticle(ship.x, ship.y - ship.r * 2, 'COMBO RESET', COLOR_RED));
            }
        }
        combo = 1;
    }

    // 1-UP spawn check
    if (ship && targetScore >= last1UpScore + SCORE_1UP_THRESHOLD) {
        last1UpScore = targetScore - (targetScore % SCORE_1UP_THRESHOLD);
        spawnOneUp();
    }

    // Update entities
    if (ship) ship.update(dt);
    asteroids.forEach((a) => a.update(dt));
    drones.forEach((d) => d.update(dt));

    // Drone Reinforcement Logic
    const rockCount = asteroids.length;
    const maxDrones = DRONE_MAX_SPAWN + Math.floor(level / 2);

    if (rockCount < 6 && drones.length < maxDrones) {
        if (initialDroneTimer <= 0 && droneSpawnTimer <= 0) {
            initialDroneTimer = INITIAL_DRONE_SPAWN_TIME;
        }

        if (initialDroneTimer > 0) {
            initialDroneTimer -= dt;
            if (initialDroneTimer <= 0) {
                spawnDrone();
                initialDroneTimer = 0;
                droneSpawnTimer = REINFORCEMENT_DRONE_SPAWN_TIME;
            }
        } else if (droneSpawnTimer > 0) {
            droneSpawnTimer -= dt;
            if (droneSpawnTimer <= 0) {
                spawnDrone();
                droneSpawnTimer = REINFORCEMENT_DRONE_SPAWN_TIME;
            }
        }
    }

    // Update and filter bullets
    bullets = bullets.filter((b) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        return (
            b.life > 0 &&
            b.x >= -50 &&
            b.x <= canvas.width + 50 &&
            b.y >= -50 &&
            b.y <= canvas.height + 50
        );
    });

    droneBullets = droneBullets.filter((b) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        return (
            b.x >= -50 &&
            b.x <= canvas.width + 50 &&
            b.y >= -50 &&
            b.y <= canvas.height + 50
        );
    });

    // Update and filter powerups
    powerups = powerups.filter((p) => {
        p.update(dt);
        if (ship && distBetweenPoints(ship.x, ship.y, p.x, p.y) < ship.r + p.r) {
            if (p.type === 'life') {
                lives++;
                particles.push(new TextParticle(p.x, p.y - p.r * 2, '+1 UP', COLOR_GREEN));
                createParticles(20, p.x, p.y, COLOR_GREEN, 2.0, 0.5, 150);
            } else if (p.type === 'triple') {
                if (ship.tripleShotActive) {
                    ship.tripleShotTimer = Math.min(ship.tripleShotTimer + TRIPLE_SHOT_STACK, TRIPLE_SHOT_CAP);
                    particles.push(new TextParticle(p.x, p.y - p.r * 2, `+${TRIPLE_SHOT_STACK}s`, COLOR_ORANGE));
                } else {
                    ship.tripleShotActive = true;
                    ship.tripleShotTimer = TRIPLE_SHOT_DURATION;
                    particles.push(new TextParticle(p.x, p.y - p.r * 2, 'TRIPLE', COLOR_ORANGE));
                }
                createParticles(20, p.x, p.y, COLOR_ORANGE, 2.0, 0.5, 150);
            }
            return false;
        }
        return p.life > 0;
    });

    // Collision Detection (Ship)
    if (ship && !ship.invincible) {
        const collidables = [...asteroids, ...drones];
        for (let i = 0; i < collidables.length; i++) {
            const obj = collidables[i];
            const radius = obj instanceof Asteroid ? obj.r * 0.9 : obj.r;
            if (distBetweenPoints(ship.x, ship.y, obj.x, obj.y) < ship.r + radius) {
                ship.die();
                if (lives <= 0) ship = null;
                return;
            }
        }
        for (let i = 0; i < droneBullets.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, droneBullets[i].x, droneBullets[i].y) < ship.r + droneBullets[i].r) {
                ship.die();
                if (lives <= 0) ship = null;
                droneBullets.splice(i, 1);
                return;
            }
        }
    }

    // Collision Detection (Bullet vs Asteroid/Drone)
    let newAsteroids = [];
    let bulletHits = new Set();

    for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];

        for (let j = asteroids.length - 1; j >= 0; j--) {
            const a = asteroids[j];
            const asteroidHitRadius = a.id === BASE_SIZES.ASTEROID_SIZE.SMALL ? a.r * 1.1 : a.r * 0.9;

            if (distBetweenPoints(b.x, b.y, a.x, a.y) < b.r + asteroidHitRadius) {
                if (!bulletHits.has(i)) bulletHits.add(i);
                destroyAsteroid(a, b, newAsteroids);
                asteroids.splice(j, 1);
                break;
            }
        }

        if (bulletHits.has(i)) continue;

        for (let j = drones.length - 1; j >= 0; j--) {
            const d = drones[j];
            if (distBetweenPoints(b.x, b.y, d.x, d.y) < b.r + d.r * 1.5) {
                if (!bulletHits.has(i)) bulletHits.add(i);
                const wasDestroyed = damageDrone(d, b);
                if (wasDestroyed) {
                    drones.splice(j, 1);
                }
                break;
            }
        }
    }

    // Filter out hit bullets and add new asteroid fragments
    bullets = bullets.filter((_, index) => !bulletHits.has(index));
    asteroids = asteroids.concat(newAsteroids);

    // Check for Next Level
    if (asteroids.length === 0 && drones.length === 0) {
        for (let i = 0; i < 3; i++)
            illuminationPoints.push({
                x: canvas.width * Math.random(),
                y: canvas.height * Math.random(),
                life: 1.0,
                age: 0,
            });
        nextLevel();
    }

    // Gold Dust Gravity and Collection
    particles = particles.filter((p) => {
        if (p instanceof Collectible) {
            if (ship) {
                const dx = ship.x - p.x;
                const dy = ship.y - p.y;
                const dist = distBetweenPoints(dx, dy, 0, 0);

                if (dist < SHIP_GRAVITY_RADIUS * GAME_SCALE || p.inGravityWell) {
                    p.inGravityWell = true;

                    const speed = 300 * GAME_SCALE;
                    const targetVx = dx * (speed / dist);
                    const targetVy = dy * (speed / dist);

                    p.vx = p.vx * 0.95 + targetVx * 0.05;
                    p.vy = p.vy * 0.95 + targetVy * 0.05;

                    if (dist < ship.r) {
                        addToScore(SCORE_COLLECT_DUST);
                        maxScore = Math.max(maxScore, targetScore);
                        return false;
                    }
                }
            } else {
                p.inGravityWell = false;
            }
        }

        p.update(dt);
        return p.age < p.life;
    });

    // Smooth score display update
    if (displayScore < targetScore) {
        if (targetScore - displayScore < 5) {
            displayScore = targetScore;
        } else {
            displayScore += Math.ceil((targetScore - displayScore) * 0.05) + 1;
            displayScore = Math.min(targetScore, displayScore);
        }
    }
}

function gameLoop() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    update(dt);
    draw();

    if (gameLoopRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function initializeSetup() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    setupCanvasSize();
    window.addEventListener('resize', setupCanvasSize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    maxScore = loadHighScores()[0]?.score || 0;

    initializeState();

    // Set Initial Menu State
    playing = false;
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-over-menu').style.display = 'none';
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('gameplay-title').style.display = 'none';
    document.getElementById('start-button').textContent = 'START GAME';

    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
}

// Initialize the game when the window loads
window.addEventListener('load', initializeSetup);