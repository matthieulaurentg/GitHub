import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createServer } from 'http';
import { createReadStream, statSync } from 'fs';
import { parse } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make sure screenshots directory exists
const screenshotsDir = join(__dirname, 'games', 'test-screenshots');
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

// Simple HTTP server to serve the game files
function startServer() {
  return new Promise((resolve) => {
    const PORT = 8080;
    const server = createServer((req, res) => {
      try {
        // Normalize the URL to remove query strings and get the file path
        let url = req.url.split('?')[0];
        if (url === '/') url = '/index.html';
        
        // Construct the file path
        const filePath = join(__dirname, url);
        
        // Check if file exists
        if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
          // If the path is a directory, try to serve index.html from it
          const indexPath = join(filePath, 'index.html');
          if (existsSync(indexPath)) {
            serveFile(indexPath, res);
            return;
          }
          
          res.writeHead(404);
          res.end('File not found');
          return;
        }
        
        serveFile(filePath, res);
      } catch (err) {
        console.error('Server error:', err);
        res.writeHead(500);
        res.end('Server error');
      }
    });
    
    function serveFile(filePath, res) {
      const ext = parse(filePath).ext;
      const contentType = getContentType(ext);
      
      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(filePath).pipe(res);
    }
    
    function getContentType(ext) {
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      
      return contentTypes[ext] || 'application/octet-stream';
    }
    
    server.listen(PORT, () => {
      console.log(`🌐 Server running at http://localhost:${PORT}/`);
      resolve({ server, port: PORT });
    });
  });
}

async function testGame(gamePath, serverInfo) {
  // Extract the game name for display purposes
  const gameName = gamePath.split('/').pop().replace('.html', '');
  console.log(`\n🎮 Testing game: ${gameName}`);

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
              // Don't log info messages to keep output clean
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
      // Determine the URL to access the game
      let url;
      
      if (gamePath.endsWith('.html')) {
          url = `http://localhost:${serverInfo.port}/${gamePath}`;
      } else {
          url = `http://localhost:${serverInfo.port}/${gamePath}/index.html`;
      }
      
      console.log(`📡 Accessing: ${url}`);
      
      // Navigate to the game
      await page.goto(url);
      
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

      // Take a screenshot
      const screenshotName = gamePath.replace(/\//g, '-').replace('.html', '');
      const screenshotPath = join(screenshotsDir, `${screenshotName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);

  } catch (error) {
      console.error('❌ Test Failed:', error.message);
  } finally {
      await browser.close();
  }

  return logs.errors.length === 0;
}

// Get game path from command line arguments
const gamePath = process.argv[2];

// List of retro games to test if no specific game is provided
const retroGames = [
  'games/tetris3d',
  'games/uno',
  'games/clicker.html',
  'games/snake.html',
  'games/tetris.html',
  'games/tictactoe.html',
  'games/blackjack.html'
];

// Also test Tea Simulator
const allGames = [...retroGames, 'games/tea_sim_three'];

// Main function to run the tests
async function runTests() {
  console.log('🚀 Starting test server...');
  const serverInfo = await startServer();
  
  try {
    // If a specific game path is provided, test only that game
    if (gamePath) {
      await testGame(gamePath, serverInfo);
    } else {
      // Test all retro games and Tea Simulator
      console.log('🎮 Testing all games...');
      let failedTests = 0;
      
      for (const game of allGames) {
        const success = await testGame(game, serverInfo);
        if (!success) failedTests++;
      }
      
      console.log(`\n🏁 Testing complete. ${failedTests} games had errors.`);
      
      if (failedTests > 0) {
        process.exit(1);
      }
    }
  } finally {
    console.log('🛑 Shutting down server...');
    serverInfo.server.close();
  }
}

runTests(); 