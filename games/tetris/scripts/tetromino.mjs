/**
 * Tetromino module - handles piece creation and manipulation
 */

// Tetromino shapes (standard 7 pieces)
const SHAPES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF' // Cyan
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF' // Blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF7F00' // Orange
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00' // Yellow
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00' // Green
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080' // Purple
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000' // Red
    }
};

// Piece type keys in an array
const PIECE_TYPES = Object.keys(SHAPES);

/**
 * Create a new random tetromino
 */
export function createTetromino() {
    // Select a random piece type
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    const { shape, color } = SHAPES[type];
    
    // Deep clone the shape to avoid reference issues
    const clonedShape = shape.map(row => [...row]);
    
    // Create the tetromino object
    return {
        type,
        color,
        shape: clonedShape,
        x: 3, // Start centered at the top of the board
        y: 0
    };
}

/**
 * Rotate a tetromino's shape 90 degrees clockwise
 */
export function rotateTetromino(tetromino) {
    const { shape } = tetromino;
    const size = shape.length;
    
    // Create a new matrix for the rotated shape
    const rotatedShape = Array(size).fill().map(() => Array(size).fill(0));
    
    // Perform 90-degree clockwise rotation
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            rotatedShape[x][size - 1 - y] = shape[y][x];
        }
    }
    
    // Return a new tetromino with the rotated shape
    return {
        ...tetromino,
        shape: rotatedShape
    };
}

/**
 * Move a tetromino by the given delta values
 */
export function moveTetromino(tetromino, deltaX, deltaY) {
    return {
        ...tetromino,
        x: tetromino.x + deltaX,
        y: tetromino.y + deltaY
    };
}

/**
 * Get color for a tetromino based on its type
 */
export function getTetrominoColor(type) {
    return SHAPES[type]?.color || '#FFFFFF';
} 