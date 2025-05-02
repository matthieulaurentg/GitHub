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
        <div class="cultivator ${getCultivatorClass(cultivator)}">
            <h3>${cultivator.name}</h3>
            <p>Level: ${cultivator.level}</p>
            <p>Efficiency: ${cultivator.efficiency.toFixed(1)}x</p>
        </div>
    `).join('');
}

function getCultivatorClass(cultivator) {
    switch(cultivator.id) {
        case 1: return 'novice';
        case 2: return 'skilled';
        case 3: return 'master';
        default: return '';
    }
}

// Setup tea garden
function setupTeaGarden() {
    const garden = document.getElementById('tea-garden');
    garden.innerHTML = ''; // Clear existing plants
    for (let i = 0; i < 9; i++) {
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
        cats: [],
        cultivatorId: Math.floor(Math.random() * 3) + 1
    };

    element.addEventListener('click', () => harvestPlant(plant));
    
    // Add random number of cat-leaves (2-4)
    const numCats = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numCats; i++) {
        addCatToPlant(plant);
    }

    return plant;
}

// Add a cat to a plant
function addCatToPlant(plant) {
    const catLeaf = document.createElement('div');
    catLeaf.className = 'cat-leaf';
    
    // Random position within the plant
    const top = Math.random() * 50 + 10;
    const left = Math.random() * 60 + 20;
    
    catLeaf.style.top = `${top}%`;
    catLeaf.style.left = `${left}%`;
    
    const rarity = determineRarity();
    catLeaf.classList.add(rarity.toLowerCase());
    
    plant.element.appendChild(catLeaf);
    plant.cats.push({
        element: catLeaf,
        growthProgress: 0,
        isReady: false,
        rarity: rarity,
        breed: getRandomBreed(rarity)
    });
}

// Harvest a plant
function harvestPlant(plant) {
    const readyCats = plant.cats.filter(cat => cat.isReady);
    if (readyCats.length > 0) {
        const cultivator = gameState.cultivators.find(c => c.id === plant.cultivatorId);
        
        // Add cats to collection
        readyCats.forEach(cat => {
            gameState.cats.push({
                id: Date.now() + Math.random(),
                breed: cat.breed,
                rarity: cat.rarity
            });
            
            // Add tea leaves based on cat rarity
            const teaBonus = getTeaBonus(cat.rarity);
            gameState.teaInventory.leaves = (gameState.teaInventory.leaves || 0) + 
                Math.ceil(teaBonus * cultivator.efficiency);
        });
        
        // Remove harvested cats
        readyCats.forEach(cat => {
            cat.element.remove();
            plant.cats = plant.cats.filter(c => c !== cat);
        });
        
        // Add new cats
        for (let i = 0; i < readyCats.length; i++) {
            addCatToPlant(plant);
        }
        
        updateCatDisplay();
        updateInventoryDisplay();
    }
}

function getTeaBonus(rarity) {
    switch(rarity) {
        case 'Legendary': return 10;
        case 'Epic': return 5;
        case 'Rare': return 3;
        default: return 1;
    }
}

// Update cats growth
function updateGrowth() {
    gameState.plants.forEach(plant => {
        const cultivator = gameState.cultivators.find(c => c.id === plant.cultivatorId);
        plant.cats.forEach(cat => {
            if (!cat.isReady) {
                cat.growthProgress += 0.05 * cultivator.efficiency; // Slower growth rate
                if (cat.growthProgress >= 100) {
                    cat.isReady = true;
                    cat.element.classList.add('ready');
                }
            }
        });
    });
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
            <div class="cat-rarity ${cat.rarity.toLowerCase()}">${cat.rarity}</div>
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
    localStorage.setItem('teaSimSave', JSON.stringify({
        cats: gameState.cats,
        teaInventory: gameState.teaInventory,
        cultivators: gameState.cultivators
    }));
}

function loadGameState() {
    const savedState = localStorage.getItem('teaSimSave');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        gameState.cats = parsed.cats || [];
        gameState.teaInventory = parsed.teaInventory || {};
        gameState.cultivators = parsed.cultivators || gameState.cultivators;
        updateCatDisplay();
        updateInventoryDisplay();
    }
}

// Start game loop
setInterval(updateGrowth, 1000);
setInterval(saveGameState, 30000);

// Initialize the game
initGame(); 