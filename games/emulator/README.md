# RetroGame Emulator

This is a web-based emulator for retro gaming systems, powered by [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS).

## Setup

This emulator is configured to use the EmulatorJS CDN for all core emulator files, so you don't need to download or install them manually. However, **you do need to provide your own ROM files** for legal reasons.

### ROM Files

Place your ROM files in the following locations:

```
games/emulator/roms/gba/pokemon-emerald.gba
games/emulator/roms/gba/mario-advance4.gba
games/emulator/roms/gba/zelda-minish-cap.gba

games/emulator/roms/nes/super-mario-bros.nes
games/emulator/roms/nes/zelda.nes
games/emulator/roms/nes/metroid.nes

games/emulator/roms/snes/super-mario-world.sfc
games/emulator/roms/snes/zelda-link-to-the-past.sfc
games/emulator/roms/snes/street-fighter-2.sfc
```

## Legal Notice

It's important to note that you should only use ROM files for games that you legally own. The emulator itself is legal, but distributing ROMs or downloading ROMs for games you don't own may violate copyright laws.

## Features

- Supports Game Boy Advance, NES, and SNES games
- Save states functionality
- Mobile-friendly touch controls
- Keyboard support for desktop play
- Special cheat codes (activated with Konami Code)

## Konami Code

Find the hidden easter egg by entering the Konami Code on the emulator page:
↑ ↑ ↓ ↓ ← → ← → B A

## Supported Systems

The emulator currently supports these systems:

1. **Game Boy Advance (GBA)**
   - File extension: `.gba`

2. **Nintendo Entertainment System (NES)**
   - File extension: `.nes`

3. **Super Nintendo Entertainment System (SNES)**
   - File extension: `.sfc`

## Credits

- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) - The core emulation technology
- Game artwork and descriptions are used for educational purposes only 