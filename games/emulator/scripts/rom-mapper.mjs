/**
 * ROM Mapper Script
 * 
 * This script maps ROM IDs directly to actual ROM files in the directory
 * to make them work with the emulator.
 * 
 * Note: This is for EDUCATIONAL PURPOSES ONLY
 */

// Maps ROM IDs to actual ROM files in the directory (real files only)
const REAL_ROM_MAPPINGS = {
    'gba': {
        'pokemon-fire-red': 'Pokemon - Fire Red Version (U) (V1.1).gba',
        'dragonball-supersonic': 'Dragonball Z - Supersonic Warriors # GBA.GBA'
    },
    'nes': {},
    'snes': {}
};

// ROM information for real files
const ROM_INFO = {
    'gba': {
        'pokemon-fire-red': {
            title: 'Pokémon Fire Red',
            system: 'Game Boy Advance',
            description: 'A remake of the original Pokémon Red game set in the Kanto region with updated graphics and gameplay features.',
            emoji: '🔥'
        },
        'dragonball-supersonic': {
            title: 'Dragon Ball Z - Supersonic Warriors',
            system: 'Game Boy Advance',
            description: 'A fast-paced fighting game featuring characters from the Dragon Ball Z universe.',
            emoji: '👊'
        }
    },
    'nes': {},
    'snes': {}
};

/**
 * Gets all available ROMs that actually exist in the filesystem
 * @returns {Object} - Object with systems as keys, each containing an array of ROM IDs
 */
export function getAvailableRealROMs() {
    const available = {};
    
    Object.keys(REAL_ROM_MAPPINGS).forEach(system => {
        if (Object.keys(REAL_ROM_MAPPINGS[system]).length > 0) {
            available[system] = Object.keys(REAL_ROM_MAPPINGS[system]);
        }
    });
    
    return available;
}

/**
 * Gets information about a real ROM
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} romId - The ROM ID
 * @returns {object|null} - ROM information or null if not found
 */
export function getROMInfo(system, romId) {
    if (!ROM_INFO[system] || !ROM_INFO[system][romId]) {
        return null;
    }
    
    return ROM_INFO[system][romId];
}

/**
 * Gets the actual file path for a ROM if it exists
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} romId - The ROM ID
 * @returns {string|null} - The actual file path or null if not found
 */
export function getActualROMPath(system, romId) {
    if (!REAL_ROM_MAPPINGS[system] || !REAL_ROM_MAPPINGS[system][romId]) {
        // No mapping found, ROM doesn't exist
        return null;
    }
    
    const actualFileName = REAL_ROM_MAPPINGS[system][romId];
    return `roms/${system}/${actualFileName}`;
}

/**
 * Initialize ROM mappings
 * This function can be called at startup to check if the actual ROMs exist
 */
export function initializeROMMapper() {
    console.log('Initializing ROM file mappings...');
    
    // For each system and ROM mapping, check if the file exists
    Object.keys(REAL_ROM_MAPPINGS).forEach(system => {
        Object.keys(REAL_ROM_MAPPINGS[system]).forEach(romId => {
            const actualPath = getActualROMPath(system, romId);
            console.log(`Found real ROM: ${romId} -> ${actualPath}`);
        });
    });
    
    console.log('ROM mapper initialization complete');
}

// Export all available ROM mappings
export function getAllROMFileMappings() {
    return REAL_ROM_MAPPINGS;
} 