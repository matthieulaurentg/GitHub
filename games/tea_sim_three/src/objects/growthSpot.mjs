import { TEA_CONFIG, GAME_STATE, saveGameState, getGrowthMultiplier, getSpecialChanceBonus, getMultiGrowChance } from '../config/gameConfig.mjs';
import { showFloatingText } from '../ui/floatingText.mjs';
import { updateTeaInventory } from '../ui/inventory.mjs';

export function createGrowthSpot(scene, x, y, z) {
    const spot = {
        position: new THREE.Vector3(x, y, z),
        growing: false,
        growthProgress: 0,
        mesh: null,
        instantGrow: null // Will be set in startGrowth
    };

    // Create visual indicator for growth spot
    const spotGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const spotMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        transparent: true,
        opacity: 0.3,
        roughness: 0.3,
        metalness: 0.5
    });
    const spotMesh = new THREE.Mesh(spotGeometry, spotMaterial);
    spotMesh.position.copy(spot.position);
    spotMesh.castShadow = true;
    spotMesh.receiveShadow = true;
    scene.add(spotMesh);
    spot.mesh = spotMesh;

    return spot;
}

function getRandomSpecialLeaf() {
    const specialChanceBonus = getSpecialChanceBonus();
    const rand = Math.random();
    for (const [type, config] of Object.entries(TEA_CONFIG.specialLeaves)) {
        if (rand < (config.chance + specialChanceBonus)) {
            return { type, config };
        }
    }
    return null;
}

export function startGrowth(scene, spot) {
    if (spot.growing) return;
    spot.growing = true;

    // Determine if this will be a special leaf
    const specialLeaf = getRandomSpecialLeaf();
    const leafConfig = specialLeaf ? specialLeaf.config : TEA_CONFIG.growthStages.bud;

    // Create leaf mesh
    const leafGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: leafConfig.color,
        emissive: specialLeaf ? leafConfig.color : 0x000000,
        emissiveIntensity: specialLeaf ? 0.5 : 0,
        roughness: 0.6,
        metalness: specialLeaf ? 0.3 : 0
    });
    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
    leafMesh.position.copy(spot.position);
    leafMesh.scale.set(0, 0, 0);
    leafMesh.castShadow = true;
    leafMesh.receiveShadow = true;
    scene.add(leafMesh);

    const startTime = Date.now();
    let completed = false;

    function completeGrowth() {
        if (completed) return;
        completed = true;

        if (specialLeaf) {
            GAME_STATE.specialLeaves[specialLeaf.type]++;
            showFloatingText(scene, `${leafConfig.emoji} Special!`, spot.position);
        } else {
            const teaGenerated = Math.floor(Math.random() * 3 + 1);
            GAME_STATE.teaLeaves += teaGenerated;
            showFloatingText(scene, `+${teaGenerated} 🍵`, spot.position);

            // Check for multi-grow from birdhouse
            const multiGrowChance = getMultiGrowChance();
            if (Math.random() < multiGrowChance) {
                setTimeout(() => {
                    showFloatingText(scene, "🐦 Extra Growth!", spot.position);
                    startGrowth(scene, spot);
                }, 500);
            }
        }
        
        updateTeaInventory();
        saveGameState();

        // Reset spot after a delay
        setTimeout(() => {
            scene.remove(leafMesh);
            spot.growing = false;
        }, 2000);
    }
    
    function growLeaf() {
        if (completed) return;
        
        const elapsed = Date.now() - startTime;
        const speedMultiplier = getGrowthMultiplier();
        const progress = Math.min(elapsed / (TEA_CONFIG.growthTime / speedMultiplier), 1);
        
        // Update leaf appearance based on growth stage
        let stage;
        if (!specialLeaf) {
            if (progress < 0.33) {
                stage = TEA_CONFIG.growthStages.bud;
            } else if (progress < 0.66) {
                stage = TEA_CONFIG.growthStages.young;
            } else {
                stage = TEA_CONFIG.growthStages.mature;
            }
            leafMesh.material.color.setHex(stage.color);
            const scale = stage.scale * Math.min(progress * 1.5, 1);
            leafMesh.scale.set(scale, scale, scale);
        } else {
            const scale = leafConfig.scale * Math.min(progress * 1.5, 1);
            leafMesh.scale.set(scale, scale, scale);
            // Add sparkle effect for special leaves
            leafMesh.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 0.01) * 0.2;
        }

        if (progress < 1) {
            requestAnimationFrame(growLeaf);
        } else {
            completeGrowth();
        }
    }

    // Set up instant grow function
    spot.instantGrow = () => {
        completeGrowth();
    };

    growLeaf();
} 