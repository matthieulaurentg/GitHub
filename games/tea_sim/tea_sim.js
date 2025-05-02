// Game state
const gameState = {
    cats: [],
    teaInventory: {},
    cultivators: [
        { id: 1, name: "Novice Cultivator", efficiency: 1, level: 1 },
        { id: 2, name: "Skilled Cultivator", efficiency: 1.5, level: 1 },
        { id: 3, name: "Master Cultivator", efficiency: 2, level: 1 }
    ],
    plants: []
};

// Cat rarities and their probabilities
const CAT_RARITIES = {
    'Common': 0.6,
    'Rare': 0.3,
    'Epic': 0.08,
    'Legendary': 0.02
};

// Cat breeds for each rarity
const CAT_BREEDS = {
    'Common': ['Tabby', 'Black', 'White', 'Orange'],
    'Rare': ['Siamese', 'Persian', 'Bengal', 'Russian Blue'],
    'Epic': ['Scottish Fold', 'Maine Coon', 'Sphynx', 'British Shorthair'],
    'Legendary': ['Golden Maneki-neko', 'Celestial Lion', 'Tea Spirit', 'Jade Emperor']
};

// Initialize game
function initGame() {
    renderCultivators();
    setupTeaGarden();
    setupEventListeners();
    loadGameState();
}

// Render cultivators
function renderCultivators() {
    const cultivatorGrid = document.getElementById('cultivator-grid');
    cultivatorGrid.innerHTML = gameState.cultivators.map(cultivator => `
        <div class="cultivator">
            <h3>${cultivator.name}</h3>
            <p>Level: ${cultivator.level}</p>
            <p>Efficiency: ${cultivator.efficiency.toFixed(1)}x</p>
        </div>
    `).join('');
}

// Setup tea garden
function setupTeaGarden() {
    const garden = document.getElementById('tea-garden');
    for (let i = 0; i < 12; i++) {
        const plant = createTeaPlant();
        gameState.plants.push(plant);
        garden.appendChild(plant.element);
    }
}

// Create a tea plant
function createTeaPlant() {
    const element = document.createElement('div');
    element.className = 'tea-plant';
    
    const plant = {
        element,
        growthStage: 0,
        maxGrowthStage: 5,
        leaves: [],
        cultivatorId: Math.floor(Math.random() * 3) + 1
    };

    element.addEventListener('click', () => harvestPlant(plant));
    
    // Add random number of leaves (3-7)
    const numLeaves = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numLeaves; i++) {
        addLeafToPlant(plant);
    }

    return plant;
}

// Add a leaf to a plant
function addLeafToPlant(plant) {
    const leaf = document.createElement('div');
    leaf.className = 'tea-leaf';
    
    // Random position within the plant
    const top = Math.random() * 70 + 10;
    const left = Math.random() * 70 + 10;
    const rotation = Math.random() * 360;
    
    leaf.style.top = `${top}%`;
    leaf.style.left = `${left}%`;
    leaf.style.transform = `rotate(${rotation}deg)`;
    
    plant.element.appendChild(leaf);
    plant.leaves.push({
        element: leaf,
        growthProgress: 0,
        isReady: false
    });
}

// Harvest a plant
function harvestPlant(plant) {
    const readyLeaves = plant.leaves.filter(leaf => leaf.isReady);
    if (readyLeaves.length > 0) {
        const cultivator = gameState.cultivators.find(c => c.id === plant.cultivatorId);
        const teaAmount = Math.ceil(readyLeaves.length * cultivator.efficiency);
        
        // Add tea to inventory
        gameState.teaInventory.leaves = (gameState.teaInventory.leaves || 0) + teaAmount;
        
        // Remove harvested leaves
        readyLeaves.forEach(leaf => {
            leaf.element.remove();
            plant.leaves = plant.leaves.filter(l => l !== leaf);
        });
        
        // Add new leaves
        for (let i = 0; i < readyLeaves.length; i++) {
            addLeafToPlant(plant);
        }
        
        updateInventoryDisplay();
        maybeSpawnCat();
    }
}

// Update leaves growth
function updateLeaves() {
    gameState.plants.forEach(plant => {
        const cultivator = gameState.cultivators.find(c => c.id === plant.cultivatorId);
        plant.leaves.forEach(leaf => {
            if (!leaf.isReady) {
                leaf.growthProgress += 0.1 * cultivator.efficiency;
                if (leaf.growthProgress >= 100) {
                    leaf.isReady = true;
                    leaf.element.classList.add('ready');
                }
            }
        });
    });
}

// Maybe spawn a cat when harvesting
function maybeSpawnCat() {
    if (Math.random() < 0.1) { // 10% chance to spawn a cat
        const rarity = determineRarity();
        const breed = getRandomBreed(rarity);
        const cat = {
            id: Date.now(),
            breed,
            rarity
        };
        gameState.cats.push(cat);
        updateCatDisplay();
        
        // Show notification
        alert(`You found a ${rarity} ${breed} cat!`);
    }
}

// Determine cat rarity
function determineRarity() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [rarity, prob] of Object.entries(CAT_RARITIES)) {
        cumulative += prob;
        if (rand <= cumulative) return rarity;
    }
    return 'Common';
}

// Get random breed for rarity
function getRandomBreed(rarity) {
    const breeds = CAT_BREEDS[rarity];
    return breeds[Math.floor(Math.random() * breeds.length)];
}

// Update cat display
function updateCatDisplay() {
    const catGrid = document.getElementById('cat-grid');
    catGrid.innerHTML = gameState.cats.map(cat => `
        <div class="cat-card">
            <h4>${cat.breed}</h4>
            <div class="cat-rarity">${cat.rarity}</div>
        </div>
    `).join('');
}

// Update inventory display
function updateInventoryDisplay() {
    const inventoryElement = document.getElementById('tea-inventory');
    inventoryElement.innerHTML = `
        <div class="tea-item">
            <span>Tea Leaves</span>
            <span class="tea-count">${gameState.teaInventory.leaves || 0}</span>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

// Save and load game state
function saveGameState() {
    localStorage.setItem('teaSimSave', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('teaSimSave');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
        updateCatDisplay();
        updateInventoryDisplay();
    }
}

// Start game loop
setInterval(updateLeaves, 1000);
setInterval(saveGameState, 30000);

// Initialize the game
initGame(); 