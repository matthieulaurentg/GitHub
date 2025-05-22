/**
 * GBA Emulator for Web - Simplified Placeholder
 * 
 * This is a placeholder for a real GBA emulator library.
 * In a real implementation, you would use a library like:
 * - IodineGBA
 * - RetroArch.js
 * - VBA-M ported to WebAssembly
 * 
 * Please replace this file with an actual emulator implementation
 * to run real GBA ROM files.
 */

// Mock GBA Emulator Class
class GBAEmulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.romLoaded = false;
        this.frameId = null;
        
        // Set dimensions
        this.width = 240;
        this.height = 160;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Mock pokemon sprites and backgrounds
        this.sprites = {
            pikachu: "⚡️",
            bulbasaur: "🌱",
            charmander: "🔥",
            squirtle: "💧",
            player: "👤"
        };
        
        this.backgrounds = [
            "🏙️", "🌳", "🌊", "🏠", "🌋"
        ];
        
        // Mock game data
        this.game = null;
        this.playerPos = { x: 120, y: 100 };
        this.background = 0;
    }
    
    loadROM(romPath) {
        return new Promise((resolve, reject) => {
            console.log(`Loading ROM: ${romPath}`);
            
            // Mock loading
            setTimeout(() => {
                this.romLoaded = true;
                
                if (romPath.includes("Emerald")) {
                    this.game = "emerald";
                    this.background = 1; // Forest
                } else if (romPath.includes("FireRed")) {
                    this.game = "firered";
                    this.background = 0; // City
                } else {
                    reject(new Error("Unknown ROM"));
                    return;
                }
                
                resolve({
                    game: this.game,
                    size: "8MB",
                    region: "USA"
                });
            }, 1000);
        });
    }
    
    start() {
        if (!this.romLoaded) {
            throw new Error("No ROM loaded");
        }
        
        this.isRunning = true;
        this.renderLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    renderLoop() {
        if (!this.isRunning) return;
        
        this.renderFrame();
        this.frameId = requestAnimationFrame(() => this.renderLoop());
    }
    
    renderFrame() {
        // Clear canvas
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background
        this.ctx.fillStyle = this.getBackgroundColor();
        this.ctx.fillRect(10, 10, this.width - 20, this.height - 20);
        
        // Draw background emoji
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#ffffff";
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 5; j++) {
                this.ctx.fillText(
                    this.backgrounds[this.background], 
                    20 + i * 30, 
                    30 + j * 30
                );
            }
        }
        
        // Draw player
        this.ctx.font = "20px Arial";
        this.ctx.fillText(this.sprites.player, this.playerPos.x, this.playerPos.y);
        
        // Draw game title
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(
            this.game === "emerald" ? "Pokémon Emerald" : "Pokémon FireRed", 
            10, 
            this.height - 10
        );
        
        // Draw a Pokémon
        const pokemon = this.game === "emerald" ? this.sprites.treecko : this.sprites.charmander;
        this.ctx.font = "20px Arial";
        this.ctx.fillText(pokemon, this.width - 50, this.height - 30);
    }
    
    getBackgroundColor() {
        return this.game === "emerald" ? "#58a058" : "#e05850";
    }
    
    handleKeyDown(key) {
        // Mock player movement
        switch(key) {
            case "ArrowUp":
                this.playerPos.y = Math.max(30, this.playerPos.y - 5);
                break;
            case "ArrowDown":
                this.playerPos.y = Math.min(this.height - 20, this.playerPos.y + 5);
                break;
            case "ArrowLeft":
                this.playerPos.x = Math.max(20, this.playerPos.x - 5);
                break;
            case "ArrowRight":
                this.playerPos.x = Math.min(this.width - 20, this.playerPos.x + 5);
                break;
        }
    }
    
    saveState() {
        console.log("Game state saved!");
        return {
            position: { ...this.playerPos },
            background: this.background,
            game: this.game,
            timestamp: new Date().toISOString()
        };
    }
    
    loadState(state) {
        if (!state) return false;
        
        console.log("Loading game state...");
        this.playerPos = state.position || this.playerPos;
        this.background = state.background || this.background;
        return true;
    }
}

// Expose to global scope
window.GBAEmulator = GBAEmulator; 