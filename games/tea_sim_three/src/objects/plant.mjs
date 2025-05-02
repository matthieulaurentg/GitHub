import { GAME_STATE, TEA_CONFIG } from '../config/gameConfig.mjs';
import { createGrowthSpot } from './growthSpot.mjs';

export function createPlant(scene, x, z) {
    // Create pot
    const potGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
    const potMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
    });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.set(x, 0.4, z);
    pot.castShadow = true;
    pot.receiveShadow = true;
    scene.add(pot);

    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.6
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(x, 1.8, z);
    stem.castShadow = true;
    stem.receiveShadow = true;
    scene.add(stem);

    // Create growth spots
    for (let i = 0; i < 3; i++) {
        const angle = ((i - 1) * Math.PI / 4);
        const spotX = x + Math.cos(angle) * 0.4;
        const spotZ = z + Math.sin(angle) * 0.4;
        const spotY = 1.2 + i * 0.6;

        const spot = createGrowthSpot(scene, spotX, spotY, spotZ);
        GAME_STATE.growthSpots.push(spot);
    }
} 