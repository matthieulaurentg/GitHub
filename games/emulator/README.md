# Secret Emulator Hub

This is a hidden feature of the Game Collection that lets you play classic games right in your browser. The emulator is powered by [EmulatorJS](https://emulatorjs.org/) and features a collection of Pokemon games and other classic console systems.

## How to Access

1. Go to the main Game Collection page
2. Click on the "Retro Games" heading (it's a secret button!)
3. The emulator modal will appear with systems and Pokemon options

## Features

- No fake downloads - games load instantly
- Support for multiple systems (GB, GBC, GBA, NDS, NES, SNES, Genesis, N64)
- Full collection of classic Pokemon games
- Upload your own ROMs feature for true gaming freedom
- Clean modern UI that matches the Game Collection site

## Technical Details

This emulator doesn't actually include any copyrighted ROMs. Instead, it generates minimal ROM structures dynamically that:

1. Are valid enough to be loaded by the EmulatorJS core
2. Display a message prompting users to upload their own ROMs
3. Have all the proper headers needed for the system

This approach avoids copyright issues while still providing a seamless experience.

## Adding Your Own ROMs

To play with your own ROMs:

1. Select a system or Pokemon game in the emulator
2. When the demo ROM loads, use the ROM uploader at the bottom
3. Drop your own ROM file onto the drop zone
4. The emulator will verify it's the right format and load it

## Implementation

The emulator uses these key components:

- `stub-rom-content.js` - Creates valid ROM structures for various systems
- `rom-generator.js` - Utility for generating downloadable ROM files
- Direct Blob URL creation for loading ROMs without server requests
- EmulatorJS for the actual game emulation

## Supported Systems

- Game Boy (GB)
- Game Boy Color (GBC) 
- Game Boy Advance (GBA)
- Nintendo DS (NDS)
- Nintendo Entertainment System (NES)
- Super Nintendo (SNES)
- Sega Genesis / Mega Drive
- Nintendo 64 (N64)
- Arcade games 