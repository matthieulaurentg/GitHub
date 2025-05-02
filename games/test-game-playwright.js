import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGame(gameSlug) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Store logs
    const logs = {
        errors: [],
        warnings: [],
        info: []
    };

    // Listen to console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        switch (type) {
            case 'error':
                console.error('❌ Console Error:', text);
                logs.errors.push(text);
                break;
            case 'warning':
                console.warn('⚠️ Console Warning:', text);
                logs.warnings.push(text);
                break;
            default:
                console.log('ℹ️ Console Log:', text);
                logs.info.push(text);
        }
    });

    // Listen to page errors
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
        logs.errors.push(error.message);
    });

    // Listen to failed resources
    page.on('requestfailed', request => {
        const failure = request.failure();
        const errorMessage = `Failed to load resource: ${request.url()} - ${failure?.errorText || 'unknown error'}`;
        console.error('❌ Resource Error:', errorMessage);
        logs.errors.push(errorMessage);
    });

    try {
        // Navigate to the game
        await page.goto(`http://localhost:5500/games/${gameSlug}`);
        
        // Wait for potential game initialization
        await page.waitForTimeout(3000);

        // Print summary
        console.log('\n📊 Test Summary:');
        if (logs.errors.length === 0 && logs.warnings.length === 0) {
            console.log('✅ No errors or warnings detected');
        } else {
            if (logs.errors.length > 0) {
                console.log('\n🔴 Errors:', logs.errors.length);
                logs.errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
            }
            if (logs.warnings.length > 0) {
                console.log('\n🟡 Warnings:', logs.warnings.length);
                logs.warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
            }
        }

        // Take a screenshot if there were errors
        if (logs.errors.length > 0) {
            const screenshotPath = resolve(__dirname, 'test-screenshots', `${gameSlug.replace(/\//g, '-')}-error.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    } finally {
        await browser.close();
    }

    // Exit with error code if there were errors
    if (logs.errors.length > 0) {
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