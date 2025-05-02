import { createScene, handleResize } from './scene/sceneSetup.mjs';
import { CameraControls } from './controls/cameraControls.mjs';
import { setupGarden } from './garden/gardenSetup.mjs';
import { setupClickHandler } from './interaction/clickHandler.mjs';
import { updateTeaInventory } from './ui/inventory.mjs';
import { loadGameState } from './config/gameConfig.mjs';

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