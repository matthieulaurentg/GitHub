import { createScene, handleResize } from './scene/sceneSetup.mjs';
import { CameraControls } from './controls/cameraControls.mjs';
import { setupGarden } from './garden/gardenSetup.mjs';
import { setupClickHandler } from './interaction/clickHandler.mjs';
import { updateTeaInventory } from './ui/inventory.mjs';
import { loadGameState, GAME_STATE } from './config/gameConfig.mjs';

// Load saved game state
loadGameState();

// Initialize scene
const { scene, camera, renderer } = createScene();

// Setup camera controls
const controls = new CameraControls(camera, renderer.domElement);

// Setup garden
setupGarden(scene);

// Setup click handler
const cleanupClickHandler = setupClickHandler(scene, camera);

// Initialize UI
updateTeaInventory();

// Add instant grow function to window object
window.instantGrowAll = function() {
    const growingSpots = GAME_STATE.growthSpots.filter(spot => spot.growing);
    growingSpots.forEach(spot => {
        if (spot.instantGrow) spot.instantGrow();
    });
};

// Handle window resize
window.addEventListener('resize', () => handleResize(camera, renderer));

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Cleanup on page unload
window.addEventListener('unload', () => {
    controls.dispose();
    cleanupClickHandler();
}); 