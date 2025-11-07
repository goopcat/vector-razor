// Entity Factory Functions
function createParticles(count, x, y, color, size, life, speed) {
    const created = [];
    const spaceAvailable = MAX_PARTICLES - particles.length;
    const particlesToCreate = Math.min(count, spaceAvailable);

    for (let i = 0; i < particlesToCreate; i++) {
        const angle = Math.random() * Math.PI * 2;
        created.push(
            new Particle(
                x,
                y,
                color,
                size * GAME_SCALE,
                life,
                speed * GAME_SCALE * Math.random(),
                angle,
            ),
        );
    }
    particles.push(...created);
    return created;
}

function createAsteroids(num, ship, sizeMultiplier) {
    let newAsteroids = [];
    const targetX = ship ? ship.x : canvas.width / 2;
    const targetY = ship ? ship.y : canvas.height / 2;

    for (let i = 0; i < num; i++) {
        let x, y, dist;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
            dist = distBetweenPoints(x, y, targetX, targetY);
        } while (dist < canvas.width / 4);

        let a = Math.random() * Math.PI * 2;
        let vx = (Math.random() * ASTEROID_MAX_SPD - ASTEROID_MAX_SPD / 2) * (1 + level * 0.2);
        let vy = (Math.random() * ASTEROID_MAX_SPD - ASTEROID_MAX_SPD / 2) * (1 + level * 0.2);

        const baseRockRadius = BASE_SIZES.ASTEROID_SIZE_MULT * GAME_SCALE;
        const initialR = sizeMultiplier * baseRockRadius;

        newAsteroids.push(new Asteroid(x, y, initialR, a, vx, vy, sizeMultiplier));
    }
    return newAsteroids;
}

function spawnOneUp() {
    let x, y, dist;
    const minSpawnDistance = canvas.width / 5;
    const borderBuffer = BASE_SIZES.POWERUP_R * GAME_SCALE * 2;
    const targetX = ship ? ship.x : canvas.width / 2;
    const targetY = ship ? ship.y : canvas.height / 2;

    do {
        x = Math.random() * (canvas.width - 2 * borderBuffer) + borderBuffer;
        y = Math.random() * (canvas.height - 2 * borderBuffer) + borderBuffer;
        dist = distBetweenPoints(x, y, targetX, targetY);
    } while (dist < minSpawnDistance);

    powerups.push(new PowerUp(x, y, 'life'));
}

function spawnDrone() {
    let x, y, dist;
    const targetX = ship ? ship.x : canvas.width / 2;
    const targetY = ship ? ship.y : canvas.height / 2;

    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        dist = distBetweenPoints(x, y, targetX, targetY);
    } while (dist < canvas.width / 4);

    drones.push(new Drone(x, y));
}

function destroyAsteroid(asteroid, bullet, newAsteroids) {
    const asteroidID = asteroid.id;
    const scoreAdded = addToScore(SCORE_DESTROY_ASTEROID[asteroidID] || 50);
    killConfirmed();

    // Visual effects
    illuminationPoints.push({ x: asteroid.x, y: asteroid.y, life: 1.0, age: 0 });
    createParticles(20, bullet.x, bullet.y, COLOR_ORANGE, 1.0, 0.5, 200);
    createParticles(50 - asteroidID * 15, asteroid.x, asteroid.y, asteroid.color, 2.0, 2.0, 200);
    triggerShake(asteroidID * 1.5 + 3);
    particles.push(new TextParticle(asteroid.x, asteroid.y - asteroid.r, `+${scoreAdded}`, COLOR_GREEN));

    // Spawn Collectible Dust
    for (let k = 0; k < asteroidID * 5; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 * Math.random();
        particles.push(
            new Collectible(
                asteroid.x,
                asteroid.y,
                speed * Math.cos(angle),
                speed * Math.sin(angle),
            ),
        );
    }

    // Splitting Logic
    if (asteroidID >= BASE_SIZES.ASTEROID_SIZE.MEDIUM) {
        let newID, fragmentCount;

        if (asteroidID === BASE_SIZES.ASTEROID_SIZE.MEGA) {
            newID = BASE_SIZES.ASTEROID_SIZE.LARGE;
            fragmentCount = 4;
        } else if (asteroidID === BASE_SIZES.ASTEROID_SIZE.LARGE) {
            newID = BASE_SIZES.ASTEROID_SIZE.MEDIUM;
            fragmentCount = 2;
        } else {
            newID = BASE_SIZES.ASTEROID_SIZE.SMALL;
            fragmentCount = 2;
        }

        const newR = newID * BASE_SIZES.ASTEROID_SIZE_MULT * GAME_SCALE;

        // Debris Echo Logic
        if (asteroidID >= BASE_SIZES.ASTEROID_SIZE.LARGE) {
            const numEchoes = Math.floor(Math.random() * 3) + 4;
            const ROCK_ECHO_LIFE = 7.0;
            const SPREAD_SPEED_MAX = 75 * GAME_SCALE;

            for (let e = 0; e < numEchoes; e++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * SPREAD_SPEED_MAX * 0.5;

                const initialVX = asteroid.vx * 0.2 + speed * Math.cos(angle);
                const initialVY = asteroid.vy * 0.2 + speed * Math.sin(angle);

                particles.push(
                    new RockEcho(
                        asteroid.x,
                        asteroid.y,
                        asteroid.r,
                        asteroid.vert,
                        asteroid.offs,
                        initialVX,
                        initialVY,
                        ROCK_ECHO_LIFE,
                    ),
                );
            }
        }

        // Spawn New Asteroid Fragments
        for (let k = 0; k < fragmentCount; k++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * ASTEROID_MAX_SPD * (1 + level * 0.2) + ASTEROID_MAX_SPD * 0.5;
            const blastAngle = angle + (k === 0 ? 0.2 : -0.2);

            newAsteroids.push(
                new Asteroid(
                    asteroid.x + newR * Math.cos(blastAngle),
                    asteroid.y + newR * Math.sin(blastAngle),
                    newR,
                    angle,
                    asteroid.vx + speed * Math.cos(blastAngle),
                    asteroid.vy + speed * Math.sin(blastAngle),
                    newID,
                ),
            );
        }
    } else {
        // Power-up Drop Logic (Smallest rocks only)
        if (Math.random() < POWERUP_DROP_CHANCE) {
            powerups.push(new PowerUp(asteroid.x, asteroid.y, 'triple'));
        }
    }
}

function damageDrone(drone, bullet) {
    drone.shieldHits += 1;
    createParticles(10, bullet.x, bullet.y, COLOR_CYAN, 2.0, 0.5, 100);

    if (drone.shieldHits >= DRONE_SHIELD_MAX_HITS) {
        const scoreAdded = addToScore(SCORE_DESTROY_DRONE);
        killConfirmed();
        triggerShake(SHAKE_MAX_INTENSITY);
        illuminationPoints.push({ x: drone.x, y: drone.y, life: 1.0, age: 0 });
        particles.push(new TextParticle(drone.x, drone.y - drone.r, `+${scoreAdded}`, COLOR_MAGENTA));

        createParticles(30, drone.x, drone.y, COLOR_MAGENTA, 3.0, 1.0, 200);
        for (let k = 0; k < 15; k++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 * Math.random();
            particles.push(
                new Collectible(
                    drone.x,
                    drone.y,
                    speed * Math.cos(angle),
                    speed * Math.sin(angle),
                ),
            );
        }
        return true;
    }
    return false;
}