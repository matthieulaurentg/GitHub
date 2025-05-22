/**
 * Creates and manages the Tetris game board
 */
export function createGameBoard(width, height) {
    // Create a 2D array filled with zeros
    const grid = Array(height).fill().map(() => Array(width).fill(0));
    
    return {
        width,
        height,
        grid,
        
        /**
         * Check if a position is valid within the board bounds
         */
        isValidPosition(x, y) {
            return x >= 0 && x < width && y >= 0 && y < height;
        },
        
        /**
         * Check if a cell is empty (0) or occupied
         */
        isCellEmpty(x, y) {
            if (!this.isValidPosition(x, y)) return false;
            return this.grid[y][x] === 0;
        },
        
        /**
         * Check if a tetromino can be placed at its current position
         */
        canPlacePiece(tetromino) {
            return tetromino.shape.every((row, dy) => {
                return row.every((value, dx) => {
                    if (value === 0) return true; // Empty cell in the tetromino
                    
                    const boardX = tetromino.x + dx;
                    const boardY = tetromino.y + dy;
                    
                    return this.isCellEmpty(boardX, boardY);
                });
            });
        },
        
        /**
         * Check if a tetromino can move to a new position
         */
        canMovePiece(tetromino, deltaX, deltaY) {
            return tetromino.shape.every((row, dy) => {
                return row.every((value, dx) => {
                    if (value === 0) return true; // Empty cell in the tetromino
                    
                    const boardX = tetromino.x + dx + deltaX;
                    const boardY = tetromino.y + dy + deltaY;
                    
                    return this.isCellEmpty(boardX, boardY);
                });
            });
        },
        
        /**
         * Place a tetromino permanently on the board
         */
        placePiece(tetromino) {
            tetromino.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value !== 0) {
                        const boardX = tetromino.x + dx;
                        const boardY = tetromino.y + dy;
                        
                        if (this.isValidPosition(boardX, boardY)) {
                            this.grid[boardY][boardX] = tetromino.type;
                        }
                    }
                });
            });
        },
        
        /**
         * Check for and clear completed lines, return number of lines cleared
         */
        clearCompletedLines() {
            let linesCleared = 0;
            
            for (let y = height - 1; y >= 0; y--) {
                // Check if the line is complete (no zeros)
                const isLineComplete = this.grid[y].every(cell => cell !== 0);
                
                if (isLineComplete) {
                    // Remove the complete line and add a new empty line at the top
                    this.grid.splice(y, 1);
                    this.grid.unshift(Array(width).fill(0));
                    linesCleared++;
                    
                    // Since we removed a line, we need to check the same y index again
                    y++;
                }
            }
            
            return linesCleared;
        },
        
        /**
         * Reset the board to all zeros
         */
        reset() {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    this.grid[y][x] = 0;
                }
            }
        }
    };
} 