/**
 * Main script for the EmulatorJS game collection
 * This simple script initializes the UI and Konami code functionality
 */

import { initializeROMs } from './rom-downloader.mjs';
import { initializeAllROMs } from './rom-simulator.mjs';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initializeUI();
    
    // Add event listeners for Konami code
    setupKonamiCode();
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