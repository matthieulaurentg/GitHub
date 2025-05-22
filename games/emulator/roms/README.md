# Pokemon ROM Files

This directory contains helper scripts for generating minimal valid ROM structures that work with the EmulatorJS system. 

## How it works

- When you select a game from the emulator interface, it dynamically generates a minimal valid ROM structure
- The ROM structure includes proper headers and basic data needed for each system
- No actual game code is included - just enough structure to make the emulator load properly
- Users are prompted to upload their own ROMs for the full experience

## Files in this directory

- `stub-rom-content.js` - Creates valid ROM structures for various systems
- `rom-generator.js` - Utility for generating downloadable ROM files
- Pokemon placeholders - Used as fallbacks if dynamic generation fails

## Technical Details

The dynamic ROM generation system:
1. Creates ROM files with correct headers for each system (GB, GBC, GBA, NDS, etc.)
2. Includes system-specific validation bytes (like Nintendo logo data)
3. Creates minimal runnable code that displays instructions to the user
4. Does not contain any copyrighted game data

## Legal Considerations

Using this emulator to play games you don't own may be a copyright violation in some jurisdictions. Please ensure you own a legitimate copy of any games you play through this emulator.

The emulator itself is legal software, but the ROMs (game files) are subject to copyright laws.

## Available ROMs

### Pokémon Series
- Pokemon-Red.gb
- Pokemon-Blue.gb  
- Pokemon-Yellow.gb
- Pokemon-Gold.gbc
- Pokemon-Silver.gbc
- Pokemon-Crystal.gbc
- Pokemon-Ruby.gba
- Pokemon-Sapphire.gba
- Pokemon-Emerald.gba
- Pokemon-FireRed.gba
- Pokemon-LeafGreen.gba
- Pokemon-Diamond.nds
- Pokemon-Pearl.nds
- Pokemon-Platinum.nds
- Pokemon-HeartGold.nds
- Pokemon-SoulSilver.nds

### SNES Games
- Street-Fighter-II.sfc (Street Fighter II: The World Warrior)

## ROM Sources

For legal reasons, these files are just placeholders. You should obtain ROMs legally by:
1. Dumping your own cartridges with appropriate hardware
2. Downloading from legitimate sources where you own the original game
3. Using public domain or freely available ROMs

Recommended Source: https://www.emulatorgames.net/ 