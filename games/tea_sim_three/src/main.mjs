import { createScene, handleResize } from './scene/sceneSetup.mjs';
import { CameraControls } from './controls/cameraControls.mjs';
import { setupGarden } from './garden/gardenSetup.mjs';
import { setupClickHandler } from './interaction/clickHandler.mjs';
import { updateTeaInventory } from './ui/inventory.mjs';
import { loadGameState, GAME_STATE } from './config/gameConfig.mjs';

try {
    // Load saved game state
    loadGameState();

    // Initialize scene
    const gameContext = createScene();
    window.gameContext = gameContext; // Store in global context for access
    const { scene, camera, renderer } = gameContext;

    // Setup camera controls
    let controls = null;
    try {
        controls = new CameraControls(camera, renderer.domElement);
    } catch (error) {
        console.error('Error setting up camera controls:', error);
    }

    // Setup garden
    try {
        setupGarden(scene);
    } catch (error) {
        console.error('Error setting up garden:', error);
    }

    // Setup click handler
    let cleanupClickHandler = null;
    try {
        cleanupClickHandler = setupClickHandler(scene, camera);
    } catch (error) {
        console.error('Error setting up click handler:', error);
    }

    // Initialize UI
    try {
        updateTeaInventory();
    } catch (error) {
        console.error('Error updating tea inventory:', error);
    }

    // Setup resize handler
    handleResize();

    // Animation loop
    function animate() {
        try {
            requestAnimationFrame(animate);
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
    
    // Start animation loop
    animate();

    // Hide loading screen when everything is ready
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 1000);
} catch (error) {
    console.error('Fatal error initializing game:', error);
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <h2>Error Loading Game</h2>
            <p>There was a problem loading the game. Please try refreshing the page.</p>
        `;
    }
}

// Add instant grow function to window object
window.instantGrowAll = function() {
    const growingSpots = GAME_STATE.growthSpots.filter(spot => spot.growing);
    growingSpots.forEach(spot => {
        if (spot.instantGrow) spot.instantGrow();
    });
};

// Handle window resize
window.addEventListener('resize', () => handleResize(camera, renderer));

// Cleanup on page unload
window.addEventListener('unload', () => {
    controls.dispose();
    cleanupClickHandler();
}); 