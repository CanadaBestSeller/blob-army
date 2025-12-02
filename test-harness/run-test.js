/**
 * Test Harness for Blob Army
 *
 * This script automates testing of index.html by:
 * 1. Loading the game
 * 2. Entering PLAY state
 * 3. Randomly pressing LEFT/RIGHT for 10 seconds
 * 4. Taking screenshots at 1s, 5s, and 10s
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:8080';
const TEST_DURATION = 10000; // 10 seconds
const SCREENSHOT_TIMES = [1000, 5000, 10000]; // 1s, 5s, 10s
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Main test function
 */
async function runTest() {
    console.log('🚀 Starting Blob Army test harness...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 30000
        });
        console.log('✅ Browser launched successfully');
    } catch (error) {
        console.error('❌ Failed to launch browser:', error.message);
        console.error('Full error:', error);
        throw error;
    }

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📄 Loading index.html...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

        // Wait for game to initialize
        await page.waitForSelector('#gameCanvas', { timeout: 5000 });
        console.log('✅ Game loaded successfully');

        // Wait for the play button overlay and click it to enter PLAY state
        console.log('🎮 Entering PLAY state...');
        await page.waitForSelector('.play-button-large', { timeout: 5000 });
        await page.click('.play-button-large');

        // Wait a moment for the game to start
        await page.waitForTimeout(500);

        // Verify we're in PLAYING state
        const gameState = await page.evaluate(() => {
            // Access the game instance from the module script
            return window.game?.state || 'UNKNOWN';
        });
        console.log(`📊 Game state: ${gameState}`);

        // Start random input simulation
        console.log('⌨️  Starting random LEFT/RIGHT inputs for 10 seconds...');

        const startTime = Date.now();
        const screenshots = [];

        // Create a promise-based input simulator that also captures screenshots
        const runTest = async () => {
            let lastInputTime = Date.now();
            let screenshotIndex = 0;

            while (Date.now() - startTime < TEST_DURATION) {
                const elapsed = Date.now() - startTime;

                // Check if we need to take a screenshot
                if (screenshotIndex < SCREENSHOT_TIMES.length &&
                    elapsed >= SCREENSHOT_TIMES[screenshotIndex]) {
                    const time = SCREENSHOT_TIMES[screenshotIndex];
                    const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.png`);
                    await page.screenshot({ path: filename, fullPage: false });
                    console.log(`📸 Screenshot taken at ${(time/1000).toFixed(1)}s`);
                    screenshots.push({ time, filename });
                    screenshotIndex++;
                }

                // Randomly choose LEFT or RIGHT
                const key = Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight';

                // Press and hold for a random duration (50-200ms)
                const holdDuration = Math.floor(Math.random() * 150) + 50;

                await page.keyboard.down(key);
                await page.waitForTimeout(holdDuration);
                await page.keyboard.up(key);

                // Wait a bit before next input (20-100ms)
                const waitDuration = Math.floor(Math.random() * 80) + 20;
                await page.waitForTimeout(waitDuration);
            }

            // Capture any remaining screenshots
            while (screenshotIndex < SCREENSHOT_TIMES.length) {
                const time = SCREENSHOT_TIMES[screenshotIndex];
                const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.png`);
                await page.screenshot({ path: filename, fullPage: false });
                console.log(`📸 Screenshot taken at ${(time/1000).toFixed(1)}s`);
                screenshots.push({ time, filename });
                screenshotIndex++;
            }
        };

        await runTest();

        console.log('✅ Test completed successfully!');
        console.log('\n📸 Screenshots captured:');
        screenshots.forEach(({ time, filename }) => {
            console.log(`  - ${(time/1000).toFixed(1)}s: ${filename}`);
        });

        // Display screenshots in terminal (just the paths)
        console.log('\n📁 Screenshot files:');
        SCREENSHOT_TIMES.forEach(time => {
            const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.png`);
            if (fs.existsSync(filename)) {
                console.log(`  ✓ ${filename}`);
            }
        });

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
        console.log('\n🏁 Test harness finished');
    }
}

// Run the test
runTest().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
