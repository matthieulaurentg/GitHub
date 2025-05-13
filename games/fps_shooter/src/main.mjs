import { initScene, updateScene, renderer, scene, camera } from './map/sceneSetup.mjs';
import { createPlayer, updatePlayer, player } from './player/player.mjs';
import { createWeapon, updateWeapon } from './weapons/weapon.mjs';
import { createEnemies, updateEnemies, spawnEnemy } from './enemies/enemies.mjs';
import { handleCollisions } from './utils/collisions.mjs';
import { updateUI, showGameOver, hideGameOver, showStartScreen, hideStartScreen } from './ui/uiManager.mjs';
import { initControls, updateControls } from './player/controls.mjs';
import { loadAssets, assets, updateLoadingProgress } from './utils/assetLoader.mjs';

// Game state
export const gameState = {
    inProgress: false,
    paused: false,
    score: 0,
    enemiesKilled: 0,
    wave: 1,
    spawnRate: 3000, // ms between enemy spawns
    lastSpawnTime: 0,
    enemySpeed: 2,
    maxEnemies: 10
};

// Initialize loading screen
const loadingScreen = document.getElementById('loading-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Setup event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Initialize game
async function init() {
    // Load all assets first
    await loadAssets(updateLoadingProgress);
    
    // Initialize scene and components
    initScene();
    createPlayer();
    createWeapon();
    
    // Hide loading screen
    loadingScreen.style.display = 'none';
    
    // Show start screen
    showStartScreen();
    
    // Start animation loop
    animate();
}

function startGame() {
    // Hide start screen
    hideStartScreen();
    
    // Initialize controls
    initControls();
    
    // Create initial enemies
    createEnemies();
    
    // Reset game state
    gameState.inProgress = true;
    gameState.score = 0;
    gameState.enemiesKilled = 0;
    gameState.wave = 1;
    gameState.lastSpawnTime = Date.now();
    
    // Update UI
    updateUI();
}

function restartGame() {
    // Hide game over screen
    hideGameOver();
    
    // Re-initialize controls
    initControls();
    
    // Create new enemies
    createEnemies();
    
    // Reset game state
    gameState.inProgress = true;
    gameState.score = 0;
    gameState.enemiesKilled = 0;
    gameState.wave = 1;
    gameState.lastSpawnTime = Date.now();
    gameState.enemySpeed = 2;
    gameState.spawnRate = 3000;
    
    // Reset player
    player.health = 100;
    player.position.set(0, 2, 0);
    
    // Update UI
    updateUI();
}

function checkGameOver() {
    if (player.health <= 0 && gameState.inProgress) {
        gameState.inProgress = false;
        showGameOver(gameState.score);
    }
}

function updateGameState() {
    // Check for wave progression
    if (gameState.enemiesKilled > 0 && gameState.enemiesKilled % 10 === 0) {
        // Increase difficulty with each wave
        gameState.wave = Math.floor(gameState.enemiesKilled / 10) + 1;
        gameState.enemySpeed = Math.min(2 + (gameState.wave * 0.5), 8); // Cap speed at 8
        gameState.spawnRate = Math.max(3000 - (gameState.wave * 200), 500); // Minimum 500ms
        gameState.maxEnemies = Math.min(10 + gameState.wave, 30); // Cap at 30 enemies
    }
    
    // Check if we need to spawn a new enemy
    const currentTime = Date.now();
    if (currentTime - gameState.lastSpawnTime > gameState.spawnRate && gameState.inProgress) {
        spawnEnemy(gameState.enemySpeed);
        gameState.lastSpawnTime = currentTime;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState.inProgress && !gameState.paused) {
        // Update player and camera
        updatePlayer();
        updateControls();
        
        // Update weapon
        updateWeapon();
        
        // Update enemies
        updateEnemies();
        
        // Check for collisions
        handleCollisions();
        
        // Update game state
        updateGameState();
        
        // Check if game is over
        checkGameOver();
        
        // Update UI
        updateUI();
    }
    
    // Render scene
    updateScene();
    renderer.render(scene, camera);
}

// Start game initialization
init(); 