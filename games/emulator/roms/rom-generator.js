/**
 * ROM Generator for EmulatorJS
 * 
 * This script generates minimal valid ROM files for various systems
 * These files work with EmulatorJS but don't contain any actual game code
 * They display a message telling the user to upload their own ROMs for the full experience
 */

// Import the ROM creation functions
import * as romCreator from './stub-rom-content.js';

// Function to convert a Uint8Array to a downloadable Blob
function createDownloadableBlob(romData, fileName) {
  const blob = new Blob([romData], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}

// Generate GameBoy ROMs
function generateGameBoyRom(title, fileName) {
  const romData = romCreator.createGameBoyRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate GameBoy Color ROMs
function generateGbcRom(title, fileName) {
  const romData = romCreator.createGameBoyRomData(title); // Same structure as GameBoy
  return createDownloadableBlob(romData, fileName);
}

// Generate GameBoy Advance ROMs
function generateGbaRom(title, fileName) {
  const romData = romCreator.createGbaRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate NES ROMs
function generateNesRom(title, fileName) {
  const romData = romCreator.createNesRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate SNES ROMs
function generateSnesRom(title, fileName) {
  const romData = romCreator.createSnesRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate Nintendo DS ROMs
function generateNdsRom(title, fileName) {
  const romData = romCreator.createNdsRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate Sega Genesis/Mega Drive ROMs
function generateGenesisRom(title, fileName) {
  const romData = romCreator.createGenesisRomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate Nintendo 64 ROMs
function generateN64Rom(title, fileName) {
  const romData = romCreator.createN64RomData(title);
  return createDownloadableBlob(romData, fileName);
}

// Generate ROM files for demonstration
function generateAllRoms() {
  // Pokemon GameBoy ROMs
  generateGameBoyRom('Pokemon Red', 'Pokemon-Red.gb');
  generateGameBoyRom('Pokemon Blue', 'Pokemon-Blue.gb');
  generateGameBoyRom('Pokemon Yellow', 'Pokemon-Yellow.gb');
  
  // Pokemon GameBoy Color ROMs
  generateGbcRom('Pokemon Gold', 'Pokemon-Gold.gbc');
  generateGbcRom('Pokemon Silver', 'Pokemon-Silver.gbc');
  generateGbcRom('Pokemon Crystal', 'Pokemon-Crystal.gbc');
  
  // Pokemon GameBoy Advance ROMs
  generateGbaRom('Pokemon Ruby', 'Pokemon-Ruby.gba');
  generateGbaRom('Pokemon Sapphire', 'Pokemon-Sapphire.gba');
  generateGbaRom('Pokemon Emerald', 'Pokemon-Emerald.gba');
  generateGbaRom('Pokemon FireRed', 'Pokemon-FireRed.gba');
  generateGbaRom('Pokemon LeafGreen', 'Pokemon-LeafGreen.gba');
  
  // Pokemon Nintendo DS ROMs
  generateNdsRom('Pokemon Diamond', 'Pokemon-Diamond.nds');
  generateNdsRom('Pokemon Pearl', 'Pokemon-Pearl.nds');
  generateNdsRom('Pokemon Platinum', 'Pokemon-Platinum.nds');
  generateNdsRom('Pokemon HeartGold', 'Pokemon-HeartGold.nds');
  generateNdsRom('Pokemon SoulSilver', 'Pokemon-SoulSilver.nds');
  
  // Demo ROMs for other systems
  generateGameBoyRom('GB Demo', 'gb-demo.gb');
  generateGbcRom('GBC Demo', 'gbc-demo.gbc');
  generateGbaRom('GBA Demo', 'gba-demo.gba');
  generateNdsRom('NDS Demo', 'nds-demo.nds');
  generateNesRom('NES Demo', 'nes-demo.nes');
  generateSnesRom('SNES Demo', 'snes-demo.sfc');
  generateGenesisRom('Genesis Demo', 'genesis-demo.md');
  generateN64Rom('N64 Demo', 'n64-demo.z64');
}

// Export the functions for use in other scripts
export {
  generateGameBoyRom,
  generateGbcRom,
  generateGbaRom,
  generateNesRom,
  generateSnesRom,
  generateNdsRom,
  generateGenesisRom,
  generateN64Rom,
  generateAllRoms
}; 