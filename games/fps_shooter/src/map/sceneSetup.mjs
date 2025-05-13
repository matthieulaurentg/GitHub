import * as THREE from 'three';
import { assets } from '../utils/assetLoader.mjs';

// Scene components
export let scene;
export let camera;
export let renderer;
export let floor;
export let walls = [];
export let lights = [];
export let skybox;

// Environment settings
const FLOOR_SIZE = 100;
const WALL_HEIGHT = 5;
const FOG_COLOR = 0x222222;
const FOG_NEAR = 20;
const FOG_FAR = 60;

// Map objects for collisions
export const mapObjects = [];

export function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Create environment
    createSkybox();
    createFloor();
    createWalls();
    createLights();
    createObstacles();
}

function createSkybox() {
    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skyboxMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.BackSide })
    ];
    
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);
}

function createFloor() {
    // Create floor geometry and material
    const floorGeometry = new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE, 10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create floor mesh
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Add floor to map objects for collision detection
    mapObjects.push({
        mesh: floor,
        type: 'floor'
    });
}

function createWalls() {
    // Wall material
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.7,
        metalness: 0.2
    });
    
    // Create walls around the floor
    const wallGeometry = new THREE.BoxGeometry(FLOOR_SIZE, WALL_HEIGHT, 1);
    
    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, WALL_HEIGHT / 2, -FLOOR_SIZE / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    scene.add(northWall);
    walls.push(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, WALL_HEIGHT / 2, FLOOR_SIZE / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    scene.add(southWall);
    walls.push(southWall);
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(1, WALL_HEIGHT, FLOOR_SIZE);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(FLOOR_SIZE / 2, WALL_HEIGHT / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    scene.add(eastWall);
    walls.push(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    westWall.position.set(-FLOOR_SIZE / 2, WALL_HEIGHT / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    scene.add(westWall);
    walls.push(westWall);
    
    // Add walls to map objects for collision detection
    walls.forEach(wall => {
        mapObjects.push({
            mesh: wall,
            type: 'wall'
        });
    });
}

function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    scene.add(ambientLight);
    lights.push(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    lights.push(directionalLight);
    
    // Point lights around the scene
    const pointLight1 = new THREE.PointLight(0xff0000, 0.5, 20);
    pointLight1.position.set(10, 3, 10);
    pointLight1.castShadow = true;
    scene.add(pointLight1);
    lights.push(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x0000ff, 0.5, 20);
    pointLight2.position.set(-10, 3, -10);
    pointLight2.castShadow = true;
    scene.add(pointLight2);
    lights.push(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x00ff00, 0.5, 20);
    pointLight3.position.set(-10, 3, 10);
    pointLight3.castShadow = true;
    scene.add(pointLight3);
    lights.push(pointLight3);
    
    const pointLight4 = new THREE.PointLight(0xffff00, 0.5, 20);
    pointLight4.position.set(10, 3, -10);
    pointLight4.castShadow = true;
    scene.add(pointLight4);
    lights.push(pointLight4);
}

function createObstacles() {
    // Create some obstacles for the player to navigate around
    const boxGeometry = new THREE.BoxGeometry(2, 3, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x887766,
        roughness: 0.5,
        metalness: 0.3
    });
    
    // Place boxes around the scene
    const boxPositions = [
        { x: 10, z: 10 },
        { x: -10, z: -10 },
        { x: 10, z: -10 },
        { x: -10, z: 10 },
        { x: 0, z: 15 },
        { x: 15, z: 0 },
        { x: -15, z: 0 },
        { x: 0, z: -15 },
        { x: 5, z: -20 },
        { x: -20, z: 5 }
    ];
    
    boxPositions.forEach(pos => {
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(pos.x, 1.5, pos.z);
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
        
        // Add to map objects for collision detection
        mapObjects.push({
            mesh: box,
            type: 'obstacle'
        });
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function updateScene() {
    // Animate lights
    const time = Date.now() * 0.001;
    
    if (lights.length >= 5) { // Skip ambient and directional lights
        lights[2].position.y = 3 + Math.sin(time) * 0.5;
        lights[3].position.y = 3 + Math.sin(time + 1) * 0.5;
        lights[4].position.y = 3 + Math.sin(time + 2) * 0.5;
        lights[5].position.y = 3 + Math.sin(time + 3) * 0.5;
    }
} 