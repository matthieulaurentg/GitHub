/**
 * Main script for the retro game emulator
 * Using pre-downloaded ROMs from emulatorgames.net
 */

import { initializeROMs } from './rom-downloader.mjs';
import { initializeAllROMs } from './rom-simulator.mjs';

// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize ROMs for the main game list page
    const isGameList = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    
    if (isGameList) {
        // Initialize all ROM information for the game list
        initializeROMs();
        
        // Update the instructions to indicate ROMs are pre-downloaded
        updateInstructions();
    }
    
    // Create Easter Egg element but hide it initially
    createEasterEgg();
    
    // Setup secret tip click handler
    const secretTip = document.querySelector('.secret-tip');
    if (secretTip) {
        secretTip.addEventListener('click', () => {
            alert('Try using the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A');
        });
    }
    
    // Setup Konami Code listener
    document.addEventListener('keydown', (e) => {
        // Check if the key matches the expected key in sequence
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            // If the full sequence is entered correctly
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0; // Reset for next time
            }
        } else {
            konamiIndex = 0; // Reset if wrong key
        }
    });
});

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