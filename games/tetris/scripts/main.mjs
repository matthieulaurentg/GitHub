import { createGameBoard } from './gameBoard.mjs';
import { createTetromino } from './tetromino.mjs';
import { renderGame } from './renderer.mjs';
import { setupControls } from './controls.mjs';

// Game state
const gameState = {
    board: null,
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPaused: true,
    dropInterval: 1000, // ms
    lastDropTime: 0,
    gameLoop: null
};

// DOM elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const nextPieceElement = document.getElementById('next-piece');

// Initialize canvas size
canvas.width = 300;
canvas.height = 600;

// Initialize game
function initGame() {
    gameState.board = createGameBoard(10, 20);
    gameState.currentPiece = createTetromino();
    gameState.nextPiece = createTetromino();
    gameState.score = 0;
    gameState.level = 1;
    gameState.lines = 0;
    gameState.isGameOver = false;
    gameState.isPaused = true;
    gameState.dropInterval = 1000;
    gameState.lastDropTime = 0;
    
    updateScoreDisplay();
    renderNextPiece();
    
    // Initial render
    renderGame(ctx, gameState.board, gameState.currentPiece);
}

// Update score display
function updateScoreDisplay() {
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    linesElement.textContent = gameState.lines;
}

// Render next piece preview
function renderNextPiece() {
    // Implementation in renderer.mjs
    const nextPieceCtx = nextPieceElement.getContext('2d');
    renderGame.renderNextPiece(nextPieceCtx, gameState.nextPiece);
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPaused) {
        if (timestamp - gameState.lastDropTime > gameState.dropInterval) {
            dropPiece();
            gameState.lastDropTime = timestamp;
        }
        
        renderGame(ctx, gameState.board, gameState.currentPiece);
    }
    
    requestAnimationFrame(gameLoop);
}

// Drop the current piece
function dropPiece() {
    if (!gameState.board.canMovePiece(gameState.currentPiece, 0, 1)) {
        // Lock the piece in place
        gameState.board.placePiece(gameState.currentPiece);
        
        // Check for completed lines
        const clearedLines = gameState.board.clearCompletedLines();
        if (clearedLines > 0) {
            // Update score
            updateScore(clearedLines);
        }
        
        // Get next piece
        gameState.currentPiece = gameState.nextPiece;
        gameState.nextPiece = createTetromino();
        renderNextPiece();
        
        // Check for game over
        if (!gameState.board.canPlacePiece(gameState.currentPiece)) {
            gameOver();
        }
    } else {
        // Move piece down
        gameState.currentPiece.y++;
    }
}

// Calculate score based on cleared lines
function updateScore(clearedLines) {
    if (!clearedLines) return;
    
    // Classic Tetris scoring
    const linePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines
    gameState.score += linePoints[clearedLines] * gameState.level;
    gameState.lines += clearedLines;
    
    // Level up every 10 lines
    const newLevel = Math.floor(gameState.lines / 10) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        // Speed up as level increases
        gameState.dropInterval = Math.max(100, 1000 - (gameState.level - 1) * 50);
    }
    
    updateScoreDisplay();
}

// Game over
function gameOver() {
    gameState.isGameOver = true;
    gameState.isPaused = true;
    alert(`Game Over! Your score: ${gameState.score}`);
}

// Toggle pause/resume
function togglePause() {
    if (gameState.isGameOver) {
        initGame();
        gameState.isPaused = false;
        gameState.lastDropTime = performance.now();
    } else {
        gameState.isPaused = !gameState.isPaused;
        if (!gameState.isPaused) {
            gameState.lastDropTime = performance.now();
        }
    }
    
    startButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
}

// Event listeners
startButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
    initGame();
    gameState.isPaused = false;
    startButton.textContent = 'Pause';
    gameState.lastDropTime = performance.now();
});

// Setup keyboard controls
setupControls(gameState);

// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    // Check if the key matches the expected key in sequence
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        
        // If the full sequence is entered correctly
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0; // Reset for next time
        }
    } else {
        konamiIndex = 0; // Reset if wrong key
    }
});

// Easter egg function
function activateEasterEgg() {
    // Visual feedback
    document.body.style.transition = 'background-color 0.5s';
    const originalColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#800080';
    
    // Flash effect
    setTimeout(() => {
        document.body.style.backgroundColor = originalColor;
    }, 500);
    
    // Add 30 levels and 30000 points
    gameState.level += 30;
    gameState.score += 30000;
    updateScoreDisplay();
    
    // Display message
    const easterEggMessage = document.createElement('div');
    easterEggMessage.textContent = '🎮 KONAMI CODE ACTIVATED: +30000 POINTS, +30 LEVELS! 🎮';
    easterEggMessage.style.position = 'absolute';
    easterEggMessage.style.top = '50%';
    easterEggMessage.style.left = '50%';
    easterEggMessage.style.transform = 'translate(-50%, -50%)';
    easterEggMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    easterEggMessage.style.color = '#0af';
    easterEggMessage.style.padding = '20px';
    easterEggMessage.style.borderRadius = '10px';
    easterEggMessage.style.fontWeight = 'bold';
    easterEggMessage.style.zIndex = '999';
    easterEggMessage.style.textAlign = 'center';
    
    document.body.appendChild(easterEggMessage);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        document.body.removeChild(easterEggMessage);
    }, 3000);
}

// Initialize game and start game loop
initGame();
requestAnimationFrame(gameLoop);

// Export game state for other modules
export default gameState; 