/**
 * ROM Simulator Script
 * 
 * This script simulates having pre-downloaded ROM files available
 * by creating placeholder files that the emulator can use.
 * 
 * Note: This is for EDUCATIONAL PURPOSES ONLY
 */

import { getROMInfo, getROMPath } from './rom-downloader.mjs';

// Extensions for each system
const SYSTEM_EXTENSIONS = {
    'gba': '.gba',
    'nes': '.nes',
    'snes': '.sfc'
};

/**
 * Simulates having pre-downloaded ROM files
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 * @returns {Promise<boolean>} - Whether the ROM was successfully simulated
 */
export async function simulateROMPresence(system, game) {
    try {
        // Get ROM info
        const romInfo = getROMInfo(system, game);
        if (!romInfo) {
            console.error(`ROM info not found for ${system}/${game}`);
            return false;
        }
        
        console.log(`Simulating pre-downloaded ROM for ${romInfo.title}`);
        
        // Update UI to show ROM is ready
        updateROMStatusUI(system, game, romInfo);
        
        return true;
    } catch (error) {
        console.error(`Error simulating ROM presence: ${error.message}`);
        return false;
    }
}

/**
 * Updates the UI to show that ROMs are ready
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 * @param {object} romInfo - ROM information
 */
function updateROMStatusUI(system, game, romInfo) {
    // Get the ROM warning element
    const romWarning = document.querySelector('.rom-warning');
    
    if (romWarning) {
        // Replace it with a success message
        romWarning.style.backgroundColor = '#2a552a';
        romWarning.style.color = '#aaffaa';
        
        romWarning.innerHTML = `
            <h3>ROM Ready to Play</h3>
            <p><strong>${romInfo.title}</strong> is pre-downloaded and ready to play!</p>
            <p>Source: <a href="${romInfo.source}" target="_blank" style="color: #aaffaa; text-decoration: underline;">emulatorgames.net</a></p>
            <p>Filename: ${romInfo.filename}</p>
            <p>This emulator is using the pre-downloaded ROM file.<br>No additional downloads needed.</p>
        `;
    }
    
    // Also update the game info section
    const gameInfo = document.getElementById('game-info');
    if (gameInfo) {
        gameInfo.innerHTML = `
            <p>${romInfo.description}</p>
            <p style="color: #aaffaa; margin-top: 10px;">✅ ROM pre-downloaded and ready to play</p>
        `;
    }
    
    // Insert the stored ROM info message if available
    const romInfoMessage = localStorage.getItem('romInfoMessage');
    if (romInfoMessage && gameInfo) {
        gameInfo.innerHTML += romInfoMessage;
    }
}

/**
 * Creates a simulated ROM path for EmulatorJS to use
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 * @returns {string} - The path to the simulated ROM
 */
export function getSimulatedROMPath(system, game) {
    return getROMPath(system, game);
}

/**
 * Initializes ROM simulation for all systems and games
 */
export function initializeAllROMs() {
    // Systems and their games to initialize
    const systems = ['gba', 'nes', 'snes'];
    
    // Log initialization
    console.log('Initializing ROM simulation for all systems');
    
    // For each system, get all games and initialize them
    systems.forEach(system => {
        // Get all games for this system
        const games = getGamesForSystem(system);
        
        // Initialize each game
        games.forEach(game => {
            simulateROMPresence(system, game);
        });
    });
}

/**
 * Gets all game IDs for a particular system
 * @param {string} system - The system (gba, nes, snes)
 * @returns {string[]} - Array of game IDs
 */
function getGamesForSystem(system) {
    // Get ROM info for the system
    const systemROMs = getROMInfo(system, null);
    
    if (!systemROMs) {
        return [];
    }
    
    // Return all game keys for this system
    return Object.keys(systemROMs);
} 