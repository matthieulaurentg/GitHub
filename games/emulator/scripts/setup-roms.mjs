/**
 * ROM Setup Script
 * Creates necessary directory structure for ROMs if it doesn't exist
 */

// Run when the document loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Checking ROM directory structure...");
    checkRomDirectories();
});

// Check if ROM directories exist
async function checkRomDirectories() {
    const statusElement = document.getElementById('rom-status');
    if (!statusElement) return;
    
    const directoryStructure = [
        'roms/',
        'roms/gba/',
        'roms/nes/',
        'roms/snes/',
        'roms/gb/',
        'roms/n64/'
    ];
    
    let allExist = true;
    let missingDirs = [];
    
    // Check each directory
    for (const dir of directoryStructure) {
        try {
            const response = await fetch(dir, { method: 'HEAD' });
            if (!response.ok) {
                allExist = false;
                missingDirs.push(dir);
            }
        } catch (error) {
            allExist = false;
            missingDirs.push(dir);
        }
    }
    
    // Update status
    if (allExist) {
        statusElement.innerHTML = '<span style="color: #00aa00;">✓ ROM directories found.</span>';
    } else {
        statusElement.innerHTML = `
            <span style="color: #aa0000;">! Some ROM directories are missing:</span>
            <ul style="text-align: left; color: #ffaaaa;">
                ${missingDirs.map(dir => `<li>${dir}</li>`).join('')}
            </ul>
            <p>Please create these directories manually or use the direct upload option.</p>
        `;
        
        // Show the fallback section
        const fallbackSection = document.getElementById('directory-fallback');
        if (fallbackSection) {
            fallbackSection.style.display = 'block';
        }
    }
}

// Export the function for use in other scripts
export { checkRomDirectories }; 