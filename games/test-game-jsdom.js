import jsdom from 'jsdom';
import fetch from 'node-fetch';
const { JSDOM } = jsdom;

async function testGame(gameSlug) {
    try {
        // Create virtual console to capture errors
        const virtualConsole = new jsdom.VirtualConsole();
        let errors = [];
        let resourceErrors = [];

        // Log errors
        virtualConsole.on('error', (error) => {
            console.error('❌ JavaScript Error:', error.message);
            errors.push(error.message);
        });

        virtualConsole.on('warn', (warn) => {
            console.warn('⚠️ Warning:', warn);
        });

        // Set up JSDOM options with custom resource loader
        const options = {
            runScripts: 'dangerously',
            resources: new jsdom.ResourceLoader({
                strictSSL: false,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                proxy: null,
                fetch: async (url, options) => {
                    try {
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            const error = `Failed to load resource: ${url} (${response.status})`;
                            console.error('❌ Resource Error:', error);
                            resourceErrors.push(error);
                        }
                        return response;
                    } catch (error) {
                        console.error('❌ Resource Error:', error.message);
                        resourceErrors.push(error.message);
                        throw error;
                    }
                }
            }),
            pretendToBeVisual: true,
            virtualConsole
        };

        // Try to fetch the game page
        const response = await fetch(`http://localhost:5500/games/${gameSlug}`);
        const html = await response.text();

        // Create JSDOM instance
        const dom = new JSDOM(html, options);

        // Add missing Kaboom globals
        dom.window.rgba = (r, g, b, a) => ({ r, g, b, a });
        
        // Wait for potential async operations and resource loading
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Report results
        if (errors.length === 0 && resourceErrors.length === 0) {
            console.log('✅ No errors detected');
        } else {
            console.log('\n📊 Test Summary:');
            if (errors.length > 0) {
                console.log('\n🔴 JavaScript Errors:');
                errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
            }
            if (resourceErrors.length > 0) {
                console.log('\n🔴 Resource Loading Errors:');
                resourceErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
            }
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        process.exit(1);
    }
}

// Get game slug from command line arguments
const gameSlug = process.argv[2];

if (!gameSlug) {
    console.error('Please provide a game slug as an argument');
    process.exit(1);
}

console.log(`🎮 Testing game: ${gameSlug}`);
testGame(gameSlug); 