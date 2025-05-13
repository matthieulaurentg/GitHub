import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Store loaded assets
export const assets = {
    textures: {},
    models: {},
    sounds: {},
    fonts: {}
};

// Loaders
const textureLoader = new THREE.TextureLoader();
const modelLoader = new GLTFLoader();
const audioLoader = new THREE.AudioLoader();

// Loading progress tracking
let totalAssets = 0;
let loadedAssets = 0;

// Assets to load
const texturesToLoad = [
    // Example: { name: 'floorTexture', path: 'src/textures/floor.jpg' }
    // Using built-in materials for now
];

const modelsToLoad = [
    // Example: { name: 'weaponModel', path: 'src/models/weapon.glb' }
    // Using built-in geometries for now
];

const soundsToLoad = [
    // Example: { name: 'gunShot', path: 'src/audio/gunshot.mp3' }
    // Will be implemented later
];

// Main loading function
export async function loadAssets(progressCallback) {
    // Skip loading for now since we have no assets to load
    // This prevents the infinite loading issue
    console.log("Skipping asset loading for now");
    
    // Simulate loading completion
    if (progressCallback) {
        progressCallback(0);
        setTimeout(() => {
            progressCallback(0.5);
            setTimeout(() => {
                progressCallback(1);
            }, 300);
        }, 300);
    }
    
    // Return the empty assets object
    return assets;

    /* Original loading code, disabled for now
    // Calculate total assets to load
    totalAssets = texturesToLoad.length + modelsToLoad.length + soundsToLoad.length;
    loadedAssets = 0;
    
    // Update initial loading progress
    if (progressCallback) {
        progressCallback(0);
    }
    
    // Load all asset types in parallel
    const promises = [
        loadTextures(progressCallback),
        loadModels(progressCallback),
        loadSounds(progressCallback)
    ];
    
    // Wait for all assets to load
    await Promise.all(promises);
    
    // Final progress update
    if (progressCallback) {
        progressCallback(1);
    }
    
    return assets;
    */
}

// Helper function to update loading progress
export function updateLoadingProgress(progress) {
    const loadingBar = document.getElementById('loading-progress');
    if (loadingBar) {
        loadingBar.style.width = `${progress * 100}%`;
    }
}

// Load textures
async function loadTextures(progressCallback) {
    const promises = texturesToLoad.map(texture => {
        return new Promise((resolve, reject) => {
            textureLoader.load(
                texture.path,
                // Success callback
                loadedTexture => {
                    assets.textures[texture.name] = loadedTexture;
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve();
                },
                // Progress callback (not used)
                undefined,
                // Error callback
                error => {
                    console.error(`Error loading texture ${texture.path}:`, error);
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve(); // Resolve anyway to continue loading other assets
                }
            );
        });
    });
    
    return Promise.all(promises);
}

// Load models
async function loadModels(progressCallback) {
    const promises = modelsToLoad.map(model => {
        return new Promise((resolve, reject) => {
            modelLoader.load(
                model.path,
                // Success callback
                loadedModel => {
                    assets.models[model.name] = loadedModel;
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve();
                },
                // Progress callback (not used)
                undefined,
                // Error callback
                error => {
                    console.error(`Error loading model ${model.path}:`, error);
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve(); // Resolve anyway to continue loading other assets
                }
            );
        });
    });
    
    return Promise.all(promises);
}

// Load sounds
async function loadSounds(progressCallback) {
    const promises = soundsToLoad.map(sound => {
        return new Promise((resolve, reject) => {
            audioLoader.load(
                sound.path,
                // Success callback
                loadedBuffer => {
                    assets.sounds[sound.name] = loadedBuffer;
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve();
                },
                // Progress callback (not used)
                undefined,
                // Error callback
                error => {
                    console.error(`Error loading sound ${sound.path}:`, error);
                    loadedAssets++;
                    if (progressCallback) {
                        progressCallback(loadedAssets / totalAssets);
                    }
                    resolve(); // Resolve anyway to continue loading other assets
                }
            );
        });
    });
    
    return Promise.all(promises);
}

// Function to get an asset
export function getAsset(type, name) {
    if (!assets[type] || !assets[type][name]) {
        console.warn(`Asset ${name} of type ${type} not found!`);
        return null;
    }
    return assets[type][name];
}

// Fast-forward loading for development or when no assets are needed
export function skipLoading() {
    // Skip actual loading, just simulate completion
    updateLoadingProgress(1);
    return assets;
} 