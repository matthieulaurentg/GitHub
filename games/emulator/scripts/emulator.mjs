/**
 * EmulatorJS loader and manager - using official EmulatorJS from emulatorjs.org
 * With pre-downloaded ROMs from emulatorgames.net
 */

import { initializeROMs, getROMInfo } from './rom-downloader.mjs';
import { simulateROMPresence, getSimulatedROMPath } from './rom-simulator.mjs';

// EmulatorJS official CDN
const EJS_CDN_BASE = 'https://cdn.emulatorjs.org/latest';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize pre-downloaded ROMs
    initializeROMs();
    
    // Setup EmulatorJS from official CDN
    setupEmulatorJS();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const system = urlParams.get('system');
    const game = urlParams.get('game');
    
    if (system && game) {
        // Simulate ROM presence
        await simulateROMPresence(system, game);
        
        // Update emulator configuration with the simulated ROM path
        updateEmulatorWithROM(system, game);
    }
    
    // Setup cheat handling - for use with Konami Code activation
    handleCheats();
});

/**
 * Updates the emulator configuration with the ROM path
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 */
function updateEmulatorWithROM(system, game) {
    // Get ROM path
    const romPath = getSimulatedROMPath(system, game);
    
    if (!romPath) {
        console.error(`Could not get ROM path for ${system}/${game}`);
        return;
    }
    
    // Update EmulatorJS configuration
    window.EJS_gameUrl = romPath;
    
    // Set game-specific settings
    configureEmulatorForGame(system, game);
    
    // Inject the EmulatorJS script
    const ejsScript = document.createElement('script');
    ejsScript.src = `${EJS_CDN_BASE}/loader.js`;
    document.body.appendChild(ejsScript);
    
    console.log(`EmulatorJS configured to use ROM: ${romPath}`);
}

/**
 * Configure EmulatorJS settings based on the selected game
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 */
function configureEmulatorForGame(system, game) {
    // Get ROM info
    const romInfo = getROMInfo(system, game);
    if (!romInfo) return;

    // Set system-specific emulator settings
    const systemSettings = {
        'gba': {
            defaultButtons: {
                a: {
                    label: 'A',
                    value: 'x'
                },
                b: {
                    label: 'B',
                    value: 'z'
                },
                l: {
                    label: 'L',
                    value: 'a'
                },
                r: {
                    label: 'R',
                    value: 's'
                },
                start: {
                    label: 'START',
                    value: 'Enter'
                },
                select: {
                    label: 'SELECT',
                    value: 'Shift'
                }
            },
            touchControls: {
                enabled: true
            }
        },
        'nes': {
            defaultButtons: {
                b: {
                    label: 'B',
                    value: 'z'
                },
                a: {
                    label: 'A',
                    value: 'x'
                },
                start: {
                    label: 'START',
                    value: 'Enter'
                },
                select: {
                    label: 'SELECT',
                    value: 'Shift'
                }
            }
        },
        'snes': {
            defaultButtons: {
                b: {
                    label: 'B',
                    value: 'z'
                },
                a: {
                    label: 'A',
                    value: 'x'
                },
                y: {
                    label: 'Y',
                    value: 'a'
                },
                x: {
                    label: 'X',
                    value: 's'
                },
                l: {
                    label: 'L',
                    value: 'q'
                },
                r: {
                    label: 'R',
                    value: 'w'
                },
                start: {
                    label: 'START',
                    value: 'Enter'
                },
                select: {
                    label: 'SELECT',
                    value: 'Shift'
                }
            }
        }
    };

    // Apply system-specific settings
    if (systemSettings[system]) {
        window.EJS_Buttons = systemSettings[system].defaultButtons;
        
        // Set touch controls for mobile
        if (systemSettings[system].touchControls) {
            window.EJS_TouchControls = systemSettings[system].touchControls.enabled;
        }
    }

    // Game-specific optimizations (shaders, etc.)
    window.EJS_defaultOptions = {
        "save-state-slot": 1,
        "save-state-location": "browser",
        "cheats": true,
        "shader": "crt", // Use CRT shader for retro feel
        "load-state-file": true,
        "save-state-file": true,
        "volume": 0.7,
        "fastForward": true,
        "fastForwardSpeed": 3,
        "rewind": true,
        "rewind-buffer-size": 10,
        "smooth": true
    };
}

/**
 * Sets up EmulatorJS using the official CDN
 */
function setupEmulatorJS() {
    // Update the path to EmulatorJS data to use the CDN
    window.EJS_pathtodata = `${EJS_CDN_BASE}/data/`;
    
    console.log('EmulatorJS initialized from CDN:', EJS_CDN_BASE);
    
    // Load EmulatorJS stylesheet for better UI integration
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = `${EJS_CDN_BASE}/data/ejs.css`;
    document.head.appendChild(stylesheet);
    
    // Detect when loader is loaded to show proper status
    window.EJS_onGameStart = function() {
        console.log('Game started successfully!');
        
        // Apply cheats if Konami code has been used
        const konamiActivated = localStorage.getItem('konamiActivated') === 'true';
        if (konamiActivated) {
            applyGameCheats();
        }
        
        // Hide loading indicators
        const loadingIndicators = document.querySelectorAll('.loading-indicator, .rom-warning');
        loadingIndicators.forEach(el => {
            el.style.display = 'none';
        });
    };
    
    // Custom error handling
    window.EJS_onLoadError = function(message) {
        console.error('EmulatorJS error:', message);
        
        // Show user-friendly error message
        const errorElement = document.getElementById('game-info');
        if (errorElement) {
            errorElement.innerHTML = `
                <div style="color: #ff3333; margin: 20px; text-align: center;">
                    <h3>Error Loading Game</h3>
                    <p>${message || 'The game could not be loaded.'}</p>
                    <p>This might happen if the emulator cannot access the ROM.</p>
                    <p>Try refreshing the page to see if that resolves the issue.</p>
                </div>
            `;
        }
        
        // Update the ROM warning to show the error
        const romWarning = document.querySelector('.rom-warning');
        if (romWarning) {
            romWarning.style.backgroundColor = '#552222';
            romWarning.style.color = '#ffaaaa';
            romWarning.innerHTML = `
                <h3>ROM Loading Error</h3>
                <p>There was an error loading the ROM: ${message || 'Unknown error'}</p>
                <p>Please try refreshing the page. If the error persists, check the console for more details.</p>
            `;
        }
    };
}

/**
 * Handles cheat activation for the emulated games
 */
function handleCheats() {
    // This would be triggered by the Konami Code activation
    const konamiActivated = localStorage.getItem('konamiActivated') === 'true';
    
    if (konamiActivated) {
        console.log('⭐ SPECIAL POWERS ACTIVATED! ⭐');
        
        // If a game is already running, apply cheats immediately
        if (window.EJS_emulator) {
            applyGameCheats();
        }
    }
}

/**
 * Apply game-specific cheats based on the current game
 */
function applyGameCheats() {
    if (!window.EJS_emulator || !window.EJS_core || !window.EJS_gameUrl) {
        return;
    }
    
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const system = urlParams.get('system');
        const game = urlParams.get('game');
        
        if (!system || !game) {
            return;
        }
        
        console.log(`Applying cheats for ${system} game: ${game}`);
        
        // Simple example cheats with real cheat codes for popular games
        // In a real implementation, you would add more comprehensive cheats
        const cheats = {
            'gba': {
                'pokemon-emerald': [
                    { name: 'Infinite Money', code: '82025840 0098967F' },
                    { name: 'All Badges', code: '94000130 FFFB0000' },
                    { name: 'All Items', code: 'B0000000 00000000 0000D9C8 000003E7' }
                ],
                'mario-advance4': [
                    { name: 'Infinite Lives', code: '0300004C 000000FF' },
                    { name: 'Super Jump', code: '032DBF44 00007FFF' }
                ],
                'zelda-minish-cap': [
                    { name: 'Infinite Health', code: '0202BD24 000000A8' },
                    { name: 'Infinite Rupees', code: '82011CA4 0000270F' }
                ]
            },
            'nes': {
                'super-mario-bros': [
                    { name: 'Infinite Lives', code: '0722:09' },
                    { name: 'Moon Gravity', code: '0748:40' }
                ],
                'zelda': [
                    { name: 'Infinite Health', code: '0657:0F' },
                    { name: 'All Items', code: '0780:FF+0781:FF' }
                ],
                'metroid': [
                    { name: 'Infinite Health', code: '06C4:99' },
                    { name: 'Infinite Missiles', code: '06C7:99' }
                ]
            },
            'snes': {
                'super-mario-world': [
                    { name: 'Infinite Lives', code: '7E0DBF63' },
                    { name: 'Always have Yoshi', code: '7E0DC100' }
                ],
                'zelda-link-to-the-past': [
                    { name: 'Infinite Health', code: '7EF36DFF' },
                    { name: 'Infinite Rupees', code: '7EF360FF+7EF361FF' }
                ],
                'street-fighter-2': [
                    { name: 'Infinite Health P1', code: '7E89DF64' },
                    { name: 'One Hit KO P2', code: '7E8ADF00' }
                ]
            }
        };
        
        // Apply the cheats if available for this game
        if (cheats[system] && cheats[system][game]) {
            // Add notification to UI
            const gameInfo = document.getElementById('game-info');
            if (gameInfo) {
                const cheatList = cheats[system][game].map(cheat => `<li>${cheat.name}</li>`).join('');
                
                const cheatNotice = document.createElement('div');
                cheatNotice.style.backgroundColor = '#553300';
                cheatNotice.style.color = '#ffcc00';
                cheatNotice.style.padding = '10px';
                cheatNotice.style.borderRadius = '5px';
                cheatNotice.style.marginTop = '15px';
                cheatNotice.innerHTML = `
                    <h3>⭐ CHEATS ACTIVATED! ⭐</h3>
                    <ul>${cheatList}</ul>
                `;
                
                gameInfo.appendChild(cheatNotice);
            }
            
            // Attempt to add cheats through EmulatorJS API
            if (window.EJS_emulator && typeof window.EJS_emulator.addCheat === 'function') {
                cheats[system][game].forEach(cheat => {
                    window.EJS_emulator.addCheat(cheat.name, cheat.code);
                });
            }
        }
    } catch (e) {
        console.error('Error applying cheats:', e);
    }
}

/**
 * Fallback to handle missing EmulatorJS data files
 */
window.addEventListener('error', function(e) {
    // Check if error is related to EmulatorJS
    if (e.target && (e.target.src || e.target.href)) {
        const url = e.target.src || e.target.href;
        if ((url.includes('data/') || url.includes('roms/')) && !url.includes('cdn.emulatorjs.org')) {
            console.warn('Resource not found:', url);
            e.preventDefault(); // Prevent further error logging
        }
    }
}, true); 