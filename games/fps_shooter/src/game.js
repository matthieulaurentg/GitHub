// Import necessary modules
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Weapon } from './weapon.js';
import { Level } from './level.js';
import { AI } from './ai.js';

// Game class to manage the entire game
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = null;
        this.enemies = [];
        this.level = null;
        this.weapon = null;
        this.ai = null;
        this.score = 0;
        
        this.lastTime = 0;
        this.enemySpawnInterval = 5000; // 5 seconds
        this.lastEnemySpawn = 0;
        this.maxEnemies = 10;
        
        this.gameStarted = false;
        this.gameOver = false;
        
        // UI elements
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.scoreCounter = document.getElementById('score-counter');
        this.finalScore = document.getElementById('final-score');
        this.healthBar = document.getElementById('health-fill');
        this.ammoCounter = document.getElementById('ammo-counter');
        this.reloadMessage = document.getElementById('reload-message');
        this.hitMarker = document.getElementById('hit-marker');
        this.damageOverlay = document.getElementById('damage-overlay');
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0);
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Bind methods to maintain proper 'this' context
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 1.6; // Eye height
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Create pointer lock controls
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        
        // Create player
        this.player = new Player(this.camera, this.controls);
        
        // Create level
        this.level = new Level(this.scene);
        
        // Create weapon
        this.weapon = new Weapon(this.scene, this.camera);
        
        // Create AI controller
        this.ai = new AI(this.scene, this.player);
        
        // Setup lighting
        this.setupLighting();
        
        // Add window event listeners
        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        
        // Start render loop
        this.render();
    }
    
    setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Optimize shadow quality
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    startGame() {
        this.startScreen.style.display = 'none';
        this.controls.lock();
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.updateScoreUI();
        
        // Reset player
        this.player.health = 100;
        this.player.position.set(0, 1.6, 0);
        this.updateHealthUI();
        
        // Reset weapon
        this.weapon.ammo = 30;
        this.weapon.maxAmmo = 30;
        this.weapon.reloading = false;
        this.updateAmmoUI();
        
        // Clear enemies
        for (const enemy of this.enemies) {
            this.scene.remove(enemy.mesh);
        }
        this.enemies = [];
        
        // Spawn initial enemies
        this.spawnEnemy();
        this.spawnEnemy();
    }
    
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startGame();
    }
    
    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        this.controls.unlock();
        this.finalScore.textContent = `Score: ${this.score}`;
        this.gameOverScreen.style.display = 'flex';
    }
    
    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        // Spawn at random position away from player
        let x, z;
        do {
            x = (Math.random() - 0.5) * 50;
            z = (Math.random() - 0.5) * 50;
        } while (Math.sqrt(x * x + z * z) < 10); // At least 10 units away from player
        
        const enemy = new Enemy(this.scene, x, z, this.ai);
        this.enemies.push(enemy);
    }
    
    updateScoreUI() {
        this.scoreCounter.textContent = `Score: ${this.score}`;
    }
    
    updateHealthUI() {
        this.healthBar.style.width = `${this.player.health}%`;
    }
    
    updateAmmoUI() {
        this.ammoCounter.textContent = `${this.weapon.ammo} / ${this.weapon.maxAmmo}`;
        
        if (this.weapon.ammo === 0 && !this.weapon.reloading) {
            this.reloadMessage.style.opacity = 1;
        } else {
            this.reloadMessage.style.opacity = 0;
        }
    }
    
    showHitMarker() {
        this.hitMarker.style.opacity = 1;
        setTimeout(() => {
            this.hitMarker.style.opacity = 0;
        }, 150);
    }
    
    showDamageOverlay() {
        this.damageOverlay.style.opacity = 0.7;
        setTimeout(() => {
            this.damageOverlay.style.opacity = 0;
        }, 300);
    }
    
    update(time) {
        const delta = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        if (!this.gameStarted || this.gameOver) return;
        
        // Update player
        this.player.update(delta);
        
        // Update weapon
        this.weapon.update(delta);
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);
            
            // Check if enemy is dead
            if (enemy.health <= 0) {
                this.scene.remove(enemy.mesh);
                if (enemy.healthBar) {
                    document.body.removeChild(enemy.healthBar);
                }
                this.enemies.splice(i, 1);
                this.score += 100;
                this.updateScoreUI();
            }
            
            // Check if enemy hit player
            if (enemy.canAttack && 
                enemy.position.distanceTo(this.player.position) < 2) {
                enemy.attack();
                this.player.takeDamage(10);
                this.updateHealthUI();
                this.showDamageOverlay();
                
                // Check if player is dead
                if (this.player.health <= 0) {
                    this.endGame();
                }
            }
        }
        
        // Spawn enemies
        if (time - this.lastEnemySpawn > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = time;
            
            // Make game harder as score increases
            this.enemySpawnInterval = Math.max(1000, 5000 - (this.score / 1000) * 500);
        }
        
        // Update AI
        this.ai.update(delta, this.enemies);
    }
    
    render(time) {
        requestAnimationFrame(this.render);
        
        this.update(time);
        this.renderer.render(this.scene, this.camera);
    }
    
    shoot() {
        if (!this.gameStarted || this.gameOver || this.weapon.reloading || this.weapon.ammo <= 0) return;
        
        this.weapon.shoot();
        this.updateAmmoUI();
        
        // Ray casting for hit detection
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        let hit = false;
        
        for (const intersect of intersects) {
            const object = intersect.object;
            
            // Check if we hit an enemy
            for (const enemy of this.enemies) {
                if (object === enemy.mesh) {
                    enemy.takeDamage(25);
                    hit = true;
                    this.showHitMarker();
                    break;
                }
            }
            
            if (hit) break;
        }
    }
    
    reload() {
        if (!this.gameStarted || this.gameOver || this.weapon.reloading || this.weapon.ammo === this.weapon.maxAmmo) return;
        
        this.weapon.reload();
        this.updateAmmoUI();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        // Track mouse position for raycasting
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onMouseDown(event) {
        // Handle mouse clicks for shooting
        if (!this.gameStarted) {
            this.controls.lock();
            return;
        }
        
        if (event.button === 0) { // Left mouse button
            this.shoot();
        }
    }
    
    onKeyDown(event) {
        // Handle key presses
        if (!this.gameStarted || this.gameOver) return;
        
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.player.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.player.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.player.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.player.moveRight = true;
                break;
            case 'Space':
                this.player.jump();
                break;
            case 'KeyR':
                this.reload();
                break;
        }
    }
    
    onKeyUp(event) {
        // Handle key releases
        if (!this.gameStarted || this.gameOver) return;
        
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.player.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.player.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.player.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.player.moveRight = false;
                break;
        }
    }
}

// Add controls lock/unlock handlers
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === null && game.gameStarted && !game.gameOver) {
        // Game is paused
        // Could add a pause menu here
    }
});

// Create game instance
const game = new Game(); 