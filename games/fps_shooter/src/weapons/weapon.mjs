import * as THREE from 'three';
import { scene, camera } from '../map/sceneSetup.mjs';
import { gameState } from '../main.mjs';

// Weapon settings
const DAMAGE = 20;
const FIRE_RATE = 150; // ms between shots
const RELOAD_TIME = 2000; // ms
const MAX_AMMO = 30;
const MAX_RESERVE_AMMO = 90;
const RECOIL_AMOUNT = 0.02;
const BULLET_RANGE = 100;

// Weapon state
export const weapon = {
    name: 'Assault Rifle',
    damage: DAMAGE,
    ammo: MAX_AMMO,
    reserveAmmo: MAX_RESERVE_AMMO,
    maxAmmo: MAX_AMMO,
    isReloading: false,
    lastShotTime: 0,
    reloadStartTime: 0,
    model: null
};

// Raycaster for hit detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0); // Center of screen

export function createWeapon() {
    // Reset weapon state
    weapon.ammo = MAX_AMMO;
    weapon.reserveAmmo = MAX_RESERVE_AMMO;
    weapon.isReloading = false;
    
    // Create weapon model
    createWeaponModel();
    
    // Update ammo display
    updateAmmoDisplay();
}

function createWeaponModel() {
    // Create a simple weapon model
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
    const weaponMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    weapon.model = new THREE.Mesh(weaponGeometry, weaponMaterial);
    
    // Position the weapon
    weapon.model.position.set(0.3, -0.2, -0.5);
    
    // Add to camera
    camera.add(weapon.model);
}

export function shoot() {
    // Check if we can shoot
    if (weapon.isReloading) return;
    if (weapon.ammo <= 0) {
        reload();
        return;
    }
    
    // Check fire rate
    const now = Date.now();
    if (now - weapon.lastShotTime < FIRE_RATE) return;
    
    // Update last shot time
    weapon.lastShotTime = now;
    
    // Reduce ammo
    weapon.ammo--;
    
    // Update ammo display
    updateAmmoDisplay();
    
    // Add recoil effect
    addRecoil();
    
    // Perform raycast to check for hits
    performRaycast();
    
    // Create muzzle flash effect
    createMuzzleFlash();
    
    // Play sound effect
    playShootSound();
}

function reload() {
    // Check if already reloading or ammo is full
    if (weapon.isReloading || weapon.ammo >= MAX_AMMO) return;
    if (weapon.reserveAmmo <= 0) return; // No ammo left
    
    // Start reloading
    weapon.isReloading = true;
    weapon.reloadStartTime = Date.now();
    
    // Show reload message
    showReloadMessage();
    
    // Play reload sound
    playReloadSound();
    
    // Set timeout to finish reloading
    setTimeout(() => {
        // Calculate how much ammo to add
        const ammoNeeded = MAX_AMMO - weapon.ammo;
        const ammoToAdd = Math.min(ammoNeeded, weapon.reserveAmmo);
        
        // Add ammo and reduce reserve
        weapon.ammo += ammoToAdd;
        weapon.reserveAmmo -= ammoToAdd;
        
        // Update state
        weapon.isReloading = false;
        
        // Update display
        updateAmmoDisplay();
        hideReloadMessage();
    }, RELOAD_TIME);
}

function updateAmmoDisplay() {
    const ammoCounter = document.getElementById('ammo-counter');
    ammoCounter.textContent = `${weapon.ammo} / ${weapon.reserveAmmo}`;
}

function showReloadMessage() {
    // This would display a reload message if we had one in the UI
}

function hideReloadMessage() {
    // This would hide the reload message
}

function addRecoil() {
    // Add recoil effect to camera
    camera.rotation.x -= RECOIL_AMOUNT;
    
    // Reset recoil after a short delay
    setTimeout(() => {
        camera.rotation.x += RECOIL_AMOUNT / 2;
    }, 50);
    
    setTimeout(() => {
        camera.rotation.x += RECOIL_AMOUNT / 2;
    }, 100);
}

function performRaycast() {
    // Set up raycaster from camera center
    raycaster.setFromCamera(mouse, camera);
    
    // Get objects to test against (e.g., enemies)
    const enemies = scene.children.filter(obj => obj.userData && obj.userData.type === 'enemy');
    
    // Check for hits
    const intersects = raycaster.intersectObjects(enemies);
    
    if (intersects.length > 0) {
        // We hit something!
        const hitObject = intersects[0].object;
        
        // Check if it's an enemy
        if (hitObject.userData && hitObject.userData.type === 'enemy') {
            // Damage the enemy
            const enemy = hitObject.userData.enemy;
            if (typeof enemy.takeDamage === 'function') {
                enemy.takeDamage(weapon.damage);
                
                // Show hit marker
                showHitMarker();
            }
        }
    }
}

function showHitMarker() {
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

function createMuzzleFlash() {
    // In a more advanced version, we could add a particle effect or light
    // For now, we'll just make the weapon briefly glow
    const originalColor = weapon.model.material.color.getHex();
    weapon.model.material.color.set(0xffff00);
    
    setTimeout(() => {
        weapon.model.material.color.set(originalColor);
    }, 50);
}

function playShootSound() {
    // Would play a sound effect here
}

function playReloadSound() {
    // Would play a reload sound effect here
}

export function updateWeapon() {
    // Update reload progress if reloading
    if (weapon.isReloading) {
        const progress = (Date.now() - weapon.reloadStartTime) / RELOAD_TIME;
        // Could update a reload progress bar here
    }
    
    // Position weapon based on movement, etc.
    if (weapon.model) {
        // Make weapon sway slightly for a more natural look
        const time = Date.now() * 0.002;
        const swayX = Math.sin(time) * 0.003;
        const swayY = Math.cos(time * 0.7) * 0.002;
        
        weapon.model.position.x = 0.3 + swayX;
        weapon.model.position.y = -0.2 + swayY;
    }
}

export function addAmmo(amount) {
    weapon.reserveAmmo += amount;
    if (weapon.reserveAmmo > MAX_RESERVE_AMMO) {
        weapon.reserveAmmo = MAX_RESERVE_AMMO;
    }
    updateAmmoDisplay();
} 