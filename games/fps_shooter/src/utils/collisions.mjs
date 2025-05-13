import * as THREE from 'three';
import { scene, mapObjects } from '../map/sceneSetup.mjs';
import { player } from '../player/player.mjs';
import { enemies } from '../enemies/enemies.mjs';
import { gameState } from '../main.mjs';

// Raycaster for precise collision detection
const raycaster = new THREE.Raycaster();

// Temporary vectors for calculations
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();

export function handleCollisions() {
    // Player-environment collisions are handled in player.mjs
    
    // Player-enemy collisions
    checkPlayerEnemyCollisions();
    
    // Projectile-environment collisions would be here if we had projectile physics
    
    // Check for out of bounds
    checkOutOfBounds();
}

function checkPlayerEnemyCollisions() {
    // Simple collision check between player and enemies
    const playerRadius = player.radius;
    
    for (const enemy of enemies) {
        if (enemy.isDead) continue;
        
        // Distance between player and enemy
        const distance = player.position.distanceTo(enemy.mesh.position);
        
        // Simple sphere collision check
        if (distance < playerRadius + enemy.mesh.geometry.parameters.radius) {
            // Push player away from enemy to prevent getting stuck
            const pushDir = new THREE.Vector3()
                .copy(player.position)
                .sub(enemy.mesh.position)
                .normalize()
                .multiplyScalar(0.1);
            
            player.position.add(pushDir);
        }
    }
}

function checkOutOfBounds() {
    // Check if player is out of bounds and reset if necessary
    const boundarySize = 50; // Half the floor size
    
    if (Math.abs(player.position.x) > boundarySize || 
        Math.abs(player.position.z) > boundarySize) {
        // Reset player position to center
        player.position.set(0, player.height / 2, 0);
        
        // Optional: Damage player for falling out of bounds
        // damagePlayer(10);
    }
    
    // Check for enemies out of bounds
    for (const enemy of enemies) {
        if (enemy.isDead) continue;
        
        if (Math.abs(enemy.mesh.position.x) > boundarySize || 
            Math.abs(enemy.mesh.position.z) > boundarySize) {
            // Reset enemy position to a valid spawn point
            const spawnPos = generateRandomPosition(20, 30);
            enemy.mesh.position.copy(spawnPos);
        }
    }
}

function generateRandomPosition(minDist, maxDist) {
    // Generate a random position a certain distance from the origin
    const angle = Math.random() * Math.PI * 2;
    const distance = minDist + Math.random() * (maxDist - minDist);
    
    return new THREE.Vector3(
        Math.sin(angle) * distance,
        1, // Slightly above ground
        Math.cos(angle) * distance
    );
}

export function checkRayCollision(origin, direction, maxDistance = 100) {
    // Set up raycaster
    raycaster.set(origin, direction.normalize());
    
    // Get objects to test against (environment and enemies)
    const collisionObjects = [
        ...mapObjects.map(obj => obj.mesh),
        ...enemies.map(enemy => enemy.mesh)
    ];
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(collisionObjects, false);
    
    // Return closest intersection if any
    if (intersects.length > 0 && intersects[0].distance <= maxDistance) {
        return {
            point: intersects[0].point,
            object: intersects[0].object,
            distance: intersects[0].distance
        };
    }
    
    // No collision within range
    return null;
}

export function isPointVisible(fromPosition, toPosition, ignoreObjects = []) {
    // Direction from fromPosition to toPosition
    const direction = new THREE.Vector3().subVectors(toPosition, fromPosition).normalize();
    
    // Set up raycaster
    raycaster.set(fromPosition, direction);
    
    // Distance to check
    const distance = fromPosition.distanceTo(toPosition);
    
    // Get objects to test against, excluding the ignored objects
    const collisionObjects = mapObjects
        .map(obj => obj.mesh)
        .filter(mesh => !ignoreObjects.includes(mesh));
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(collisionObjects, false);
    
    // If no intersections or the first intersection is further than the target, the point is visible
    return intersects.length === 0 || intersects[0].distance > distance;
} 