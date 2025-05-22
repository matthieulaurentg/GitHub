/**
 * ROM Loader - Educational Demo
 * 
 * This script simulates loading ROMs from a remote source without actually
 * downloading copyrighted material. Instead, it creates placeholder files
 * that will allow the emulator to demonstrate functionality.
 * 
 * IMPORTANT: For actual use, replace these placeholders with legally obtained ROMs.
 */

// Mock ROM data - contains metadata about popular titles for demonstration
const ROM_DATABASE = {
    'gba': {
        'pokemon-emerald': {
            title: 'Pokémon Emerald',
            size: 16777216, // 16MB
            crc32: '0xD7CF19A5'
        },
        'mario-advance4': {
            title: 'Super Mario Advance 4: Super Mario Bros 3',
            size: 8388608, // 8MB
            crc32: '0x5D3FA5F2'
        },
        'zelda-minish-cap': {
            title: 'The Legend of Zelda: The Minish Cap',
            size: 8388608, // 8MB
            crc32: '0xAB9F5D72'
        }
    },
    'nes': {
        'super-mario-bros': {
            title: 'Super Mario Bros',
            size: 40976, // ~40KB
            crc32: '0xEC58EAB7'
        },
        'zelda': {
            title: 'The Legend of Zelda',
            size: 81920, // ~80KB
            crc32: '0xA12A7328'
        },
        'metroid': {
            title: 'Metroid',
            size: 131072, // 128KB
            crc32: '0x3F2B08FA'
        }
    },
    'snes': {
        'super-mario-world': {
            title: 'Super Mario World',
            size: 524288, // 512KB
            crc32: '0xB19ED489'
        },
        'zelda-link-to-the-past': {
            title: 'The Legend of Zelda: A Link to the Past',
            size: 1048576, // 1MB
            crc32: '0x7D24A939'
        },
        'street-fighter-2': {
            title: 'Street Fighter II Turbo',
            size: 2097152, // 2MB
            crc32: '0x1C1D6B75'
        }
    }
};

// ROM file extensions by system
const ROM_EXTENSIONS = {
    'gba': '.gba',
    'nes': '.nes',
    'snes': '.sfc'
};

/**
 * Check if placeholder ROMs are present and generate them if needed
 */
export function checkAndCreatePlaceholderROMs() {
    return {
        initializePlaceholders() {
            console.log('Initializing ROM placeholders for educational demonstration...');
            
            // Process each system and game
            Object.keys(ROM_DATABASE).forEach(system => {
                Object.keys(ROM_DATABASE[system]).forEach(game => {
                    const romInfo = ROM_DATABASE[system][game];
                    createPlaceholderROM(system, game, romInfo);
                });
            });
            
            console.log('ROM placeholders ready for educational demonstration.');
            return true;
        }
    };
}

/**
 * Create a placeholder ROM file with identifier data
 */
function createPlaceholderROM(system, game, romInfo) {
    const extension = ROM_EXTENSIONS[system];
    const romPath = `roms/${system}/${game}${extension}`;
    
    // Log to console to show this is for educational purposes
    console.log(`[DEMO] Preparing placeholder for: ${romInfo.title} (${romPath})`);
    
    // Send event to UI to update status
    const placeholderEvent = new CustomEvent('rom-placeholder-ready', {
        detail: {
            system: system,
            game: game,
            title: romInfo.title,
            path: romPath
        }
    });
    document.dispatchEvent(placeholderEvent);
    
    // In a real app, check if file exists with the Fetch API or similar
    testROMAccess(romPath, romInfo.title);
}

/**
 * Test if ROM is accessible and show appropriate UI
 */
function testROMAccess(romPath, title) {
    fetch(romPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`ROM not found: ${romPath}`);
            }
            return response;
        })
        .then(() => {
            console.log(`✅ ROM found: ${title}`);
            updateROMStatus(romPath, 'found');
        })
        .catch(error => {
            console.log(`❌ ${error.message}. Using placeholder for demo.`);
            updateROMStatus(romPath, 'placeholder');
        });
}

/**
 * Update UI to reflect ROM status
 */
function updateROMStatus(romPath, status) {
    // Find the corresponding link in the UI
    const gameLinks = document.querySelectorAll('.game-link');
    gameLinks.forEach(link => {
        if (link.href.includes(romPath.split('/').pop().split('.')[0])) {
            if (status === 'found') {
                link.classList.add('rom-available');
                link.dataset.romStatus = 'available';
            } else {
                link.classList.add('rom-placeholder');
                link.dataset.romStatus = 'placeholder';
            }
        }
    });
}

/**
 * Add UI elements showing ROM availability status
 */
export function enhanceROMLinks() {
    // Add styles for ROM status indicators
    const style = document.createElement('style');
    style.textContent = `
        .rom-available::after {
            content: "✅";
            margin-left: 8px;
        }
        .rom-placeholder::after {
            content: "📝";
            margin-left: 8px;
        }
        [data-rom-status]::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }
        [data-rom-status="available"]::before {
            background-color: #00cc00;
        }
        [data-rom-status="placeholder"]::before {
            background-color: #ffcc00;
        }
    `;
    document.head.appendChild(style);
    
    // Add explanatory UI element
    const romExplanation = document.createElement('div');
    romExplanation.className = 'rom-explanation';
    romExplanation.innerHTML = `
        <div style="margin-top: 20px; padding: 15px; background-color: #252525; border-radius: 8px;">
            <h3 style="color: #0088ff; margin-top: 0;">About ROM Status</h3>
            <p><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #00cc00; margin-right: 8px;"></span>
               <strong>Green</strong>: ROM file found in correct location</p>
            <p><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ffcc00; margin-right: 8px;"></span>
               <strong>Yellow</strong>: Using demo placeholder (for educational purposes)</p>
        </div>
    `;
    
    // Add to the instructions section after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        const instructionsDiv = document.querySelector('.instructions');
        if (instructionsDiv) {
            instructionsDiv.appendChild(romExplanation);
        }
    });
} 