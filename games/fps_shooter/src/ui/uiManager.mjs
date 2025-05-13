import { player } from '../player/player.mjs';
import { weapon } from '../weapons/weapon.mjs';
import { gameState } from '../main.mjs';

// Cache UI elements
let healthBar;
let healthText;
let ammoCounter;
let scoreDisplay;
let gameOverScreen;
let finalScoreDisplay;
let startScreen;
let damageOverlay;
let crosshair;

// Initialize on first import
initUIElements();

function initUIElements() {
    // Get UI elements from DOM
    healthBar = document.getElementById('health');
    healthText = document.getElementById('health-text');
    ammoCounter = document.getElementById('ammo-counter');
    scoreDisplay = document.getElementById('score-display');
    gameOverScreen = document.getElementById('game-over');
    finalScoreDisplay = document.getElementById('final-score');
    startScreen = document.getElementById('start-screen');
    damageOverlay = document.getElementById('damage-overlay');
    crosshair = document.getElementById('crosshair');
}

export function updateUI() {
    // Update health bar
    if (healthBar && player) {
        const healthPercent = (player.health / player.maxHealth) * 100;
        healthBar.style.width = `${healthPercent}%`;
        
        // Change color based on health
        if (healthPercent > 60) {
            healthBar.style.backgroundColor = '#ff3e3e';
        } else if (healthPercent > 30) {
            healthBar.style.backgroundColor = '#ff7f00';
        } else {
            healthBar.style.backgroundColor = '#ff0000';
        }
        
        // Update health text
        if (healthText) {
            healthText.textContent = Math.floor(player.health);
        }
    }
    
    // Update ammo counter
    if (ammoCounter && weapon) {
        ammoCounter.textContent = `${weapon.ammo} / ${weapon.reserveAmmo}`;
    }
    
    // Update score display
    if (scoreDisplay && gameState) {
        scoreDisplay.textContent = `Score: ${gameState.score}`;
    }
}

export function showGameOver(finalScore) {
    if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
        
        if (finalScoreDisplay) {
            finalScoreDisplay.textContent = `Score: ${finalScore}`;
        }
    }
}

export function hideGameOver() {
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
    }
}

export function showStartScreen() {
    if (startScreen) {
        startScreen.style.display = 'flex';
    }
}

export function hideStartScreen() {
    if (startScreen) {
        startScreen.style.display = 'none';
    }
}

export function showDamageEffect() {
    if (damageOverlay) {
        damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        
        // Fade out
        setTimeout(() => {
            damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        }, 300);
    }
}

export function showHitMarker() {
    // Create a hit marker element
    const hitMarker = document.createElement('div');
    hitMarker.className = 'hit-marker';
    hitMarker.textContent = '×';
    document.getElementById('ui-container').appendChild(hitMarker);
    
    // Remove it after animation
    setTimeout(() => {
        hitMarker.style.opacity = '0';
        setTimeout(() => {
            hitMarker.remove();
        }, 200);
    }, 100);
}

export function updateWaveIndicator(wave) {
    // Would show the current wave number
    // Could be implemented with a wave notification
    
    // Create a wave notification
    const waveNotification = document.createElement('div');
    waveNotification.style.position = 'absolute';
    waveNotification.style.top = '40%';
    waveNotification.style.left = '50%';
    waveNotification.style.transform = 'translate(-50%, -50%)';
    waveNotification.style.color = '#fff';
    waveNotification.style.fontSize = '36px';
    waveNotification.style.fontWeight = 'bold';
    waveNotification.style.textShadow = '2px 2px 4px #000';
    waveNotification.style.opacity = '0';
    waveNotification.style.transition = 'opacity 0.5s';
    waveNotification.textContent = `Wave ${wave}`;
    
    document.getElementById('ui-container').appendChild(waveNotification);
    
    // Show and hide the notification
    setTimeout(() => {
        waveNotification.style.opacity = '1';
        
        setTimeout(() => {
            waveNotification.style.opacity = '0';
            
            setTimeout(() => {
                waveNotification.remove();
            }, 500);
        }, 2000);
    }, 10);
}

export function showPickupMessage(message) {
    // Create a pickup message
    const pickupMsg = document.createElement('div');
    pickupMsg.style.position = 'absolute';
    pickupMsg.style.bottom = '100px';
    pickupMsg.style.left = '50%';
    pickupMsg.style.transform = 'translateX(-50%)';
    pickupMsg.style.color = '#fff';
    pickupMsg.style.fontSize = '18px';
    pickupMsg.style.fontWeight = 'bold';
    pickupMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    pickupMsg.style.padding = '10px 20px';
    pickupMsg.style.borderRadius = '5px';
    pickupMsg.style.opacity = '0';
    pickupMsg.style.transition = 'opacity 0.3s';
    pickupMsg.textContent = message;
    
    document.getElementById('ui-container').appendChild(pickupMsg);
    
    // Show and hide the message
    setTimeout(() => {
        pickupMsg.style.opacity = '1';
        
        setTimeout(() => {
            pickupMsg.style.opacity = '0';
            
            setTimeout(() => {
                pickupMsg.remove();
            }, 300);
        }, 2000);
    }, 10);
}

export function togglePauseMenu(isPaused) {
    // Would show/hide a pause menu
    // Not fully implemented in this version
    
    if (isPaused) {
        // Create and show pause menu
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pause-menu';
        pauseMenu.style.position = 'absolute';
        pauseMenu.style.top = '0';
        pauseMenu.style.left = '0';
        pauseMenu.style.width = '100%';
        pauseMenu.style.height = '100%';
        pauseMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        pauseMenu.style.display = 'flex';
        pauseMenu.style.flexDirection = 'column';
        pauseMenu.style.justifyContent = 'center';
        pauseMenu.style.alignItems = 'center';
        pauseMenu.style.zIndex = '150';
        
        // Add pause menu content
        pauseMenu.innerHTML = `
            <h1 style="color: #fff; font-size: 36px; margin-bottom: 20px;">PAUSED</h1>
            <p style="color: #fff; font-size: 18px; margin-bottom: 30px;">Press ESC or P to resume</p>
        `;
        
        document.getElementById('game-container').appendChild(pauseMenu);
    } else {
        // Remove pause menu
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.remove();
        }
    }
} 