/**
 * Main script for the EmulatorJS game collection
 * This simple script initializes the UI and Konami code functionality
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
    nes: {
        name: "Nintendo Entertainment System",
        core: "nes",
        extensions: [".nes"]
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
    ps: {
        name: "PlayStation",
        core: "psx",
        extensions: [".bin", ".iso"]
    }
};

// Initialize variables
let selectedSystem = "gba"; // Default system
let recentGames = JSON.parse(localStorage.getItem('recentGames')) || [];

// DOM elements
const dragDropArea = document.querySelector('.drag-drop-area');
const fileInput = document.getElementById('rom-file-input');
const browseButton = document.getElementById('browse-button');
const systemButtons = document.querySelectorAll('.system-button');
const recentGamesList = document.getElementById('recent-games-list');

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initializeUI();
    
    // Add event listeners for Konami code
    setupKonamiCode();
    
    setupDragAndDrop();
    setupSystemButtons();
    setupBrowseButton();
    updateRecentGamesList();
});

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
    
    // Handle file input changes
    fileInput.addEventListener('change', handleFiles, false);
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
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file extension matches selected system
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    if (!systems[selectedSystem].extensions.includes(fileExtension)) {
        const validExtensions = systems[selectedSystem].extensions.join(', ');
        alert(`Invalid file type for ${systems[selectedSystem].name}. Please use: ${validExtensions}`);
        return;
    }
    
    // Create object URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Add to recent games
    addToRecentGames({
        name: file.name.replace(fileExtension, ''),
        system: selectedSystem,
        fileUrl,
        lastPlayed: new Date().toISOString()
    });
    
    // Launch the emulator
    launchEmulator(fileUrl, file.name);
}

// Setup system selection buttons
function setupSystemButtons() {
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            systemButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update selected system
            selectedSystem = button.dataset.system;
            
            // Update accepted file types
            updateFileInputAccept();
        });
    });
}

function updateFileInputAccept() {
    // Get all valid extensions for the selected system
    const validExtensions = systems[selectedSystem].extensions.join(',');
    fileInput.setAttribute('accept', validExtensions);
}

// Setup browse button
function setupBrowseButton() {
    browseButton.addEventListener('click', () => {
        fileInput.click();
    });
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
    
    // Update the UI
    updateRecentGamesList();
}

function updateRecentGamesList() {
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
        systemTag.textContent = systems[game.system].name;
        
        const gameTitle = document.createElement('span');
        gameTitle.className = 'game-title';
        gameTitle.textContent = game.name;
        
        const playBtn = document.createElement('button');
        playBtn.className = 'play-again-btn';
        playBtn.textContent = 'Play';
        playBtn.addEventListener('click', () => {
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
    
    // Open the emulator in the same window
    window.location.href = playUrl;
} 