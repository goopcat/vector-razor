# VectorRazor: Neon Blaster

A retro-style arcade space shooter with a modern neon aesthetic. Battle through waves of asteroids and enemy drones in this fast-paced action game.

## Features

- Smooth vector-style graphics with neon glow effects
- Dynamic combat system with regular and triple-shot weapons
- Multiple enemy types: asteroids and intelligent drone ships
- Power-up system including triple-shot and extra lives
- Combo multiplier system for high score chasing
- Local high score tracking
- Responsive design that scales to your screen

## Controls

- **Movement**: Arrow Keys or WASD
- **Shooting**: Space Bar (tap to fire)
- **Objective**: Destroy asteroids and drones, collect power-ups, and survive!

## Technical Details

Built using vanilla JavaScript and HTML5 Canvas, featuring:
- Object-oriented design with modular architecture
- Smooth particle effects and screen shake
- Dynamic difficulty scaling
- Collision detection system
- Physics-based movement

## Project Structure

```
VectorRazor/
├── css/
│   └── styles.css
├── js/
│   ├── core/
│   │   ├── game.js
│   │   ├── gameState.js
│   │   ├── entityManager.js
│   │   ├── renderer.js
│   │   ├── drawGameObjects.js
│   │   └── input.js
│   ├── entities/
│   │   ├── particle.js
│   │   ├── collectible.js
│   │   ├── rockEcho.js
│   │   ├── asteroid.js
│   │   ├── ship.js
│   │   ├── drone.js
│   │   └── powerup.js
│   └── utils/
│       ├── constants.js
│       └── helpers.js
└── index.html
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/goopcat/vector-razor.git
```

2. Open `index.html` in a modern web browser
3. Start playing!

## License

MIT License - feel free to use and modify as you wish!
