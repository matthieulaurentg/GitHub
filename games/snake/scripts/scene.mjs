import { GRID_SIZE } from './main.mjs';

/**
 * Sets up the Three.js scene, camera, and renderer
 * @param {HTMLElement} container - The DOM element to attach the renderer to
 * @returns {Object} The created scene, camera, and renderer
 */
export function setupScene(container) {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
        60, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, GRID_SIZE * 0.8, GRID_SIZE * 1.5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Add lighting
    addLighting(scene);
    
    // Create game board
    createGameBoard(scene);
    
    return { scene, camera, renderer };
}

/**
 * Adds lighting to the scene
 * @param {THREE.Scene} scene - The Three.js scene
 */
function addLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Point light
    const pointLight = new THREE.PointLight(0x00aaff, 0.5, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
}

/**
 * Creates the game board
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createGameBoard(scene) {
    // Create grid floor
    const gridSize = GRID_SIZE;
    const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
    const gridMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        side: THREE.DoubleSide,
        wireframe: false,
        transparent: true,
        opacity: 0.8
    });
    
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = Math.PI / 2;
    grid.position.y = -0.5;
    scene.add(grid);
    
    // Add grid lines
    const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x444444, 0x333333);
    gridHelper.position.y = -0.49;
    scene.add(gridHelper);
    
    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.3,
        emissive: 0x00aaff,
        emissiveIntensity: 0.2
    });
    
    const wallThickness = 0.5;
    const wallHeight = 1;
    const halfGrid = gridSize / 2;
    
    // North wall
    const northWallGeometry = new THREE.BoxGeometry(gridSize + wallThickness, wallHeight, wallThickness);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2 - 0.5, -halfGrid - wallThickness / 2);
    scene.add(northWall);
    
    // South wall
    const southWall = northWall.clone();
    southWall.position.z = halfGrid + wallThickness / 2;
    scene.add(southWall);
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, gridSize + wallThickness);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(halfGrid + wallThickness / 2, wallHeight / 2 - 0.5, 0);
    scene.add(eastWall);
    
    // West wall
    const westWall = eastWall.clone();
    westWall.position.x = -halfGrid - wallThickness / 2;
    scene.add(westWall);
} 