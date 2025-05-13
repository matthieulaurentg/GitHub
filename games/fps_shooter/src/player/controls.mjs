import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camera, scene } from '../map/sceneSetup.mjs';
import { player } from './player.mjs';
import { shoot } from '../weapons/weapon.mjs';
import { gameState } from '../main.mjs';

// Controls variables
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
export let isJumping = false;
let isSprinting = false;
let isReloading = false;

// Direction vector for movement
const direction = new THREE.Vector3();

export function initControls() {
    // Initialize pointer lock controls
    controls = new PointerLockControls(camera, document.body);
    
    // Ensure the controls object is added to the scene
    if (controls.getObject()) {
        scene.add(controls.getObject());
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Lock pointer when game starts
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    startButton.addEventListener('click', lockControls);
    restartButton.addEventListener('click', lockControls);
    
    document.addEventListener('click', () => {
        if (gameState.inProgress && !controls.isLocked) {
            lockControls();
        }
    });
}

function lockControls() {
    controls.lock();
}

function setupEventListeners() {
    // Pointer lock change events
    controls.addEventListener('lock', () => {
        // UI changes when controls are locked
        if (gameState.inProgress) {
            document.getElementById('crosshair').style.display = 'block';
        }
    });
    
    controls.addEventListener('unlock', () => {
        // UI changes when controls are unlocked
        document.getElementById('crosshair').style.display = 'none';
        
        // Reset movement flags
        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;
        isJumping = false;
        isSprinting = false;
    });
    
    // Key down event
    document.addEventListener('keydown', (event) => {
        if (!gameState.inProgress) return;
        
        switch (event.code) {
            // Movement keys
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
                
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
                
            // Jump - disabled for now to prevent falling through map
            case 'Space':
                // isJumping = true;
                break;
                
            // Sprint
            case 'ShiftLeft':
            case 'ShiftRight':
                isSprinting = true;
                player.isSprinting = true;
                break;
                
            // Reload
            case 'KeyR':
                isReloading = true;
                // Trigger reload action from weapon.mjs
                if (typeof reload === 'function') reload();
                break;
                
            // Pause
            case 'Escape':
            case 'KeyP':
                gameState.paused = !gameState.paused;
                break;
        }
    });
    
    // Key up event
    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            // Movement keys
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
                
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
                
            // Jump
            case 'Space':
                isJumping = false;
                break;
                
            // Sprint
            case 'ShiftLeft':
            case 'ShiftRight':
                isSprinting = false;
                player.isSprinting = false;
                break;
                
            // Reload
            case 'KeyR':
                isReloading = false;
                break;
        }
    });
    
    // Mouse events
    document.addEventListener('mousedown', (event) => {
        if (!gameState.inProgress || !controls.isLocked) return;
        
        if (event.button === 0) { // Left mouse button
            shoot();
        }
    });
}

export function getMovementDirection() {
    // Reset direction
    direction.set(0, 0, 0);
    
    // Calculate movement direction based on keys pressed
    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;
    
    // Normalize direction if moving diagonally
    if (direction.length() > 1) {
        direction.normalize();
    }
    
    // Rotate direction to match camera orientation
    const rotation = controls ? controls.getObject().rotation.y : camera.rotation.y;
    const sin = Math.sin(rotation);
    const cos = Math.cos(rotation);
    
    const tempX = direction.x;
    const tempZ = direction.z;
    
    direction.x = tempX * cos - tempZ * sin;
    direction.z = tempX * sin + tempZ * cos;
    
    return direction;
}

export function updateControls() {
    // Update controls if necessary
    if (controls && controls.isLocked) {
        // Any per-frame control updates can go here
    }
} 