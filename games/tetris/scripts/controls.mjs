/**
 * Controls module for Tetris game
 */
import { rotateTetromino, moveTetromino } from './tetromino.mjs';

// Key mappings
const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    UP: 'ArrowUp',
    SPACE: ' ',
    P: 'p',
    ESCAPE: 'Escape'
};

/**
 * Setup keyboard controls for the game
 */
export function setupControls(gameState) {
    // Keyboard event handler
    document.addEventListener('keydown', (event) => {
        // Skip if game is over
        if (gameState.isGameOver) return;
        
        // Pause/resume with P or Escape
        if ((event.key === KEYS.P || event.key === KEYS.ESCAPE) && !event.repeat) {
            gameState.isPaused = !gameState.isPaused;
            const startButton = document.getElementById('start-button');
            startButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
            return;
        }
        
        // Skip other controls if paused
        if (gameState.isPaused) return;
        
        switch (event.key) {
            case KEYS.LEFT:
                moveHorizontal(-1);
                event.preventDefault();
                break;
                
            case KEYS.RIGHT:
                moveHorizontal(1);
                event.preventDefault();
                break;
                
            case KEYS.DOWN:
                softDrop();
                event.preventDefault();
                break;
                
            case KEYS.UP:
                rotate();
                event.preventDefault();
                break;
                
            case KEYS.SPACE:
                hardDrop();
                event.preventDefault();
                break;
        }
    });
    
    /**
     * Move the piece horizontally
     */
    function moveHorizontal(direction) {
        const { board, currentPiece } = gameState;
        
        if (board.canMovePiece(currentPiece, direction, 0)) {
            gameState.currentPiece = moveTetromino(currentPiece, direction, 0);
        }
    }
    
    /**
     * Move the piece down one row (soft drop)
     */
    function softDrop() {
        const { board, currentPiece } = gameState;
        
        if (board.canMovePiece(currentPiece, 0, 1)) {
            gameState.currentPiece = moveTetromino(currentPiece, 0, 1);
            // Add points for soft drop
            gameState.score += 1;
            updateScoreDisplay();
        }
    }
    
    /**
     * Rotate the piece
     */
    function rotate() {
        const { board, currentPiece } = gameState;
        
        const rotatedPiece = rotateTetromino(currentPiece);
        
        // Try standard rotation
        if (board.canPlacePiece(rotatedPiece)) {
            gameState.currentPiece = rotatedPiece;
            return;
        }
        
        // Wall kick: Try moving left, right, or up if rotation against wall/floor
        const kicks = [
            { x: -1, y: 0 }, // Try left
            { x: 1, y: 0 },  // Try right
            { x: 0, y: -1 }, // Try up
            { x: -2, y: 0 }, // Try 2 cells left
            { x: 2, y: 0 },  // Try 2 cells right
        ];
        
        for (const kick of kicks) {
            const kickedPiece = {
                ...rotatedPiece,
                x: rotatedPiece.x + kick.x,
                y: rotatedPiece.y + kick.y
            };
            
            if (board.canPlacePiece(kickedPiece)) {
                gameState.currentPiece = kickedPiece;
                return;
            }
        }
        
        // If all kick attempts fail, the rotation is not applied
    }
    
    /**
     * Drop the piece to the bottom instantly (hard drop)
     */
    function hardDrop() {
        const { board, currentPiece } = gameState;
        let distance = 0;
        
        // Move the piece down until it collides
        while (board.canMovePiece(currentPiece, 0, distance + 1)) {
            distance++;
        }
        
        // Move the piece to the landing position
        if (distance > 0) {
            gameState.currentPiece = moveTetromino(currentPiece, 0, distance);
            
            // Add points for hard drop (2 per cell)
            gameState.score += distance * 2;
            updateScoreDisplay();
        }
        
        // Lock the piece immediately (will be handled on next game tick)
        gameState.lastDropTime = 0;
    }
    
    /**
     * Helper function to update score display
     */
    function updateScoreDisplay() {
        document.getElementById('score').textContent = gameState.score;
    }
} 