# RetroGame Emulator

This is a web-based emulator for retro gaming systems, powered by [EmulatorJS](https://emulatorjs.org/).

## How to Use

1. **Select a System** - Choose from Game Boy Advance, NES, SNES, N64, or PlayStation
2. **Provide Your ROM** - Drag and drop your ROM file into the drop zone or use the Browse button
3. **Play** - The emulator will load automatically and you can start playing

Your recently played games will be saved in your browser for quick access. No ROMs are included with this emulator - you need to provide your own files.

## Features

- **Drag & Drop Interface** - Easily load your own ROM files
- **Multiple Systems** - Supports Game Boy Advance, NES, SNES, N64, and PlayStation
- **Save States** - Save your progress at any time
- **Recent Games** - Quick access to your recently played games
- **Mobile Support** - Touch controls for mobile devices
- **Game Saves** - All saves stored locally in your browser
- **Gamepad Support** - Connect a controller for the best experience

## How It Works

This implementation uses the official EmulatorJS CDN at `https://cdn.emulatorjs.org/stable/data/` to load all required emulator files. The emulator runs entirely in your browser - no files are uploaded to any server.

## Supported Systems and File Types

- **Game Boy Advance (GBA)** - `.gba` files
- **Nintendo Entertainment System (NES)** - `.nes` files
- **Super Nintendo (SNES)** - `.sfc`, `.smc` files
- **Nintendo 64 (N64)** - `.n64`, `.z64`, `.v64` files
- **PlayStation (PS1)** - `.bin`, `.iso` files

## Secret Features

Find the hidden easter egg by entering the Konami Code on any page:
↑ ↑ ↓ ↓ ← → ← → B A

## Legal Notice

- The emulator is provided for educational and preservation purposes only
- No ROMs are included or distributed with this emulator
- You should only use ROM files for games that you legally own
- Support game developers by purchasing their games

## Credits

This implementation uses [EmulatorJS](https://emulatorjs.org/), which is a web-based frontend for RetroArch.

## Troubleshooting

If you encounter any issues:

1. Make sure you're using a modern browser
2. Check that your ROM files are compatible with the emulator
3. Try clearing your browser cache and reloading the page
4. Some games may require specific BIOS files to work properly

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

# EmulatorJS Implementation

This emulator implementation uses [EmulatorJS](https://emulatorjs.org/) to provide retro gaming capabilities directly in the browser.

## Features

- Supports multiple systems (NES, SNES, GBA)
- Uses the stable CDN version of EmulatorJS
- Save states and game progress are stored in your browser
- Mobile-friendly with touch controls
- Gamepad support for desktop users

## How It Works

This implementation uses the official EmulatorJS CDN at `https://cdn.emulatorjs.org/stable/data/` to load all required emulator files. No local installation of EmulatorJS is required.

## Adding Your Own ROMs

To play games, you need to replace the placeholder ROM files with your own legally owned ROM files. The placeholder files are located in:

- `roms/gba/` - For Game Boy Advance games
- `roms/nes/` - For Nintendo Entertainment System games
- `roms/snes/` - For Super Nintendo games

Make sure to keep the filenames the same as the placeholders to ensure compatibility.

## Legal Notice

- Only use ROM files for games that you legally own
- The emulator is provided for educational and preservation purposes only
- Support game developers by purchasing their games

## Credits

This implementation uses [EmulatorJS](https://emulatorjs.org/), which is a web-based frontend for RetroArch.

## Adding More Games

To add more games:

1. Add the ROM file to the appropriate system folder
2. Update the game list in `play.html` to include the new game

## Troubleshooting

If you encounter any issues:

1. Make sure you're using a modern browser
2. Check that your ROM files are compatible with the emulator
3. Try using the latest version of EmulatorJS by changing the CDN URL in `play.html` 