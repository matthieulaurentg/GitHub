/**
 * Main script for the EmulatorJS game collection
 * Handles drag and drop functionality for ROMs
 * Now with automatic ROM downloading capabilities
 */

// Import only the ROM mapper which handles real ROMs
import { initializeROMMapper, getActualROMPath, getAvailableRealROMs, getROMInfo, downloadROM } from './rom-mapper.mjs';

// System definitions with their cores and file extensions
const systems = {
    gba: {
        name: "Game Boy Advance",
        core: "gba",
        extensions: [".gba"]
    },
    gb: {
        name: "Game Boy / Game Boy Color",
        core: "gb",
        extensions: [".gb", ".gbc"]
    },
    nes: {
        name: "Nintendo Entertainment System",
        core: "nes",
        extensions: [".nes", ".fds"]
    },
    snes: {
        name: "Super Nintendo",
        core: "snes",
        extensions: [".sfc", ".smc"]
    },
    n64: {
        name: "Nintendo 64",
        core: "n64",
        extensions: [".n64", ".z64", ".v64"]
    },
    nds: {
        name: "Nintendo DS",
        core: "nds",
        extensions: [".nds"]
    },
    vb: {
        name: "Virtual Boy",
        core: "vb",
        extensions: [".vb", ".vboy"]
    },
    arcade: {
        name: "Arcade",
        core: "arcade",
        extensions: [".zip"]
    },
    segaMS: {
        name: "Sega Master System",
        core: "segaMS",
        extensions: [".sms"]
    },
    segaMD: {
        name: "Sega Mega Drive / Genesis",
        core: "segaMD",
        extensions: [".md", ".gen", ".bin"]
    },
    segaGG: {
        name: "Sega Game Gear",
        core: "segaGG",
        extensions: [".gg"]
    },
    segaCD: {
        name: "Sega CD / Mega CD",
        core: "segaCD",
        extensions: [".cue", ".iso", ".bin"]
    },
    sega32x: {
        name: "Sega 32X",
        core: "sega32x",
        extensions: [".32x", ".bin"]
    },
    segaSaturn: {
        name: "Sega Saturn",
        core: "segaSaturn",
        extensions: [".cue", ".iso"]
    },
    atari2600: {
        name: "Atari 2600",
        core: "atari2600",
        extensions: [".a26", ".bin"]
    },
    atari7800: {
        name: "Atari 7800",
        core: "atari7800",
        extensions: [".a78", ".bin"]
    },
    lynx: {
        name: "Atari Lynx",
        core: "lynx",
        extensions: [".lnx"]
    },
    jaguar: {
        name: "Atari Jaguar",
        core: "jaguar",
        extensions: [".j64", ".jag"]
    },
    psx: {
        name: "PlayStation",
        core: "psx",
        extensions: [".bin", ".cue", ".iso", ".img"]
    },
    psp: {
        name: "PlayStation Portable",
        core: "psp",
        extensions: [".iso", ".cso", ".pbp"]
    },
    "3do": {
        name: "3DO",
        core: "3do",
        extensions: [".iso", ".cue"]
    },
    mame2003: {
        name: "MAME 2003",
        core: "mame2003",
        extensions: [".zip"]
    },
    coleco: {
        name: "ColecoVision",
        core: "coleco",
        extensions: [".col", ".rom", ".bin"]
    },
    ws: {
        name: "WonderSwan / Color",
        core: "ws",
        extensions: [".ws", ".wsc"]
    },
    ngp: {
        name: "Neo Geo Pocket / Color",
        core: "ngp",
        extensions: [".ngp", ".ngc"]
    },
    pcengine: {
        name: "PC Engine / TurboGrafx-16",
        core: "pcengine",
        extensions: [".pce", ".cue"]
    }
};

// Initialize variables
let selectedSystem = "gba"; // Default system
let recentGames = [];
// Flag to track if we're auto-downloading ROMs
let autoDownloadInProgress = false;

try {
    recentGames = JSON.parse(localStorage.getItem('recentGames')) || [];
} catch (e) {
    console.error("Error loading recent games:", e);
    recentGames = [];
}

// DOM elements
let dragDropArea = null;
let fileInput = null;
let browseButton = null;
let systemButtons = null;
let recentGamesList = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded, initializing emulator for direct ROM loading...");
    
    // Initialize ROM mapper
    initializeROMMapper();
    
    // Initialize DOM elements
    dragDropArea = document.querySelector('.drag-drop-area');
    fileInput = document.getElementById('rom-file-input');
    browseButton = document.getElementById('browse-button');
    systemButtons = document.querySelectorAll('.system-button');
    recentGamesList = document.getElementById('recent-games-list');
    
    // Add search functionality
    initializeSearch();
    
    // Add event listeners for Konami code
    setupKonamiCode();
    
    // Set up the drag and drop functionality
    setupDragAndDrop();
    
    // Set up the system selector buttons
    setupSystemButtons();
    
    // Set up the browse button
    setupBrowseButton();
    
    // Update the recent games list
    updateRecentGamesList();
    
    // Create the full system selector
    createSystemSelector();
    
    // Initialize system info display
    updateSystemInfo(selectedSystem);
    
    // Check for direct ROM loading parameters
    checkForDirectLoad();
    
    // Create a section for real ROMs that exist
    createRealROMsSection();
    
    // Load the EmulatorJS script
    loadEmulatorJSScript();
    
    console.log("Emulator initialization complete");
});

// Automatically download all ROMs in the background
async function startAutoDownloadAllROMs() {
    if (autoDownloadInProgress) return;
    
    autoDownloadInProgress = true;
    console.log("Starting automatic background download of all ROMs");
    
    // Create a status indicator
    const statusElement = document.createElement('div');
    statusElement.id = 'auto-download-status';
    statusElement.style.position = 'fixed';
    statusElement.style.bottom = '20px';
    statusElement.style.right = '20px';
    statusElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    statusElement.style.color = '#00ff00';
    statusElement.style.padding = '15px';
    statusElement.style.borderRadius = '5px';
    statusElement.style.zIndex = '9999';
    statusElement.style.fontSize = '14px';
    statusElement.style.boxShadow = '0 0 10px rgba(0, 136, 255, 0.5)';
    statusElement.textContent = 'Auto-downloading ROMs in background...';
    document.body.appendChild(statusElement);
    
    try {
        // Get all available real ROMs
        const availableROMs = getAvailableRealROMs();
        let totalROMs = 0;
        let downloadedROMs = 0;
        
        // Count total ROMs
        Object.values(availableROMs).forEach(roms => {
            totalROMs += roms.length;
        });
        
        if (totalROMs === 0) {
            statusElement.textContent = 'No ROMs to auto-download';
            fadeAndRemoveElement(statusElement, 2000);
            autoDownloadInProgress = false;
            return;
        }
        
        // Download each ROM
        for (const system in availableROMs) {
            for (const romId of availableROMs[system]) {
                try {
                    statusElement.textContent = `Auto-downloading (${downloadedROMs}/${totalROMs}): ${romId}`;
                    
                    // Download the ROM
                    const result = await downloadROM(romId);
                    downloadedROMs++;
                    
                    // Update status
                    const percentComplete = Math.round((downloadedROMs / totalROMs) * 100);
                    statusElement.textContent = `Auto-downloading: ${percentComplete}% complete`;
                } catch (error) {
                    console.error(`Error downloading ROM ${romId}:`, error);
                }
            }
        }
        
        // All done
        statusElement.textContent = 'All ROMs auto-downloaded successfully!';
        statusElement.style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
        fadeAndRemoveElement(statusElement, 3000);
    } catch (error) {
        console.error("Error in auto-download process:", error);
        statusElement.textContent = 'Error during auto-download';
        statusElement.style.backgroundColor = 'rgba(100, 0, 0, 0.8)';
        fadeAndRemoveElement(statusElement, 3000);
    } finally {
        autoDownloadInProgress = false;
    }
}

// Helper function to fade out and remove an element
function fadeAndRemoveElement(element, delay) {
    setTimeout(() => {
        element.style.transition = 'opacity 1s';
        element.style.opacity = '0';
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 1000);
    }, delay);
}

// Load the EmulatorJS script from CDN
function loadEmulatorJSScript() {
    const script = document.createElement('script');
    script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
    script.onload = () => {
        console.log("EmulatorJS loader script loaded successfully");
    };
    script.onerror = (e) => {
        console.error("Failed to load EmulatorJS:", e);
        alert("Failed to load EmulatorJS. Please check your internet connection and try again.");
    };
    document.body.appendChild(script);
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('system-search');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            filterSystems(searchInput.value);
        });
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterSystems(searchInput.value);
            }
        });
    }
}

// Filter systems based on search term
function filterSystems(searchTerm) {
    if (!searchTerm) {
        // If search term is empty, show all systems
        document.querySelectorAll('.system-category').forEach(cat => {
            cat.style.display = 'block';
        });
        document.querySelectorAll('.system-button').forEach(btn => {
            btn.style.display = 'inline-block';
        });
        return;
    }
    
    searchTerm = searchTerm.toLowerCase();
    
    // Check each system
    let foundAny = false;
    
    document.querySelectorAll('.system-button').forEach(btn => {
        const systemKey = btn.dataset.system;
        const systemName = systems[systemKey]?.name.toLowerCase() || '';
        
        if (systemName.includes(searchTerm) || systemKey.includes(searchTerm)) {
            btn.style.display = 'inline-block';
            foundAny = true;
            
            // Make sure parent category is visible
            const parentCategory = btn.closest('.system-category-buttons')?.previousElementSibling;
            if (parentCategory) {
                parentCategory.style.display = 'block';
            }
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Hide empty categories
    document.querySelectorAll('.system-category').forEach(cat => {
        const buttons = cat.nextElementSibling?.querySelectorAll('.system-button[style*="display: inline-block"]');
        if (!buttons || buttons.length === 0) {
            cat.style.display = 'none';
        } else {
            cat.style.display = 'block';
        }
    });
    
    // Show message if no systems found
    const systemSelector = document.querySelector('.system-selector');
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (!foundAny && systemSelector) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.style.padding = '10px';
            noResultsMsg.style.color = '#ff6666';
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.textContent = `No systems found matching "${searchTerm}"`;
            systemSelector.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

/**
 * Initialize UI elements
 */
function initializeUI() {
    // Mark all ROMs as available with green indicators
    const romIndicators = document.querySelectorAll('.rom-ready');
    romIndicators.forEach(indicator => {
        indicator.style.display = 'inline-block';
    });
    
    // Add hover effect to the secret tip
    const secretTip = document.querySelector('.secret-tip');
    if (secretTip) {
        secretTip.addEventListener('click', () => {
            alert('Hint: Try pressing ↑↑↓↓←→←→BA while playing a game!');
        });
    }
}

/**
 * Set up the Konami code easter egg
 */
function setupKonamiCode() {
    // Konami code sequence: ↑↑↓↓←→←→BA
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                        'b', 'a'];
    let konamiPosition = 0;
    
    document.addEventListener('keydown', e => {
        // Check if the pressed key matches the next key in the Konami code
        if (e.key === konamiCode[konamiPosition]) {
            konamiPosition++;
            
            // If the entire code is entered
            if (konamiPosition === konamiCode.length) {
                // Activate cheat mode
                activateCheatMode();
                
                // Reset the position
                konamiPosition = 0;
            }
        } else {
            // Reset if wrong key is pressed
            konamiPosition = 0;
        }
    });
}

/**
 * Activate cheat mode when Konami code is entered
 */
function activateCheatMode() {
    // Store activation in localStorage for persistence
    localStorage.setItem('konamiActivated', 'true');
    
    // Create a notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#ffcc00';
    notification.style.color = '#000';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    notification.style.zIndex = '999';
    notification.style.fontWeight = 'bold';
    notification.style.fontSize = '16px';
    notification.textContent = '⭐ CHEAT MODE ACTIVATED! ⭐';
    
    // Add to the document
    document.body.appendChild(notification);
    
    // Make it disappear after 3 seconds
    setTimeout(() => {
        notification.style.transition = 'opacity 1s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 1000);
    }, 3000);
    
    // Add a fun visual effect
    addCheatEffect();
}

/**
 * Add a visual effect when cheat mode is activated
 */
function addCheatEffect() {
    // Create a flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = '#ffcc00';
    flash.style.opacity = '0.3';
    flash.style.zIndex = '998';
    
    // Add to the document
    document.body.appendChild(flash);
    
    // Fade out after a short delay
    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 100);
}

/**
 * Updates the instructions section to indicate ROMs are pre-downloaded
 */
function updateInstructions() {
    const note = document.querySelector('.note');
    if (note) {
        note.innerHTML = `
            <p><strong>Note:</strong> All ROMs have been pre-downloaded from emulatorgames.net for educational purposes.</p>
            <p>The emulator will load these ROMs directly without requiring additional downloads.</p>
            <p>We encourage supporting the original developers by purchasing their games when available.</p>
        `;
        
        // Add a visual indicator that ROMs are ready
        const gameLinks = document.querySelectorAll('.game-link');
        gameLinks.forEach(link => {
            // Add a small indicator that the ROM is pre-downloaded
            const romReady = document.createElement('span');
            romReady.textContent = ' ✅';
            romReady.style.color = '#00cc00';
            link.appendChild(romReady);
        });
    }
}

/**
 * Creates the hidden Easter Egg element
 */
function createEasterEgg() {
    const easterEgg = document.createElement('div');
    easterEgg.className = 'easter-egg';
    easterEgg.id = 'konami-easter-egg';
    
    easterEgg.innerHTML = `
        <h2>🎮 SECRET UNLOCKED! 🎮</h2>
        <p>You've found the hidden retro games collection! All games are now unlocked with special powers.</p>
        <p>Go back to any game and you'll have access to unlimited lives, all levels, and special character abilities.</p>
        <button id="easter-egg-close">AWESOME, LET ME PLAY!</button>
    `;
    
    document.body.appendChild(easterEgg);
    
    // Add close button event
    const closeButton = document.getElementById('easter-egg-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            easterEgg.classList.remove('active');
            
            // Set a flag in localStorage to remember the easter egg was found
            localStorage.setItem('konamiActivated', 'true');
        });
    }
}

/**
 * Activates the Easter Egg when Konami code is entered
 */
function activateEasterEgg() {
    // Show the Easter Egg popup
    const easterEgg = document.getElementById('konami-easter-egg');
    if (easterEgg) {
        easterEgg.classList.add('active');
    }
    
    // Play a retro sound effect
    playRetroSound();
    
    // Add special colors or effects to game links
    const gameLinks = document.querySelectorAll('.game-link');
    gameLinks.forEach(link => {
        link.style.transition = 'all 0.5s ease';
        link.style.color = '#ff8800';
        link.style.fontWeight = 'bold';
        
        // Add sparkle animation
        link.style.animation = 'sparkle 1.5s infinite';
    });
    
    // Add keyframe animation for sparkle effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkle {
            0% { text-shadow: 0 0 5px rgba(255, 136, 0, 0.5); }
            50% { text-shadow: 0 0 15px rgba(255, 136, 0, 1); }
            100% { text-shadow: 0 0 5px rgba(255, 136, 0, 0.5); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Plays a retro sound effect
 */
function playRetroSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        // Play the classic "power up" sound
        oscillator.frequency.setValueAtTime(110, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    if (!dragDropArea) {
        console.error("Drag and drop area not found");
        return;
    }
    
    console.log("Setting up drag and drop functionality");
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, highlight, false);
    });
    
    // Remove highlight when item is dragged away
    ['dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dragDropArea.addEventListener('drop', handleDrop, false);
    
    console.log("Drag and drop setup complete");
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    if (dragDropArea) {
        dragDropArea.classList.add('highlight');
    }
}

function unhighlight() {
    if (dragDropArea) {
        dragDropArea.classList.remove('highlight');
    }
}

function handleDrop(e) {
    console.log("File dropped");
    preventDefaults(e);
    
    const dt = e.dataTransfer;
    if (!dt || !dt.files || dt.files.length === 0) {
        console.error("No files found in drop event");
        return;
    }
    
    const file = dt.files[0];
    console.log("Dropped file:", file.name);
    handleFile(file);
}

// Setup file input for browsing files
function setupBrowseButton() {
    if (!browseButton || !fileInput) {
        console.error("Browse button or file input not found");
        return;
    }
    
    console.log("Setting up browse button");
    
    browseButton.addEventListener('click', () => {
        console.log("Browse button clicked");
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        console.log("File input changed");
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            handleFile(file);
        }
    });
    
    // Initialize the file input accept attribute
    updateFileInputAccept();
    
    console.log("Browse button setup complete");
}

// Handle the ROM file
function handleFile(file) {
    if (!file) {
        console.error("No file provided");
        return;
    }
    
    console.log("Handling file:", file.name);
    
    try {
        // Check if file extension matches selected system
        const fileName = file.name.toLowerCase();
        const fileExtension = '.' + fileName.split('.').pop();
        
        console.log("File extension:", fileExtension);
        console.log("Selected system:", selectedSystem);
        console.log("Valid extensions:", systems[selectedSystem].extensions);
        
        // Check if file extension is valid for the selected system
        if (!systems[selectedSystem].extensions.includes(fileExtension)) {
            const validExtensions = systems[selectedSystem].extensions.join(', ');
            alert(`Invalid file type for ${systems[selectedSystem].name}. Please use: ${validExtensions}`);
            console.error(`Invalid file type: ${fileExtension}. Expected: ${validExtensions}`);
            return;
        }
        
        // Create object URL for the file
        const fileUrl = URL.createObjectURL(file);
        console.log("Created blob URL:", fileUrl);
        
        // Get info for recent games
        const gameName = file.name.replace(fileExtension, '');
        
        // Add to recent games
        addToRecentGames({
            name: gameName,
            system: selectedSystem,
            fileUrl,
            lastPlayed: new Date().toISOString()
        });
        
        // Use EmulatorJS to launch the game
        launchEmulatorJS(fileUrl, gameName);
    } catch (error) {
        console.error("Error handling file:", error);
        alert(`Error loading ROM: ${error.message}`);
    }
}

// Launch the emulator using EmulatorJS
function launchEmulatorJS(fileUrl, gameName) {
    console.log("Launching EmulatorJS with ROM:", gameName);
    
    // Create the EmulatorJS URL with parameters
    const playUrl = `play.html?system=${selectedSystem}&blob=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(gameName)}`;
    
    // Redirect to the play page
    window.location.href = playUrl;
}

// Setup system selection buttons
function setupSystemButtons() {
    if (!systemButtons) {
        console.log("No system buttons found in DOM yet, will be created dynamically");
        return;
    }
    
    console.log("Setting up system buttons");
    
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            systemButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update selected system
            selectedSystem = button.dataset.system;
            console.log("Selected system changed to:", selectedSystem);
            
            // Update accepted file types
            updateFileInputAccept();
        });
    });
    
    console.log("System buttons setup complete");
}

function updateFileInputAccept() {
    if (!fileInput) {
        console.error("File input not found");
        return;
    }
    
    // Get all valid extensions for the selected system
    const validExtensions = systems[selectedSystem].extensions.join(',');
    fileInput.setAttribute('accept', validExtensions);
    console.log("Updated file input accept attribute:", validExtensions);
    
    // Update the file input placeholder text
    const dragDropText = document.querySelector('.drag-drop-area h3');
    if (dragDropText) {
        dragDropText.textContent = `Drag & Drop Your ${systems[selectedSystem].name} ROM`;
    }
    
    // Update the accepted file types text
    const dragDropInstructions = document.querySelector('.drag-drop-area p');
    if (dragDropInstructions) {
        dragDropInstructions.textContent = `Accepted formats: ${systems[selectedSystem].extensions.join(', ')}`;
    }
}

// Handle recent games
function addToRecentGames(game) {
    // Remove if already in list
    recentGames = recentGames.filter(g => !(g.name === game.name && g.system === game.system));
    
    // Add to top of list
    recentGames.unshift(game);
    
    // Keep only 10 most recent
    if (recentGames.length > 10) {
        recentGames = recentGames.slice(0, 10);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('recentGames', JSON.stringify(recentGames));
        console.log("Updated recent games list:", recentGames);
    } catch (e) {
        console.error("Error saving recent games:", e);
    }
    
    // Update the UI
    updateRecentGamesList();
}

function updateRecentGamesList() {
    if (!recentGamesList) {
        console.error("Recent games list element not found");
        return;
    }
    
    // Clear current list
    recentGamesList.innerHTML = '';
    
    // If no recent games, show message
    if (recentGames.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No recently played games';
        recentGamesList.appendChild(emptyMessage);
        return;
    }
    
    // Add each game to the list
    recentGames.forEach(game => {
        const li = document.createElement('li');
        
        const systemTag = document.createElement('span');
        systemTag.className = 'system-tag';
        systemTag.textContent = systems[game.system] ? systems[game.system].name : game.system;
        
        const gameTitle = document.createElement('span');
        gameTitle.className = 'game-title';
        gameTitle.textContent = game.name;
        
        const playBtn = document.createElement('button');
        playBtn.className = 'play-again-btn';
        playBtn.textContent = 'Play';
        playBtn.addEventListener('click', () => {
            console.log("Playing recent game:", game.name);
            launchEmulatorJS(game.fileUrl, game.name);
        });
        
        li.appendChild(systemTag);
        li.appendChild(gameTitle);
        li.appendChild(playBtn);
        
        recentGamesList.appendChild(li);
    });
}

// Create a complete system selector with all supported systems
function createSystemSelector() {
    const systemSelector = document.querySelector('.system-selector');
    if (!systemSelector) return;
    
    // Clear existing buttons
    systemSelector.innerHTML = '';
    
    // Create a category structure for better organization
    const categories = {
        "nintendo": {
            name: "Nintendo",
            systems: ["gb", "gba", "nes", "snes", "n64", "nds", "vb"]
        },
        "sega": {
            name: "Sega",
            systems: ["segaMS", "segaMD", "segaGG", "segaCD", "sega32x", "segaSaturn"]
        },
        "atari": {
            name: "Atari",
            systems: ["atari2600", "atari7800", "lynx", "jaguar"]
        },
        "sony": {
            name: "Sony",
            systems: ["psx", "psp"]
        },
        "arcade": {
            name: "Arcade & Others",
            systems: ["arcade", "mame2003", "3do", "coleco", "ws", "ngp", "pcengine"]
        }
    };
    
    // Create the category selectors
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'system-category';
        categoryHeader.textContent = category.name;
        systemSelector.appendChild(categoryHeader);
        
        // Create container for this category's buttons
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'system-category-buttons';
        systemSelector.appendChild(categoryContainer);
        
        // Add system buttons for this category
        category.systems.forEach(sysKey => {
            if (systems[sysKey]) {
                const button = document.createElement('button');
                button.className = 'system-button';
                button.dataset.system = sysKey;
                button.textContent = systems[sysKey].name;
                
                // Set active class for default system
                if (sysKey === selectedSystem) {
                    button.classList.add('active');
                }
                
                button.addEventListener('click', () => {
                    // Remove active class from all buttons
                    document.querySelectorAll('.system-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    
                    // Update selected system
                    selectedSystem = sysKey;
                    
                    // Update accepted file types
                    updateFileInputAccept();
                    
                    // Update system info
                    updateSystemInfo(sysKey);
                });
                
                categoryContainer.appendChild(button);
            }
        });
    });
}

// Update system information display
function updateSystemInfo(systemKey) {
    const systemDetails = document.getElementById('system-details');
    if (!systemDetails || !systems[systemKey]) return;
    
    const system = systems[systemKey];
    
    systemDetails.innerHTML = `
        <h4>${system.name}</h4>
        <ul>
            <li><strong>Core:</strong> ${system.core}</li>
            <li><strong>File types:</strong> ${system.extensions.join(', ')}</li>
        </ul>
        <p>Drag and drop a ${system.extensions[0]} file into the box below to play.</p>
    `;
}

// Check for direct ROM loading via URL parameters
function checkForDirectLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const system = urlParams.get('system');
    const rom = urlParams.get('rom');
    
    if (system && rom && systems[system]) {
        console.log(`Direct ROM loading requested: ${system}/${rom}`);
        
        // Set the selected system
        selectedSystem = system;
        
        // Update the UI to show the selected system
        document.querySelectorAll('.system-button').forEach(btn => {
            if (btn.dataset.system === system) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Try to get the actual ROM path (only real ROMs)
        const actualPath = getActualROMPath(system, rom);
        
        if (actualPath) {
            console.log(`Found real ROM path: ${actualPath}`);
            
            // Check if the file exists
            fetch(actualPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ROM: ${response.statusText}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Create a File object from the Blob
                    const fileName = actualPath.split('/').pop();
                    const file = new File([blob], fileName, { type: 'application/octet-stream' });
                    
                    // Get ROM info if available
                    const romInfo = getROMInfo(system, rom);
                    
                    // Add to recent games with proper info
                    addToRecentGames({
                        name: romInfo ? romInfo.title : fileName.replace(/\.\w+$/, ''),
                        system: system,
                        filePath: actualPath,
                        lastPlayed: new Date().toISOString()
                    });
                    
                    // Handle the file using EmulatorJS
                    handleFile(file);
                })
                .catch(error => {
                    console.error(`Error loading ROM: ${error.message}`);
                    alert(`Error loading ROM: ${error.message}`);
                });
        } else {
            console.error(`No real ROM file found for ${system}/${rom}`);
            alert(`No real ROM file found for ${rom}. Please add the ROM file to the roms/${system}/ directory.`);
        }
    }
}

// Create a section for real ROMs
function createRealROMsSection() {
    const realROMs = getAvailableRealROMs();
    const featuredGamesGrid = document.querySelector('.featured-games-grid');
    
    if (!featuredGamesGrid) {
        console.error("Featured games grid not found");
        return;
    }
    
    // Clear existing content
    featuredGamesGrid.innerHTML = '';
    
    // Count available real ROMs
    let romCount = 0;
    
    // For each system with real ROMs
    Object.keys(realROMs).forEach(system => {
        realROMs[system].forEach(romId => {
            romCount++;
            
            // Get ROM info
            const info = getROMInfo(system, romId) || {
                title: romId.replace(/-/g, ' '),
                system: systems[system]?.name || system,
                emoji: '🎮'
            };
            
            // Create a card for this ROM
            const card = document.createElement('div');
            card.className = 'featured-game-card';
            
            card.innerHTML = `
                <div class="featured-game-image">
                    <span>${info.emoji || '🎮'}</span>
                </div>
                <div class="featured-game-info">
                    <div class="featured-game-title">${info.title}</div>
                    <div class="featured-game-system">${info.system || systems[system].name}</div>
                    <button class="featured-game-play" data-system="${system}" data-rom="${romId}">Play Now</button>
                </div>
            `;
            
            // Add to the grid
            featuredGamesGrid.appendChild(card);
            
            // Add click event to the play button
            const playButton = card.querySelector('.featured-game-play');
            if (playButton) {
                playButton.addEventListener('click', () => {
                    const system = playButton.dataset.system;
                    const rom = playButton.dataset.rom;
                    if (system && rom) {
                        window.location.href = `?system=${system}&rom=${rom}`;
                    }
                });
            }
        });
    });
    
    // Update header based on ROM count
    const featuredGamesHeader = document.querySelector('.featured-games h3');
    if (featuredGamesHeader) {
        if (romCount === 0) {
            featuredGamesHeader.textContent = 'No Real ROMs Found';
            
            // Show a message
            const message = document.createElement('p');
            message.style.textAlign = 'center';
            message.style.padding = '20px';
            message.style.color = '#888';
            message.innerHTML = 'No real ROM files were found. Please add your ROM files to the <code>roms</code> folder.';
            featuredGamesGrid.appendChild(message);
        } else {
            featuredGamesHeader.textContent = `Available ROMs (${romCount})`;
        }
    }
} 