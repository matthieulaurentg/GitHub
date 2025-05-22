EmulatorJS CDN Implementation
===========================

This implementation uses the EmulatorJS CDN at https://cdn.emulatorjs.org/stable/data/
instead of local files. No local installation of EmulatorJS is required.

If you prefer to use a local installation of EmulatorJS:

1. Visit https://emulatorjs.org/ and download EmulatorJS
2. Extract the contents to this directory (games/emulator/data/)
3. Make sure that "loader.js" and other EmulatorJS files are directly in this directory
4. Update the play.html file to use local files instead of the CDN

ROM Files Setup:
---------------

Place your ROM files in the following directory structure:

games/emulator/roms/gba/pokemon-emerald.gba
games/emulator/roms/gba/mario-advance4.gba
games/emulator/roms/gba/zelda-minish-cap.gba

games/emulator/roms/nes/super-mario-bros.nes
games/emulator/roms/nes/zelda.nes
games/emulator/roms/nes/metroid.nes

games/emulator/roms/snes/super-mario-world.sfc
games/emulator/roms/snes/zelda-link-to-the-past.sfc
games/emulator/roms/snes/street-fighter-2.sfc

IMPORTANT NOTE:
--------------
This emulator is intended for educational and preservation purposes only. 
You should only use ROM files of games that you legally own.
Please support game developers by purchasing their games. 