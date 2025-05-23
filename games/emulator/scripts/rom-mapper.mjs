/**
 * ROM Mapper
 * Maps ROM IDs to actual file paths and provides metadata
 * Now focused on direct local ROM loading
 */

// Dictionary of ROM identifiers to their information
const romDatabase = {
    // Game Boy Advance ROMs
    'pokemon-fire-red': {
        title: 'Pokémon Fire Red',
        system: 'gba',
        path: 'roms/gba/Pokemon - Fire Red Version (U) (V1.1).gba',
        emoji: '🔥'
    },
    'dragonball-z': {
        title: 'Dragon Ball Z - Supersonic Warriors',
        system: 'gba',
        path: 'roms/gba/Dragonball Z - Supersonic Warriors # GBA.GBA',
        emoji: '👊'
    }
};

// Initialize the ROM mapper
export function initializeROMMapper() {
    console.log("Initializing ROM mapper for direct ROM loading");
}

// Get the actual path to a ROM file
export function getActualROMPath(system, romId) {
    // Look up in the database
    const romInfo = Object.values(romDatabase).find(
        rom => rom.system === system && rom.path.toLowerCase().includes(romId.toLowerCase())
    );
    
    if (romInfo) {
        return romInfo.path;
    }
    
    // Not found
    return null;
}

// Get information about a ROM
export function getROMInfo(system, romId) {
    // Look up in the database
    const romInfo = Object.values(romDatabase).find(
        rom => rom.system === system && rom.path.toLowerCase().includes(romId.toLowerCase())
    );
    
    return romInfo || null;
}

// Get a list of available real ROMs by system
export function getAvailableRealROMs() {
    const realROMs = {};
    
    // Group ROMs by system
    Object.entries(romDatabase).forEach(([id, info]) => {
        if (!realROMs[info.system]) {
            realROMs[info.system] = [];
        }
        
        realROMs[info.system].push(id);
    });
    
    return realROMs;
} 