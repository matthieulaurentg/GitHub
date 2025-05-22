/**
 * Main script for the EmulatorJS game collection
 * Handles drag and drop functionality for ROMs
 */

import { initializeROMs } from './rom-downloader.mjs';
import { initializeAllROMs } from './rom-simulator.mjs';

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
    3do: {
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
let recentGames = JSON.parse(localStorage.getItem('recentGames')) || [];

// DOM elements
let dragDropArea;
let fileInput;
let browseButton;
let systemButtons;
let recentGamesList;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded, initializing emulator...");
    
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
    
    console.log("Emulator initialization complete");
});

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
            const parentCategory = btn.closest('.system-category-buttons').previousElementSibling;
            if (parentCategory) {
                parentCategory.style.display = 'block';
            }
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Hide empty categories
    document.querySelectorAll('.system-category').forEach(cat => {
        const buttons = cat.nextElementSibling.querySelectorAll('.system-button[style*="display: inline-block"]');
        if (buttons.length === 0) {
            cat.style.display = 'none';
        } else {
            cat.style.display = 'block';
        }
    });
    
    // Show message if no systems found
    const systemSelector = document.querySelector('.system-selector');
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (!foundAny) {
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
    dragDropArea.classList.add('highlight');
}

function unhighlight() {
    dragDropArea.classList.remove('highlight');
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
        
        // Add to recent games
        addToRecentGames({
            name: file.name.replace(fileExtension, ''),
            system: selectedSystem,
            fileUrl,
            lastPlayed: new Date().toISOString()
        });
        
        // Launch the emulator
        console.log("Launching emulator with file:", file.name);
        launchEmulator(fileUrl, file.name);
    } catch (error) {
        console.error("Error handling file:", error);
        alert(`Error loading ROM: ${error.message}`);
    }
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
    localStorage.setItem('recentGames', JSON.stringify(recentGames));
    console.log("Updated recent games list:", recentGames);
    
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
            launchEmulator(game.fileUrl, game.name);
        });
        
        li.appendChild(systemTag);
        li.appendChild(gameTitle);
        li.appendChild(playBtn);
        
        recentGamesList.appendChild(li);
    });
}

// Launch the emulator
function launchEmulator(fileUrl, fileName) {
    // Create play URL with blob URL parameter
    const playUrl = `play.html?system=${selectedSystem}&blob=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`;
    console.log("Launching emulator with URL:", playUrl);
    
    // Open the emulator in the same window
    window.location.href = playUrl;
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