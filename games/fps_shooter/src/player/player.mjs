import * as THREE from 'three';
import { scene, camera, mapObjects } from '../map/sceneSetup.mjs';
import { getMovementDirection, isJumping } from './controls.mjs';

// Player settings
const PLAYER_HEIGHT = 2;
const PLAYER_RADIUS = 0.5;
const PLAYER_SPEED = 0.15;
const PLAYER_SPRINT_MODIFIER = 1.8;
const PLAYER_JUMP_FORCE = 0.3;
const GRAVITY = 0.01;
const MAX_FALL_SPEED = 0.5;

// Player object
export const player = {
    height: PLAYER_HEIGHT,
    radius: PLAYER_RADIUS,
    speed: PLAYER_SPEED,
    position: new THREE.Vector3(0, PLAYER_HEIGHT / 2, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    onGround: true,
    isSprinting: false,
    health: 100,
    maxHealth: 100,
    lastDamageTime: 0,
    isInvulnerable: false,
    invulnerabilityTime: 1000, // ms
    footstepSoundTime: 0,
    footstepSoundInterval: 400 // ms
};

// Collision detection
const raycaster = new THREE.Raycaster();
const downDirection = new THREE.Vector3(0, -1, 0);

// Temporary vectors for calculations
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();

export function createPlayer() {
    // Player is handled through the camera, no visual representation
    // However we could add a mesh for shadow casting if desired
    
    // Reset player position
    player.position.set(0, PLAYER_HEIGHT / 2, 0);
    camera.position.copy(player.position);
    
    // Initialize movement and physics
    player.velocity.set(0, 0, 0);
    player.onGround = false;
    player.health = player.maxHealth;
}

export function updatePlayer() {
    // Apply movement based on keys and controls
    applyMovement();
    
    // Apply physics
    applyPhysics();
    
    // Check collisions with environment
    handleCollisions();
    
    // Update camera to follow player
    camera.position.copy(player.position);
    
    // Handle player health and invulnerability
    if (player.isInvulnerable && Date.now() - player.lastDamageTime > player.invulnerabilityTime) {
        player.isInvulnerable = false;
    }
    
    // Play footstep sounds
    updateFootstepSounds();
}

function applyMovement() {
    // Get movement direction from controls
    const dir = getMovementDirection();
    
    // Calculate movement speed based on sprinting
    const currentSpeed = player.isSprinting ? player.speed * PLAYER_SPRINT_MODIFIER : player.speed;
    
    // Apply movement to velocity
    player.velocity.x = dir.x * currentSpeed;
    player.velocity.z = dir.z * currentSpeed;
    
    // Handle jumping
    if (isJumping && player.onGround) {
        player.velocity.y = PLAYER_JUMP_FORCE;
        player.onGround = false;
    }
}

function applyPhysics() {
    // Apply gravity if not on ground
    if (!player.onGround) {
        player.velocity.y -= GRAVITY;
        
        // Limit fall speed
        if (player.velocity.y < -MAX_FALL_SPEED) {
            player.velocity.y = -MAX_FALL_SPEED;
        }
    } else if (player.velocity.y < 0) {
        player.velocity.y = 0;
    }
    
    // Apply velocity to position
    player.position.add(player.velocity);
}

function handleCollisions() {
    // Check floor collision with raycaster
    raycaster.set(
        tempVec.copy(player.position).add(tempVec2.set(0, player.height / 2, 0)),
        downDirection
    );
    
    const intersects = raycaster.intersectObjects(mapObjects.map(obj => obj.mesh));
    
    // Check if we're on the ground
    if (intersects.length > 0 && intersects[0].distance < player.height / 2 + 0.1) {
        player.onGround = true;
        player.position.y = intersects[0].point.y + player.height / 2;
    } else {
        player.onGround = false;
    }
    
    // Wall and obstacle collisions
    for (const mapObj of mapObjects) {
        if (mapObj.type === 'floor') continue;
        
        // Simple collision check with obstacles and walls
        const objBounds = new THREE.Box3().setFromObject(mapObj.mesh);
        
        // Create player bounding box
        const playerBox = new THREE.Box3().set(
            new THREE.Vector3(
                player.position.x - player.radius,
                player.position.y - player.height / 2,
                player.position.z - player.radius
            ),
            new THREE.Vector3(
                player.position.x + player.radius,
                player.position.y + player.height / 2,
                player.position.z + player.radius
            )
        );
        
        // Check collision and adjust position
        if (playerBox.intersectsBox(objBounds)) {
            // Get the intersection depth
            const intersection = getIntersectionDepth(playerBox, objBounds);
            
            // Resolve the collision by moving the player
            if (Math.abs(intersection.x) < Math.abs(intersection.z)) {
                player.position.x += intersection.x;
            } else {
                player.position.z += intersection.z;
            }
        }
    }
}

function getIntersectionDepth(boxA, boxB) {
    // Calculate the distance between centers
    const distX = (boxA.min.x + boxA.max.x) / 2 - (boxB.min.x + boxB.max.x) / 2;
    const distZ = (boxA.min.z + boxA.max.z) / 2 - (boxB.min.z + boxB.max.z) / 2;
    
    // Calculate the intersection depths
    const depthX = (boxA.max.x - boxA.min.x) / 2 + (boxB.max.x - boxB.min.x) / 2 - Math.abs(distX);
    const depthZ = (boxA.max.z - boxA.min.z) / 2 + (boxB.max.z - boxB.min.z) / 2 - Math.abs(distZ);
    
    // Return the minimum translation vector to resolve the collision
    return {
        x: depthX * (distX > 0 ? 1 : -1),
        z: depthZ * (distZ > 0 ? 1 : -1)
    };
}

export function damagePlayer(amount) {
    // Skip if player is currently invulnerable
    if (player.isInvulnerable) return;
    
    // Apply damage
    player.health -= amount;
    
    // Make player temporarily invulnerable
    player.isInvulnerable = true;
    player.lastDamageTime = Date.now();
    
    // Show damage effect
    document.getElementById('damage-overlay').style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    setTimeout(() => {
        document.getElementById('damage-overlay').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    }, 300);
    
    // Clamp health to valid range
    if (player.health < 0) player.health = 0;
    if (player.health > player.maxHealth) player.health = player.maxHealth;
}

export function healPlayer(amount) {
    player.health += amount;
    if (player.health > player.maxHealth) player.health = player.maxHealth;
}

function updateFootstepSounds() {
    // Play footstep sounds when moving on ground
    if (player.onGround && (player.velocity.x !== 0 || player.velocity.z !== 0)) {
        const now = Date.now();
        
        // Adjust interval based on sprinting
        const interval = player.isSprinting ? player.footstepSoundInterval / 1.5 : player.footstepSoundInterval;
        
        if (now - player.footstepSoundTime > interval) {
            // Would play footstep sound here
            player.footstepSoundTime = now;
        }
    }
} 