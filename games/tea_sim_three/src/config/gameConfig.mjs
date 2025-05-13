export const GAME_STATE = {
    teaLeaves: 0,
    growthSpots: [],
    specialLeaves: {
        golden: 0,
        rainbow: 0,
        crystal: 0
    },
    upgrades: {
        antHill: 0,
        pond: 0,
        birdhouse: 0
    }
};

export const TEA_CONFIG = {
    growthStages: {
        bud: { scale: 0.1, color: 0x90EE90 },  // Light green
        young: { scale: 0.2, color: 0x228B22 }, // Forest green
        mature: { scale: 0.3, color: 0x006400 }  // Dark green
    },
    specialLeaves: {
        golden: { scale: 0.3, color: 0xFFD700, chance: 0.1, emoji: '🌟' },
        rainbow: { scale: 0.3, color: 0xFF1493, chance: 0.05, emoji: '🌈' },
        crystal: { scale: 0.3, color: 0x00FFFF, chance: 0.02, emoji: '💎' }
    },
    upgrades: {
        antHill: {
            cost: 50,
            emoji: '🐜',
            name: 'Ant Hill',
            description: 'Ants help fertilize the soil',
            speedBonus: 0.1
        },
        pond: {
            cost: 100,
            emoji: '🌊',
            name: 'Garden Pond',
            description: 'Provides natural irrigation',
            specialChanceBonus: 0.02
        },
        birdhouse: {
            cost: 150,
            emoji: '🏠',
            name: 'Bird House',
            description: 'Birds spread seeds around',
            multiGrowBonus: 0.1
        }
    },
    growthTime: 2000, // Reduced from 5000 to 2000 ms
    plotSize: {
        width: 6,
        spacing: 8
    }
};

// Local storage key
export const STORAGE_KEY = 'tea_garden_save';

// Save game state
export function saveGameState() {
    const saveData = {
        teaLeaves: GAME_STATE.teaLeaves,
        specialLeaves: GAME_STATE.specialLeaves,
        upgrades: GAME_STATE.upgrades
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

// Load game state
export function loadGameState() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const data = JSON.parse(savedData);
        GAME_STATE.teaLeaves = data.teaLeaves;
        GAME_STATE.specialLeaves = data.specialLeaves;
        GAME_STATE.upgrades = data.upgrades || { antHill: 0, pond: 0, birdhouse: 0 };
    }
}

// Calculate growth speed multiplier based on upgrades
export function getGrowthMultiplier() {
    return 1 + (GAME_STATE.upgrades.antHill * TEA_CONFIG.upgrades.antHill.speedBonus);
}

// Calculate special leaf chance bonus based on upgrades
export function getSpecialChanceBonus() {
    return GAME_STATE.upgrades.pond * TEA_CONFIG.upgrades.pond.specialChanceBonus;
}

// Calculate multi-grow chance based on upgrades
export function getMultiGrowChance() {
    return GAME_STATE.upgrades.birdhouse * TEA_CONFIG.upgrades.birdhouse.multiGrowBonus;
} 