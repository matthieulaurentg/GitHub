// Game state
const GAME_STATE = {
    cats: [],
    teaLeaves: 0,
    cultivators: [
        { id: 1, name: "Novice", efficiency: 1 },
        { id: 2, name: "Skilled", efficiency: 1.5 },
        { id: 3, name: "Master", efficiency: 2 }
    ]
};

// Cat configuration
const CAT_CONFIG = {
    rarities: {
        common: { chance: 0.6, color: 0x969696, symbol: "😺" },
        rare: { chance: 0.3, color: 0x2196F3, symbol: "😸" },
        epic: { chance: 0.08, color: 0x9C27B0, symbol: "😻" },
        legendary: { chance: 0.02, color: 0xF44336, symbol: "🐱" }
    },
    breeds: {
        common: ["Tabby", "Black", "White", "Orange"],
        rare: ["Siamese", "Persian", "Bengal", "Russian Blue"],
        epic: ["Scottish Fold", "Maine Coon", "Sphynx", "British Shorthair"],
        legendary: ["Golden Maneki-neko", "Celestial Lion", "Tea Spirit", "Jade Emperor"]
    }
};

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#game"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f5f1);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Camera position
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

// Helper functions
function getRandomRarity() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [rarity, config] of Object.entries(CAT_CONFIG.rarities)) {
        cumulative += config.chance;
        if (rand <= cumulative) return rarity;
    }
    return "common";
}

function getRandomBreed(rarity) {
    const breeds = CAT_CONFIG.breeds[rarity];
    return breeds[Math.floor(Math.random() * breeds.length)];
}

// Create cultivator areas
const cultivatorWidth = 6;
const cultivatorSpacing = 8;
GAME_STATE.cultivators.forEach((cultivator, index) => {
    const x = (index - 1) * cultivatorSpacing;
    
    // Create ground area
    const groundGeometry = new THREE.PlaneGeometry(cultivatorWidth, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x90A955,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(x, 0, 0);
    scene.add(ground);

    // Add cultivator label
    const loader = new THREE.TextureLoader();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = '#000000';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText(cultivator.name, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(x, 2.5, -4);
    scene.add(label);

    // Create plants
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            const plantX = x + (col - 0.5) * 2;
            const plantZ = (row - 0.5) * 3;
            createPlant(plantX, plantZ, cultivator);
        }
    }
});

// Plant creation
function createPlant(x, z, cultivator) {
    // Create pot
    const potGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.set(x, 0.4, z);
    scene.add(pot);

    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(x, 1.8, z);
    scene.add(stem);

    // Create cat spots
    const spots = [];
    for (let i = 0; i < 3; i++) {
        const angle = ((i - 1) * Math.PI / 4);
        const spotX = x + Math.cos(angle) * 0.4;
        const spotZ = z + Math.sin(angle) * 0.4;
        const spotY = 1.2 + i * 0.6;

        const spot = {
            position: new THREE.Vector3(spotX, spotY, spotZ),
            occupied: false,
            growthProgress: 0,
            cultivator: cultivator,
            mesh: null,
            cat: null
        };

        // Create visual indicator for spot
        const spotGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const spotMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3
        });
        const spotMesh = new THREE.Mesh(spotGeometry, spotMaterial);
        spotMesh.position.copy(spot.position);
        scene.add(spotMesh);
        spot.mesh = spotMesh;
        spots.push(spot);
    }
    return spots;
}

// UI update functions
function updateCatList() {
    const catList = document.getElementById("cat-list");
    catList.innerHTML = GAME_STATE.cats.map(cat => `
        <div class="cat-item">
            <span>${cat.breed}</span>
            <span class="cat-rarity rarity-${cat.rarity}">${cat.rarity}</span>
        </div>
    `).join("");
}

function updateTeaInventory() {
    const teaInventory = document.getElementById("tea-inventory");
    teaInventory.innerHTML = `
        <div class="cat-item">
            <span>Tea Leaves</span>
            <span>${GAME_STATE.teaLeaves}</span>
        </div>
    `;
}

// Setup UI tabs
document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(`${button.dataset.tab}-tab`).classList.add("active");
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 