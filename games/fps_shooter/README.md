# 3D FPS Shooter

A first-person shooter game built with Three.js. Features include:

- First-person camera with mouse controls
- Player movement (WASD/arrow keys)
- Shooting mechanics with hit detection
- Multiple enemy types with AI
- Health and ammo systems
- Wave-based gameplay with increasing difficulty
- Score tracking

## Controls

- **Mouse**: Look around
- **WASD/Arrow Keys**: Move
- **Left Mouse Button**: Shoot
- **R**: Reload weapon
- **Shift**: Sprint
- **Esc/P**: Pause game

## Technical Details

The game is built using:
- Three.js for 3D rendering
- JavaScript ES6+ with modules
- HTML5 and CSS3 for UI elements

The codebase is structured into modules:
- `main.mjs`: Main game loop and orchestration
- `map/`: Scene setup and environment
- `player/`: Player controller and physics
- `weapons/`: Weapon mechanics and effects
- `enemies/`: Enemy AI and behaviors
- `ui/`: User interface elements
- `utils/`: Utility functions (collisions, asset loading, etc.)

## Future Improvements

Potential future features include:
- Additional weapon types
- Power-ups and collectibles
- More advanced enemy AI
- Level progression
- Sound effects and music
- Mobile device support 