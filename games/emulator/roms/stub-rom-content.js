/**
 * Enhanced ROM Simulation for EmulatorJS
 * 
 * This file provides ROM simulation data for EmulatorJS to use.
 * It creates minimal valid ROM structures that can be loaded by the emulator,
 * but prompts the user to upload their own ROM for the full experience.
 * 
 * No actual game code is included - these are just header structures.
 */

// Function to create an EmulatorJS compatible ROM data for different systems
function createRomData(system, title) {
  // Create ROM header based on system type
  switch (system) {
    case 'gb':
    case 'gbc':
      // GameBoy/GameBoy Color ROM header structure
      return createGameBoyRomData(title);
    case 'gba':
      // GameBoy Advance ROM header structure
      return createGbaRomData(title);
    case 'nes':
      // NES ROM header structure
      return createNesRomData(title);
    case 'snes':
      // SNES ROM header structure
      return createSnesRomData(title);
    case 'nds':
      // Nintendo DS ROM header structure
      return createNdsRomData(title);
    case 'genesis':
      // Genesis/Mega Drive ROM header structure
      return createGenesisRomData(title);
    case 'n64':
      // Nintendo 64 ROM header structure
      return createN64RomData(title);
    default:
      // Generic ROM header for other systems
      return createGenericRomData(title);
  }
}

// Create GameBoy/GameBoy Color ROM data
function createGameBoyRomData(title) {
  // Convert title to uppercase and pad/truncate to 15 characters
  const gameTitle = title.toUpperCase().padEnd(15, ' ').substring(0, 15);
  
  // Create a minimal valid GB header
  const header = new Uint8Array([
    // Nintendo logo (compressed) - required for bootrom check
    0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B, 0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D,
    0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E, 0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99,
    
    // Game title (positions 0x134-0x143)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)),
    
    // Manufacturer code and CGB flag
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // New licensee code
    0x00, 0x00,
    
    // SGB flag (0 = no SGB functions)
    0x00,
    
    // Cartridge type (0x00 = ROM ONLY)
    0x00,
    
    // ROM size (0x00 = 32KB)
    0x00,
    
    // RAM size (0x00 = None)
    0x00,
    
    // Destination code (0x00 = Japanese, 0x01 = Non-Japanese)
    0x01,
    
    // Old licensee code (0x33 = use new licensee code)
    0x33,
    
    // ROM version (0x00 = 1.0)
    0x00,
    
    // Header checksum (just a placeholder, not real)
    0xFF,
    
    // Global checksum (just a placeholder, not real)
    0xFF, 0xFF
  ]);
  
  // Fill remaining ROM space with zeros to make a minimal ROM
  const romData = new Uint8Array(32768); // 32KB minimal ROM size
  romData.set(header, 0x100); // GB header starts at 0x100
  
  // Put a simple message at the starting entrypoint
  const message = "This is a demo ROM. Please upload your own ROM for the full game experience.";
  for (let i = 0; i < message.length; i++) {
    romData[0x150 + i] = message.charCodeAt(i);
  }
  
  return romData;
}

// Create GameBoy Advance ROM data
function createGbaRomData(title) {
  // Truncate title to 12 characters
  const gameTitle = title.substring(0, 12);
  
  // Create a minimal valid GBA header (96 bytes)
  const header = new Uint8Array([
    // ROM entry point (32 bytes)
    0x00, 0x00, 0x00, 0xEA, // Branch instruction
    0x24, 0xFF, 0xAE, 0x51, // Nintendo logo part 1
    0x69, 0x9A, 0xA2, 0x21, // Nintendo logo part 2
    0x3D, 0x84, 0x82, 0x0A, // Nintendo logo part 3
    0x84, 0xE4, 0x09, 0xAD, // Nintendo logo part 4
    0x11, 0x24, 0x8B, 0x98, // Nintendo logo part 5
    0xC0, 0x81, 0x7F, 0x21, // Nintendo logo part 6
    0xA3, 0x52, 0xBE, 0x19, // Nintendo logo part 7
    0x93, 0x09, 0xCE, 0x20, // Nintendo logo part 8
    
    // Game title (12 bytes, positions 0xA0-0xAB)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)).concat(Array(12 - gameTitle.length).fill(0)),
    
    // Game code (4 bytes)
    0x50, 0x4F, 0x4B, 0x45, // "POKE"
    
    // Maker code (2 bytes)
    0x30, 0x31, // "01" - Nintendo
    
    // Fixed value (0x96)
    0x96,
    
    // Main unit code (0x00)
    0x00,
    
    // Device type (0x00)
    0x00,
    
    // Reserved (7 bytes)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // Software version (0x00)
    0x00,
    
    // Checksum (1 byte, just a placeholder)
    0xFF,
    
    // Reserved (2 bytes)
    0x00, 0x00
  ]);
  
  // Create a 256KB ROM (minimal viable size for a GBA ROM)
  const romData = new Uint8Array(262144);
  romData.set(header);
  
  return romData;
}

// Create NES ROM data
function createNesRomData(title) {
  // NES has no title in the ROM header, but we'll create a valid iNES header
  const header = new Uint8Array([
    0x4E, 0x45, 0x53, 0x1A, // "NES" followed by MS-DOS EOF
    0x01, // 1 x 16KB PRG ROM
    0x01, // 1 x 8KB CHR ROM
    0x00, // Mapper 0, no mirroring, no battery, no trainer
    0x00, // Mapper 0, VS/Playchoice, NES 2.0
    0x00, // No PRG RAM
    0x00, // NTSC format
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // Unused/padding
  ]);
  
  // Create a 24KB ROM (16KB PRG + 8KB CHR)
  const romData = new Uint8Array(24576);
  romData.set(header);
  
  return romData;
}

// Create SNES ROM data
function createSnesRomData(title) {
  // Truncate title to 21 characters
  const gameTitle = title.toUpperCase().padEnd(21, ' ').substring(0, 21);
  
  // Create a minimal valid SNES header (placed at position 0x7FC0 for LoROM)
  const header = new Uint8Array([
    // Game title (21 bytes)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)),
    
    // ROM makeup byte (LoROM, no FastROM, no SRAM, no battery)
    0x20,
    
    // ROM type (00 = ROM only)
    0x00,
    
    // ROM size (08 = 256 KBytes)
    0x08,
    
    // SRAM size (00 = None)
    0x00,
    
    // Country code (01 = USA)
    0x01,
    
    // License code (00)
    0x00,
    
    // Version (v1.0)
    0x00,
    
    // Checksum complement (placeholder)
    0xFF, 0xFF,
    
    // Checksum (placeholder)
    0xFF, 0xFF,
    
    // Unused
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // Native/Emulation vectors
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  
  // Create a 256KB ROM (minimal viable size for a SNES ROM)
  const romData = new Uint8Array(262144);
  romData.set(header, 0x7FC0); // Place the header at the right position for LoROM
  
  return romData;
}

// Create Nintendo DS ROM data
function createNdsRomData(title) {
  // Truncate title to 12 characters
  const gameTitle = title.substring(0, 12);
  
  // Create a minimal NDS header (minimal fields only)
  const header = new Uint8Array([
    // Game title (12 bytes)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)).concat(Array(12 - gameTitle.length).fill(0)),
    
    // Game code (4 bytes)
    0x50, 0x4F, 0x4B, 0x45, // "POKE"
    
    // Maker code (2 bytes)
    0x30, 0x31, // "01" - Nintendo
    
    // Device code
    0x00,
    
    // Empty fields (9 bytes)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // ROM version
    0x00,
    
    // Autostart (bit 2 set for autostart)
    0x04,
    
    // More header fields would follow in a real NDS ROM
  ]);
  
  // Create a 1MB ROM (not enough for a real NDS ROM but good enough for demo)
  const romData = new Uint8Array(1048576);
  romData.set(header);
  
  return romData;
}

// Create SEGA Genesis/Mega Drive ROM data
function createGenesisRomData(title) {
  // Truncate and pad title to 48 characters
  const gameTitle = title.padEnd(48, ' ').substring(0, 48);
  
  // Create a minimal Genesis header
  const header = new Uint8Array([
    // Console name (16 bytes)
    ...Array.from("SEGA GENESIS    ").map(c => c.charCodeAt(0)),
    
    // Copyright (16 bytes)
    ...Array.from("(C)SEGA 2023.APR").map(c => c.charCodeAt(0)),
    
    // Domestic name (48 bytes)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)),
    
    // Overseas name (48 bytes) - same as domestic in this case
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)),
    
    // Serial number (14 bytes)
    ...Array.from("GM 00000000-00").map(c => c.charCodeAt(0)),
    
    // Checksum (2 bytes)
    0xFF, 0xFF,
    
    // Device support (16 bytes)
    ...Array.from("J               ").map(c => c.charCodeAt(0)),
    
    // ROM start address (4 bytes)
    0x00, 0x00, 0x00, 0x00,
    
    // ROM end address (4 bytes) - 512KB
    0x00, 0x07, 0xFF, 0xFF,
    
    // RAM start/end and more header information would follow...
  ]);
  
  // Create a 512KB ROM
  const romData = new Uint8Array(524288);
  romData.set(header, 0x100); // Genesis header starts at 0x100
  
  return romData;
}

// Create Nintendo 64 ROM data
function createN64RomData(title) {
  // N64 ROM header is complex and varies by region
  // This is a simplified version with just the essential parts
  
  // Truncate title to 20 characters
  const gameTitle = title.substring(0, 20);
  
  // Create a minimal N64 header
  const header = new Uint8Array([
    // PI BSB Domain 1 register value
    0x80, 0x37, 0x12, 0x40,
    
    // Clock rate setting
    0x00, 0x00, 0x00, 0x0F,
    
    // Program counter
    0x80, 0x00, 0x00, 0x0C,
    
    // Release address
    0x00, 0x00, 0x00, 0x00,
    
    // CRC1
    0x00, 0x00, 0x00, 0x00,
    
    // CRC2
    0x00, 0x00, 0x00, 0x00,
    
    // Unknown/unused
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // Image name (20 bytes)
    ...Array.from(gameTitle).map(c => c.charCodeAt(0)).concat(Array(20 - gameTitle.length).fill(0)),
    
    // Unknown/unused
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    
    // Manufacturer ID
    0x00, 0x00, 0x00, 0x00,
    
    // Cartridge ID
    0x00, 0x00,
    
    // Country code (D = Germany, E = USA, J = Japan)
    0x45, // 'E' for USA
    
    // Version
    0x00
  ]);
  
  // Create a 1MB ROM (not enough for a real N64 ROM but good for demo)
  const romData = new Uint8Array(1048576);
  romData.set(header);
  
  return romData;
}

// Create generic ROM data for other systems
function createGenericRomData(title) {
  // Create a generic 64KB ROM with title embedded
  const romData = new Uint8Array(65536);
  
  // Put the title at the beginning
  for (let i = 0; i < Math.min(title.length, 32); i++) {
    romData[i] = title.charCodeAt(i);
  }
  
  return romData;
}

// Export for use in other JS files if needed
export {
  createRomData,
  createGameBoyRomData,
  createGbaRomData,
  createNesRomData,
  createSnesRomData,
  createNdsRomData,
  createGenesisRomData,
  createN64RomData,
  createGenericRomData
}; 