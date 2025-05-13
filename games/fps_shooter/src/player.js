/**
 * Player class for managing player state, movement, and controls
 */
export class Player {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        // Player properties
        this.health = 100;
        this.moveSpeed = 5;
        this.jumpForce = 10;
        this.gravity = 30;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.isOnGround = true;
        
        // Set initial position
        this.position = this.camera.position;
    }
    
    /**
     * Update player position and state based on input
     * @param {number} delta - Time in seconds since last frame
     */
    update(delta) {
        // Handle movement
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        // Update direction based on camera rotation
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Move player based on direction
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.moveSpeed;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.moveSpeed;
        }
        
        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y -= this.gravity * delta;
        }
        
        // Move camera
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
        
        // Update player position
        this.position.y += this.velocity.y * delta;
        
        // Check for ground collision
        if (this.position.y < 1.6) {
            this.position.y = 1.6;
            this.velocity.y = 0;
            this.isOnGround = true;
        }
    }
    
    /**
     * Make the player jump
     */
    jump() {
        if (this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
        }
    }
    
    /**
     * Apply damage to the player
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
} 