/**
 * Renderer module for Tetris game
 */
import { getTetrominoColor } from './tetromino.mjs';

// Cell size for the main board
const CELL_SIZE = 30; 

// Colors for the grid
const COLORS = {
    background: '#000000',
    grid: '#333333',
    ghost: 'rgba(255, 255, 255, 0.2)'
};

/**
 * Render the entire game state
 */
export function renderGame(ctx, board, currentPiece) {
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw the background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw the grid
    drawGrid(ctx, board.width, board.height);
    
    // Draw the placed blocks
    drawBoard(ctx, board);
    
    // Calculate ghost piece position (where the piece would land)
    const ghostPiece = calculateGhostPiece(board, currentPiece);
    
    // Draw ghost piece
    if (ghostPiece && ghostPiece.y > currentPiece.y) {
        drawPiece(ctx, ghostPiece, COLORS.ghost);
    }
    
    // Draw current piece
    drawPiece(ctx, currentPiece);
}

/**
 * Draw the grid lines
 */
function drawGrid(ctx, width, height) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
        ctx.stroke();
    }
}

/**
 * Draw the board's placed tetrominos
 */
function drawBoard(ctx, board) {
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const cellValue = board.grid[y][x];
            
            if (cellValue !== 0) {
                // Get color for this tetromino type
                const color = getTetrominoColor(cellValue);
                drawCell(ctx, x, y, color);
            }
        }
    }
}

/**
 * Draw a piece on the board
 */
function drawPiece(ctx, piece, overrideColor = null) {
    const { shape, x, y, color } = piece;
    
    shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value !== 0) {
                drawCell(ctx, x + dx, y + dy, overrideColor || color);
            }
        });
    });
}

/**
 * Draw a single cell
 */
function drawCell(ctx, x, y, color) {
    // Calculate pixel coordinates
    const pixelX = x * CELL_SIZE;
    const pixelY = y * CELL_SIZE;
    
    // Draw the main cell
    ctx.fillStyle = color;
    ctx.fillRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
    
    // Draw highlight (3D effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(pixelX, pixelY, CELL_SIZE, 3);
    ctx.fillRect(pixelX, pixelY, 3, CELL_SIZE);
    
    // Draw shadow (3D effect)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(pixelX + CELL_SIZE - 3, pixelY, 3, CELL_SIZE);
    ctx.fillRect(pixelX, pixelY + CELL_SIZE - 3, CELL_SIZE, 3);
}

/**
 * Calculate the position where the piece would land (ghost piece)
 */
function calculateGhostPiece(board, piece) {
    if (!piece) return null;
    
    // Create a copy of the current piece
    const ghostPiece = { ...piece, shape: piece.shape.map(row => [...row]) };
    
    // Move the ghost piece down until it collides
    let ghostY = piece.y;
    while (board.canMovePiece(ghostPiece, 0, 1)) {
        ghostY++;
        ghostPiece.y = ghostY;
    }
    
    return ghostPiece;
}

/**
 * Render the next piece in the sidebar
 */
renderGame.renderNextPiece = function(ctx, piece) {
    // Get the canvas dimensions
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Calculate a suitable cell size for the preview
    const previewCellSize = Math.min(width, height) / 5;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    if (!piece) return;
    
    const { shape, color } = piece;
    
    // Center the piece in the preview box
    const rows = shape.length;
    const cols = shape[0].length;
    const offsetX = (width - cols * previewCellSize) / 2;
    const offsetY = (height - rows * previewCellSize) / 2;
    
    // Draw the next piece
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Calculate position
                const cellX = offsetX + x * previewCellSize;
                const cellY = offsetY + y * previewCellSize;
                
                // Draw cell
                ctx.fillStyle = color;
                ctx.fillRect(cellX, cellY, previewCellSize, previewCellSize);
                
                // Draw highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(cellX, cellY, previewCellSize, 2);
                ctx.fillRect(cellX, cellY, 2, previewCellSize);
                
                // Draw shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(cellX + previewCellSize - 2, cellY, 2, previewCellSize);
                ctx.fillRect(cellX, cellY + previewCellSize - 2, previewCellSize, 2);
            }
        });
    });
}; 