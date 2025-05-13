import { GAME_STATE } from '../config/gameConfig.mjs';
import { startGrowth } from '../objects/growthSpot.mjs';

export function setupClickHandler(scene, camera) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        for (const intersect of intersects) {
            const spot = GAME_STATE.growthSpots.find(s => s.mesh === intersect.object);
            if (spot && !spot.growing) {
                startGrowth(scene, spot);
                break;
            }
        }
    }

    window.addEventListener('click', onMouseClick);
    
    return () => {
        window.removeEventListener('click', onMouseClick);
    };
} 