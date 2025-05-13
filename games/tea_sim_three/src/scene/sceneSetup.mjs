import { isWebGLAvailable, getWebGLErrorMessage } from '../webGLCheck.mjs';

export function createScene() {
    // Check if WebGL is available
    if (!isWebGLAvailable()) {
        const warning = getWebGLErrorMessage();
        document.getElementById('game-container').appendChild(warning);
        // Return a minimal scene object to prevent errors
        return {
            scene: new THREE.Scene(),
            camera: { position: { set: () => {} }, lookAt: () => {} },
            renderer: { 
                domElement: document.createElement('canvas'),
                render: () => {},
                setSize: () => {},
                setClearColor: () => {},
                setPixelRatio: () => {},
                shadowMap: { enabled: false, type: null }
            }
        };
    }

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Create renderer with proper settings
        const renderer = new THREE.WebGLRenderer({ 
            canvas: document.querySelector("#game"), 
            antialias: true,
            powerPreference: "high-performance",
            alpha: true
        });
        
        // Enable shadow mapping
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xf0f5f1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        
        // Optimize shadow map
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        
        scene.add(directionalLight);

        // Camera position
        camera.position.set(0, 10, 15);
        camera.lookAt(0, 0, 0);

        return { scene, camera, renderer };
    } catch (error) {
        console.error('Error creating scene:', error);
        // Return a minimal scene object to prevent errors
        return {
            scene: new THREE.Scene(),
            camera: { position: { set: () => {} }, lookAt: () => {} },
            renderer: { 
                domElement: document.createElement('canvas'),
                render: () => {},
                setSize: () => {},
                setClearColor: () => {},
                setPixelRatio: () => {},
                shadowMap: { enabled: false, type: null }
            }
        };
    }
}

export function handleResize() {
    try {
        window.addEventListener('resize', () => {
            const { camera, renderer } = window.gameContext;
            if (!camera || !renderer) return;
            
            // Update camera aspect ratio
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            // Update renderer size
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    } catch (error) {
        console.error('Error setting up resize handler:', error);
    }
} 