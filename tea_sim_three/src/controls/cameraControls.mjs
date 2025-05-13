export class CameraControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.target = new THREE.Vector3(0, 0, 0);
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };

        // Adjust rotation speed
        const rotationSpeed = 0.005;

        // Rotate camera around target
        const theta = -deltaMove.x * rotationSpeed;
        const phi = -deltaMove.y * rotationSpeed;

        const position = new THREE.Vector3().copy(this.camera.position).sub(this.target);
        
        // Rotate horizontally
        position.applyAxisAngle(new THREE.Vector3(0, 1, 0), theta);
        
        // Rotate vertically
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        position.applyAxisAngle(rightVector, phi);

        this.camera.position.copy(position.add(this.target));
        this.camera.lookAt(this.target);

        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseWheel(event) {
        event.preventDefault();

        const zoomSpeed = 0.1;
        const direction = new THREE.Vector3().subVectors(this.camera.position, this.target).normalize();
        const distance = this.camera.position.distanceTo(this.target);

        // Zoom in/out
        const delta = -Math.sign(event.deltaY) * zoomSpeed * distance;
        const newDistance = Math.max(5, Math.min(30, distance - delta));
        
        this.camera.position.copy(direction.multiplyScalar(newDistance).add(this.target));
    }

    dispose() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('wheel', this.onMouseWheel);
    }
} 