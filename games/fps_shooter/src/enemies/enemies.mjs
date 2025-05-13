import * as THREE from 'three';
import { scene, camera, mapObjects } from '../map/sceneSetup.mjs';
import { player, damagePlayer } from '../player/player.mjs';
import { gameState } from '../main.mjs';

// Enemy settings
const ENEMY_HEALTH = 100;
const ENEMY_HEIGHT = 2;
const ENEMY_RADIUS = 0.6;
const ENEMY_DAMAGE = 10;
const ENEMY_ATTACK_RANGE = 2;
const ENEMY_ATTACK_COOLDOWN = 1000; // ms
const ENEMY_SCORE_VALUE = 100;

// Array to store all active enemies
export const enemies = [];

// Enemy types
const enemyTypes = [
    {
        name: 'Basic',
        color: 0xff0000,
        health: ENEMY_HEALTH,
        speed: 0.05,
        damage: ENEMY_DAMAGE,
        attackRange: ENEMY_ATTACK_RANGE
    },
    {
        name: 'Fast',
        color: 0xff6600,
        health: ENEMY_HEALTH * 0.7,
        speed: 0.09,
        damage: ENEMY_DAMAGE * 0.7,
        attackRange: ENEMY_ATTACK_RANGE * 0.9
    },
    {
        name: 'Tank',
        color: 0xcc0000,
        health: ENEMY_HEALTH * 2,
        speed: 0.03,
        damage: ENEMY_DAMAGE * 1.5,
        attackRange: ENEMY_ATTACK_RANGE * 1.2
    }
];

// Pathfinding grid for navigation
let navGrid;

export function createEnemies() {
    // Clear any existing enemies
    enemies.forEach(enemy => {
        scene.remove(enemy.mesh);
    });
    enemies.length = 0;
    
    // Initialize navigation grid
    initNavGrid();
    
    // Spawn initial enemies
    for (let i = 0; i < 5; i++) {
        spawnEnemy();
    }
}

function initNavGrid() {
    // Simple navigation grid for now
    // In a more complex game, we'd use a proper pathfinding algorithm
    navGrid = {
        // For now just using direct paths to player
    };
}

export function spawnEnemy(speedMultiplier = 1) {
    // Choose enemy type based on game progression
    let typeIndex = 0;
    
    if (gameState.wave >= 3) {
        typeIndex = Math.floor(Math.random() * 3); // All types available
    } else if (gameState.wave >= 2) {
        typeIndex = Math.floor(Math.random() * 2); // First two types
    }
    
    const enemyType = enemyTypes[typeIndex];
    
    // Generate spawn position away from player
    const spawnPos = generateSpawnPosition();
    
    // Create enemy geometry
    const enemyGeometry = new THREE.CapsuleGeometry(ENEMY_RADIUS, ENEMY_HEIGHT - ENEMY_RADIUS * 2, 4, 8);
    const enemyMaterial = new THREE.MeshStandardMaterial({ 
        color: enemyType.color,
        roughness: 0.7,
        metalness: 0.3
    });
    
    // Create enemy mesh
    const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemyMesh.position.copy(spawnPos);
    enemyMesh.castShadow = true;
    enemyMesh.receiveShadow = true;
    
    // Add health bar
    const healthBarContainer = createHealthBar();
    enemyMesh.add(healthBarContainer);
    
    // Create enemy object
    const enemy = {
        mesh: enemyMesh,
        type: enemyType.name,
        health: enemyType.health,
        maxHealth: enemyType.health,
        speed: enemyType.speed * speedMultiplier,
        damage: enemyType.damage,
        attackRange: enemyType.attackRange,
        lastAttackTime: 0,
        healthBar: healthBarContainer.children[0],
        isDead: false,
        
        // Method to handle taking damage
        takeDamage: function(amount) {
            this.health -= amount;
            
            // Update health bar
            this.healthBar.scale.x = Math.max(0, this.health / this.maxHealth);
            
            // Check if enemy is dead
            if (this.health <= 0 && !this.isDead) {
                this.isDead = true;
                this.die();
            }
        },
        
        // Method to handle enemy death
        die: function() {
            // Add to score
            gameState.score += ENEMY_SCORE_VALUE;
            gameState.enemiesKilled++;
            
            // Create death effect
            createDeathEffect(this.mesh.position);
            
            // Remove from scene
            scene.remove(this.mesh);
            
            // Remove from enemies array
            const index = enemies.indexOf(this);
            if (index !== -1) {
                enemies.splice(index, 1);
            }
        }
    };
    
    // Set up mesh user data for raycasting
    enemyMesh.userData.type = 'enemy';
    enemyMesh.userData.enemy = enemy;
    
    // Add to scene and enemies array
    scene.add(enemyMesh);
    enemies.push(enemy);
    
    return enemy;
}

function createHealthBar() {
    // Create container
    const container = new THREE.Object3D();
    container.position.y = ENEMY_HEIGHT / 2 + 0.3;
    
    // Create health bar backing
    const backGeometry = new THREE.PlaneGeometry(1, 0.1);
    const backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    container.add(back);
    
    // Create health bar
    const barGeometry = new THREE.PlaneGeometry(1, 0.1);
    const barMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.z = 0.01; // Slightly in front of backing
    container.add(bar);
    
    // Make health bar always face camera
    container.lookAt(camera.position);
    
    return container;
}

function generateSpawnPosition() {
    // Generate a position away from the player
    const minDistance = 20;
    const maxDistance = 40;
    
    let position = new THREE.Vector3();
    
    // Keep trying until we find a valid position
    let validPosition = false;
    let attempts = 0;
    
    while (!validPosition && attempts < 20) {
        attempts++;
        
        // Generate random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        
        // Calculate position
        position.x = Math.sin(angle) * distance;
        position.z = Math.cos(angle) * distance;
        position.y = ENEMY_HEIGHT / 2;
        
        // Check if position is valid (not inside an obstacle)
        validPosition = true;
        
        for (const mapObj of mapObjects) {
            if (mapObj.type === 'floor') continue;
            
            const objBounds = new THREE.Box3().setFromObject(mapObj.mesh);
            const enemyBox = new THREE.Box3().set(
                new THREE.Vector3(
                    position.x - ENEMY_RADIUS,
                    position.y - ENEMY_HEIGHT / 2,
                    position.z - ENEMY_RADIUS
                ),
                new THREE.Vector3(
                    position.x + ENEMY_RADIUS,
                    position.y + ENEMY_HEIGHT / 2,
                    position.z + ENEMY_RADIUS
                )
            );
            
            if (enemyBox.intersectsBox(objBounds)) {
                validPosition = false;
                break;
            }
        }
    }
    
    return position;
}

function createDeathEffect(position) {
    // Create particle effect for enemy death
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 1
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        
        // Add random velocity
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate particles
    let elapsed = 0;
    const animate = function() {
        elapsed += 0.016; // Approximately 60fps
        
        particles.children.forEach(particle => {
            // Move particle based on velocity
            particle.position.add(particle.velocity);
            
            // Apply gravity
            particle.velocity.y -= 0.01;
            
            // Fade out
            particle.material.opacity = 1 - elapsed;
        });
        
        if (elapsed < 1) {
            requestAnimationFrame(animate);
        } else {
            scene.remove(particles);
        }
    };
    
    animate();
}

export function updateEnemies() {
    // Update all enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.isDead) continue;
        
        // Update health bar to face camera
        if (enemy.healthBar) {
            enemy.mesh.children[0].lookAt(camera.position);
        }
        
        // Calculate direction to player
        const dirToPlayer = new THREE.Vector3()
            .copy(player.position)
            .sub(enemy.mesh.position)
            .normalize();
        
        // Check if in attack range
        const distanceToPlayer = enemy.mesh.position.distanceTo(player.position);
        
        if (distanceToPlayer <= enemy.attackRange) {
            // Attack player if cooldown is over
            const now = Date.now();
            if (now - enemy.lastAttackTime > ENEMY_ATTACK_COOLDOWN) {
                attackPlayer(enemy);
                enemy.lastAttackTime = now;
            }
        } else {
            // Move towards player
            const moveAmount = dirToPlayer.multiplyScalar(enemy.speed);
            enemy.mesh.position.add(moveAmount);
            
            // Rotate to face player
            enemy.mesh.lookAt(player.position);
        }
        
        // Collision with obstacles
        handleEnemyCollisions(enemy);
    }
    
    // Spawn more enemies if needed
    if (enemies.length < gameState.maxEnemies && gameState.inProgress) {
        // Check spawn timer handled in main.mjs
    }
}

function attackPlayer(enemy) {
    // Apply damage to player
    damagePlayer(enemy.damage);
}

function handleEnemyCollisions(enemy) {
    // Check collisions with map objects
    for (const mapObj of mapObjects) {
        if (mapObj.type === 'floor') continue;
        
        // Simple collision check
        const objBounds = new THREE.Box3().setFromObject(mapObj.mesh);
        
        // Create enemy bounding box
        const enemyBox = new THREE.Box3().set(
            new THREE.Vector3(
                enemy.mesh.position.x - ENEMY_RADIUS,
                enemy.mesh.position.y - ENEMY_HEIGHT / 2,
                enemy.mesh.position.z - ENEMY_RADIUS
            ),
            new THREE.Vector3(
                enemy.mesh.position.x + ENEMY_RADIUS,
                enemy.mesh.position.y + ENEMY_HEIGHT / 2,
                enemy.mesh.position.z + ENEMY_RADIUS
            )
        );
        
        // Check collision and adjust position
        if (enemyBox.intersectsBox(objBounds)) {
            // Get the intersection depth
            const intersection = getIntersectionDepth(enemyBox, objBounds);
            
            // Resolve the collision by moving the enemy
            if (Math.abs(intersection.x) < Math.abs(intersection.z)) {
                enemy.mesh.position.x += intersection.x;
            } else {
                enemy.mesh.position.z += intersection.z;
            }
        }
    }
    
    // Check collisions with other enemies
    for (const otherEnemy of enemies) {
        if (otherEnemy === enemy || otherEnemy.isDead) continue;
        
        const distance = enemy.mesh.position.distanceTo(otherEnemy.mesh.position);
        
        if (distance < ENEMY_RADIUS * 2) {
            // Calculate direction away from other enemy
            const awayDir = new THREE.Vector3()
                .copy(enemy.mesh.position)
                .sub(otherEnemy.mesh.position)
                .normalize()
                .multiplyScalar((ENEMY_RADIUS * 2 - distance) * 0.5);
            
            // Move both enemies apart slightly
            enemy.mesh.position.add(awayDir);
            otherEnemy.mesh.position.sub(awayDir);
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