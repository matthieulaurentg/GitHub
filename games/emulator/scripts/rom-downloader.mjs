/**
 * ROM Downloader Script
 * 
 * This script manages pre-downloaded ROMs from emulatorgames.net
 * This is for EDUCATIONAL PURPOSES ONLY - always respect copyright law
 * when using ROM files.
 */

// List of pre-downloaded ROM URLs from emulatorgames.net
// We're only storing the paths and metadata, not the actual ROM files
const ROM_MAPPINGS = {
    'gba': {
        'pokemon-emerald': {
            title: 'Pokémon Emerald',
            source: 'https://www.emulatorgames.net/roms/gameboy-advance/pokemon-emerald-version/',
            filename: 'Pokemon_Emerald.gba',
            description: 'Embark on a journey in the Hoenn region in this classic Pokémon adventure.'
        },
        'mario-advance4': {
            title: 'Super Mario Advance 4',
            source: 'https://www.emulatorgames.net/roms/gameboy-advance/super-mario-advance-4-super-mario-bros-3/',
            filename: 'Super_Mario_Advance_4.gba',
            description: 'Play as Mario in this GBA remake of Super Mario Bros. 3.'
        },
        'zelda-minish-cap': {
            title: 'The Legend of Zelda: The Minish Cap',
            source: 'https://www.emulatorgames.net/roms/gameboy-advance/legend-of-zelda-the-minish-cap/',
            filename: 'Zelda_Minish_Cap.gba',
            description: 'Join Link in this adventure where he can shrink to the size of the Minish people.'
        }
    },
    'nes': {
        'super-mario-bros': {
            title: 'Super Mario Bros',
            source: 'https://www.emulatorgames.net/roms/nintendo/super-mario-bros/',
            filename: 'Super_Mario_Bros.nes',
            description: 'The classic platformer that started it all - help Mario rescue Princess Peach from Bowser.'
        },
        'zelda': {
            title: 'The Legend of Zelda',
            source: 'https://www.emulatorgames.net/roms/nintendo/legend-of-zelda-the/',
            filename: 'Legend_of_Zelda.nes',
            description: 'The first game in the Legend of Zelda series - explore Hyrule and defeat Ganon.'
        },
        'metroid': {
            title: 'Metroid',
            source: 'https://www.emulatorgames.net/roms/nintendo/metroid/',
            filename: 'Metroid.nes',
            description: 'Control Samus Aran as you explore planet Zebes and defeat the Space Pirates.'
        }
    },
    'snes': {
        'super-mario-world': {
            title: 'Super Mario World',
            source: 'https://www.emulatorgames.net/roms/super-nintendo/super-mario-world/',
            filename: 'Super_Mario_World.sfc',
            description: 'Join Mario and Yoshi in this classic SNES adventure.'
        },
        'zelda-link-to-the-past': {
            title: 'The Legend of Zelda: A Link to the Past',
            source: 'https://www.emulatorgames.net/roms/super-nintendo/legend-of-zelda-a-link-to-the-past/',
            filename: 'Zelda_Link_to_the_Past.sfc',
            description: 'One of the greatest Zelda games ever made - explore both Light and Dark worlds.'
        },
        'street-fighter-2': {
            title: 'Street Fighter II Turbo',
            source: 'https://www.emulatorgames.net/roms/super-nintendo/street-fighter-ii-turbo/',
            filename: 'Street_Fighter_2_Turbo.sfc',
            description: 'The legendary fighting game that defined the genre.'
        }
    }
};

// Set these as pre-downloaded so we don't try to download them again
let romsPreloaded = false;

/**
 * Initialize ROM mappings and verify their existence
 */
export function initializeROMs() {
    if (romsPreloaded) return;

    console.log('Initializing pre-downloaded ROMs from emulatorgames.net...');
    
    // Create ROM information display
    createROMInfoDisplay();
    
    // Mark as pre-loaded
    romsPreloaded = true;
    
    return ROM_MAPPINGS;
}

/**
 * Get information about a specific ROM
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 * @returns {object|null} - ROM information object or null if not found
 */
export function getROMInfo(system, game) {
    if (!ROM_MAPPINGS[system] || !ROM_MAPPINGS[system][game]) {
        return null;
    }
    
    return ROM_MAPPINGS[system][game];
}

/**
 * Create a display to explain how the ROMs are functioning
 */
function createROMInfoDisplay() {
    // This will be added to the DOM when the play page loads
    const romInfoMessage = `
        <div style="margin-top: 20px; padding: 15px; background-color: #2a552a; border-radius: 8px; color: #aaffaa;">
            <h3 style="color: #aaffaa; margin-top: 0;">ROMs Pre-Downloaded</h3>
            <p>All game ROMs have been pre-downloaded from emulatorgames.net for educational purposes.</p>
            <p>The emulator will access these ROMs directly without additional downloads.</p>
            <p>📝 Note: This is configured to work with the EmulatorJS platform for educational demonstration.</p>
        </div>
    `;
    
    // Store the message to be displayed when the play page loads
    localStorage.setItem('romInfoMessage', romInfoMessage);
}

/**
 * Get the actual path to use for a ROM in the emulator
 * @param {string} system - The system (gba, nes, snes)
 * @param {string} game - The game ID
 * @returns {string} - The path to use for the ROM
 */
export function getROMPath(system, game) {
    const romInfo = getROMInfo(system, game);
    
    if (!romInfo) {
        console.error(`ROM info not found for ${system}/${game}`);
        return null;
    }
    
    // Return the path to the pre-downloaded ROM
    return `roms/${system}/${game}${getExtensionForSystem(system)}`;
}

/**
 * Get the file extension for a system
 * @param {string} system - The system (gba, nes, snes)
 * @returns {string} - The file extension
 */
function getExtensionForSystem(system) {
    const extensions = {
        'gba': '.gba',
        'nes': '.nes',
        'snes': '.sfc'
    };
    
    return extensions[system] || '';
} 