// Initialize Kaboom
kaboom({
    global: true,
    canvas: document.querySelector("#game"),
    width: 800,
    height: 600,
    background: [240, 245, 241],
});

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
        common: { chance: 0.6, color: rgb(150, 150, 150), symbol: "😺" },
        rare: { chance: 0.3, color: rgb(33, 150, 243), symbol: "😸" },
        epic: { chance: 0.08, color: rgb(156, 39, 176), symbol: "😻" },
        legendary: { chance: 0.02, color: rgb(244, 67, 54), symbol: "🐱" }
    },
    breeds: {
        common: ["Tabby", "Black", "White", "Orange"],
        rare: ["Siamese", "Persian", "Bengal", "Russian Blue"],
        epic: ["Scottish Fold", "Maine Coon", "Sphynx", "British Shorthair"],
        legendary: ["Golden Maneki-neko", "Celestial Lion", "Tea Spirit", "Jade Emperor"]
    }
};

// Load assets
loadSprite("stem", "stem.png");
loadSprite("pot", "pot.png");
loadSprite("cat-common", "cat-common.png");
loadSprite("cat-rare", "cat-rare.png");
loadSprite("cat-epic", "cat-epic.png");
loadSprite("cat-legendary", "cat-legendary.png");

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

// Game scene
scene("game", () => {
    // Add cultivator areas
    const cultivatorWidth = width() / 3;
    GAME_STATE.cultivators.forEach((cultivator, index) => {
        const area = add([
            rect(cultivatorWidth - 20, height()),
            pos(index * cultivatorWidth + 10, 0),
            color(rgba(0, 0, 0, 0.1)),
            area(),
            "cultivator-area",
            { cultivator }
        ]);

        // Add cultivator label
        add([
            text(cultivator.name, { size: 20 }),
            pos(index * cultivatorWidth + cultivatorWidth/2, 30),
            anchor("center"),
            color(0, 0, 0)
        ]);
    });

    // Create tea plants
    function createTeaPlant(x, y, cultivator) {
        // Create stem
        const stem = add([
            rect(8, 100),
            pos(x, y),
            color(rgb(101, 67, 33)),
            anchor("center"),
            "plant-stem"
        ]);

        // Create pot
        const pot = add([
            rect(40, 30),
            pos(x, y + 50),
            color(rgb(139, 69, 19)),
            anchor("center"),
            "plant-pot"
        ]);

        const plant = {
            stem,
            pot,
            cultivator,
            cats: [],
            maxCats: 3
        };

        // Add cat spots
        for (let i = 0; i < plant.maxCats; i++) {
            const angle = map(i, 0, plant.maxCats - 1, -PI/4, PI/4);
            const catX = x + Math.cos(angle) * 30;
            const catY = y - 40 - i * 20;
            
            const catSpot = add([
                circle(15),
                pos(catX, catY),
                anchor("center"),
                opacity(0.3),
                color(200, 200, 200),
                area(),
                "cat-spot",
                {
                    plant,
                    occupied: false,
                    cat: null,
                    growthProgress: 0
                }
            ]);

            plant.cats.push(catSpot);
        }

        return plant;
    }

    // Create plants for each cultivator
    GAME_STATE.cultivators.forEach((cultivator, i) => {
        const areaWidth = width() / 3;
        const centerX = i * areaWidth + areaWidth/2;
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const x = centerX + (col - 0.5) * 80;
                const y = 150 + row * 180;
                createTeaPlant(x, y, cultivator);
            }
        }
    });

    // Growth system
    onUpdate("cat-spot", (spot) => {
        if (!spot.occupied && Math.random() < 0.001 * spot.plant.cultivator.efficiency) {
            const rarity = getRandomRarity();
            const breed = getRandomBreed(rarity);
            
            spot.occupied = true;
            const catGroup = add([
                pos(spot.pos),
                anchor("center")
            ]);

            // Add cat background circle
            catGroup.add([
                circle(12),
                color(CAT_CONFIG.rarities[rarity].color),
                anchor("center")
            ]);

            // Add cat emoji
            const catEmoji = catGroup.add([
                text(CAT_CONFIG.rarities[rarity].symbol, { size: 20 }),
                anchor("center"),
                pos(0, -2)
            ]);

            spot.cat = catGroup;
            catGroup.add([
                area(),
                "cat",
                {
                    rarity,
                    breed,
                    spot,
                    growthProgress: 0,
                    ready: false
                }
            ]);
        }
    });

    // Cat growth
    onUpdate("cat", (cat) => {
        if (!cat.ready) {
            cat.growthProgress += dt() * 10 * cat.spot.plant.cultivator.efficiency;
            if (cat.growthProgress >= 100) {
                cat.ready = true;
                cat.parent.use(color(255, 255, 255));
                cat.parent.add([
                    sprite("sparkle"),
                    anchor("center"),
                    pos(0, -15),
                    scale(0.5)
                ]);
            }
        }
    });

    // Harvesting system
    onClick("cat", (cat) => {
        if (cat.ready) {
            // Add cat to collection
            GAME_STATE.cats.push({
                breed: cat.breed,
                rarity: cat.rarity
            });
            
            // Add tea leaves based on rarity
            const teaBonus = {
                common: 1,
                rare: 3,
                epic: 5,
                legendary: 10
            }[cat.rarity];
            
            GAME_STATE.teaLeaves += teaBonus * cat.spot.plant.cultivator.efficiency;
            
            // Remove cat
            destroy(cat.parent);
            cat.spot.occupied = false;
            cat.spot.cat = null;
            
            // Update UI
            updateCatList();
            updateTeaInventory();
            
            // Visual feedback
            add([
                text(`+${teaBonus}`, { size: 16 }),
                pos(cat.spot.pos.add(0, -20)),
                anchor("center"),
                color(0, 255, 0),
                lifespan(1),
                move(UP, 100)
            ]);
        }
    });
});

// Start the game
go("game"); 