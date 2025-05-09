                       import { TEA_CONFIG, GAME_STATE } from '../config/gameConfig.mjs';
import { createPlant } from '../objects/plant.mjs';
import { createMagicalTree } from '../objects/tree.mjs';

function createAntHill(scene, x, z) {
    const geometry = new THREE.ConeGeometry(0.3, 0.4, 8);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 1
    });
    const antHill = new THREE.Mesh(geometry, material);
    antHill.position.set(x, 0.2, z);
    antHill.castShadow = true;
    antHill.receiveShadow = true;
    scene.add(antHill);

    // Add some ants
    for (let i = 0; i < 3; i++) {
        const antGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const antMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const ant = new THREE.Mesh(antGeometry, antMaterial);
        const angle = (i / 3) * Math.PI * 2;
        ant.position.set(
            x + Math.cos(angle) * 0.4,
            0.05,
            z + Math.sin(angle) * 0.4
        );
        ant.castShadow = true;
        scene.add(ant);
    }
}

function createPond(scene, x, z) {
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x4444ff,
        transparent: true,
        opacity: 0.7
    });
    const pond = new THREE.Mesh(geometry, material);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(x, 0.01, z);
    pond.receiveShadow = true;
    scene.add(pond);

    // Add lily pads
    for (let i = 0; i < 3; i++) {
        const padGeometry = new THREE.CircleGeometry(0.2, 8);
        const padMaterial = new THREE.MeshStandardMaterial({ color: 0x00AA00 });
        const lilyPad = new THREE.Mesh(padGeometry, padMaterial);
        lilyPad.rotation.x = -Math.PI / 2;
        const angle = (i / 3) * Math.PI * 2;
        const radius = 0.5;
        lilyPad.position.set(
            x + Math.cos(angle) * radius,
            0.02,
            z + Math.sin(angle) * radius
        );
        lilyPad.receiveShadow = true;
        scene.add(lilyPad);
    }
}

function createBirdhouse(scene, x, z) {
    // House base
    const baseGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, 1.8, z);
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(0.3, 0.3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, 2.1, z);
    roof.castShadow = true;
    roof.receiveShadow = true;
    scene.add(roof);

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x, 1, z);
    pole.castShadow = true;
    pole.receiveShadow = true;
    scene.add(pole);
}

export function setupGarden(scene) {
    const { width, spacing } = TEA_CONFIG.plotSize;
    
    // Create ground area
    const groundGeometry = new THREE.PlaneGeometry(width * 3, width * 2);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x90A955,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create magical tree in the center
    createMagicalTree(scene, new THREE.Vector3(0, 0, 0));

    // Create plants in a grid, avoiding the center
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const x = (col - 1) * spacing;
            const z = (row - 0.5) * spacing;
            
            // Skip the center position where the tree is
            if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;
            
            createPlant(scene, x, z);
        }
    }

    // Add ant hills based on upgrade level
    for (let i = 0; i < GAME_STATE.upgrades.antHill; i++) {
        const angle = (i / GAME_STATE.upgrades.antHill) * Math.PI * 2;
        const radius = 4;
        createAntHill(scene, 
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
    }

    // Add ponds based on upgrade level
    for (let i = 0; i < GAME_STATE.upgrades.pond; i++) {
        const angle = (i / GAME_STATE.upgrades.pond) * Math.PI * 2 + Math.PI/3;
        const radius = 5;
        createPond(scene,
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
    }

    // Add birdhouses based on upgrade level
    for (let i = 0; i < GAME_STATE.upgrades.birdhouse; i++) {
        const angle = (i / GAME_STATE.upgrades.birdhouse) * Math.PI * 2 + Math.PI*2/3;
        const radius = 4.5;
        createBirdhouse(scene,
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
    }
} 