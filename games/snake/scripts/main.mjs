import { setupScene } from './scene.mjs';
import { createSnake, updateSnake, resetSnake } from './snake.mjs';
import { createFood, updateFood } from './food.mjs';
import { checkCollision } from './collision.mjs';
import { setupControls } from './controls.mjs';
import { updateScore, resetScore, getScore } from './score.mjs';
import { setupEasterEgg } from './easter-egg.mjs';

// Game constants
export const GRID_SIZE = 20;
export const MOVE_INTERVAL = 150; // milliseconds

// Game state
let gameRunning = false;
let gameOver = false;
let lastMoveTime = 0;

// Game elements
let scene, camera, renderer, snake, food;

// Initialize the game
function init() {
    // Setup Three.js scene
    const sceneSetup = setupScene(document.getElementById('game-canvas'));
    scene = sceneSetup.scene;
    camera = sceneSetup.camera;
    renderer = sceneSetup.renderer;
    
    // Create game elements
    snake = createSnake(scene);
    food = createFood(scene, snake);
    
    // Setup controls
    setupControls(snake);
    
    // Setup easter egg
    setupEasterEgg(snake);
    
    // Setup game over screen events
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // Load high score from local storage
    const highScore = localStorage.getItem('snakeHighScore') || 0;
    document.getElementById('high-score').textContent = highScore;
    
    // Start the game
    startGame();
    
    // Animation loop
    animate();
}

// Game loop
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    if (gameRunning && !gameOver) {
        // Move snake at fixed intervals
        if (currentTime - lastMoveTime > MOVE_INTERVAL) {
            updateSnake(snake);
            lastMoveTime = currentTime;
            
            // Check for food collision
            if (checkCollision(snake, food)) {
                updateFood(food, snake, scene);
                updateScore();
            }
            
            // Check for wall or self collision
            if (checkCollision(snake, null, true)) {
                endGame();
            }
        }
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Start the game
function startGame() {
    gameRunning = true;
    gameOver = false;
    document.getElementById('game-over').classList.add('hidden');
}

// End the game
function endGame() {
    gameRunning = false;
    gameOver = true;
    
    // Update final score and show game over screen
    const finalScore = getScore();
    document.getElementById('final-score').textContent = finalScore;
    document.getElementById('game-over').classList.remove('hidden');
    
    // Update high score if needed
    const highScore = localStorage.getItem('snakeHighScore') || 0;
    if (finalScore > highScore) {
        localStorage.setItem('snakeHighScore', finalScore);
        document.getElementById('high-score').textContent = finalScore;
    }
}

// Restart the game
function restartGame() {
    resetSnake(snake);
    resetScore();
    updateFood(food, snake, scene);
    startGame();
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', init); 