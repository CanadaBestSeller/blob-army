/**
 * Test Harness for Blob Army (Playwright Version)
 *
 * This script automates testing of index.html by:
 * 1. Loading the game
 * 2. Entering PLAY state
 * 3. Randomly pressing LEFT/RIGHT for 10 seconds
 * 4. Taking screenshots at 1s, 5s, and 10s
 */

import { chromium } from 'playwright';
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
const REFERENCE_DIR = path.join(__dirname, 'screenshots-reference');
const PREVIOUS_DIR = path.join(__dirname, 'screenshots-previous');

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(REFERENCE_DIR)) {
    fs.mkdirSync(REFERENCE_DIR, { recursive: true });
}
if (!fs.existsSync(PREVIOUS_DIR)) {
    fs.mkdirSync(PREVIOUS_DIR, { recursive: true });
}

/**
 * Archive current screenshots to previous directory
 */
function archiveCurrentScreenshots() {
    console.log('📦 Archiving current screenshots to previous...');

    // Move current screenshots to previous directory
    SCREENSHOT_TIMES.forEach(time => {
        const currentFile = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.jpg`);
        const previousFile = path.join(PREVIOUS_DIR, `screenshot-${time}ms.jpg`);

        if (fs.existsSync(currentFile)) {
            fs.copyFileSync(currentFile, previousFile);
        }
    });
}

/**
 * Main test function
 */
async function runTest() {
    console.log('🚀 Starting Blob Army test harness (Playwright)...');

    // Archive existing screenshots before running new test
    archiveCurrentScreenshots();

    const browser = await chromium.launch({
        headless: true
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1000, height: 1000 }
        });

        const page = await context.newPage();

        console.log('📄 Loading index.html...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

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
            // The game variable might not be in global scope in ES modules
            // So we'll just check if the play overlay is hidden
            const playOverlay = document.getElementById('playOverlay');
            return playOverlay?.classList.contains('active') ? 'PREPLAY' : 'PLAYING';
        });
        console.log(`📊 Game state: ${gameState}`);

        // Start random input simulation
        console.log('⌨️  Starting random LEFT/RIGHT inputs for 10 seconds...');

        const startTime = Date.now();
        const screenshots = [];

        // Create a promise-based input simulator that also captures screenshots
        const runInputSimulation = async () => {
            let screenshotIndex = 0;

            while (Date.now() - startTime < TEST_DURATION) {
                const elapsed = Date.now() - startTime;

                // Check if we need to take a screenshot
                if (screenshotIndex < SCREENSHOT_TIMES.length &&
                    elapsed >= SCREENSHOT_TIMES[screenshotIndex]) {
                    const time = SCREENSHOT_TIMES[screenshotIndex];
                    const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.jpg`);
                    await page.screenshot({
                        path: filename,
                        fullPage: false,
                        type: 'jpeg',
                        quality: 50
                    });
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
                const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.jpg`);
                await page.screenshot({
                    path: filename,
                    fullPage: false,
                    type: 'jpeg',
                    quality: 50
                });
                console.log(`📸 Screenshot taken at ${(time/1000).toFixed(1)}s`);
                screenshots.push({ time, filename });
                screenshotIndex++;
            }
        };

        await runInputSimulation();

        console.log('✅ Test completed successfully!');
        console.log('\n📸 Screenshots captured:');
        screenshots.forEach(({ time, filename }) => {
            console.log(`  - ${(time/1000).toFixed(1)}s: ${filename}`);
        });

        // Display all screenshot locations
        console.log('\n📁 Screenshot directories:');
        console.log('  Current iteration:');
        SCREENSHOT_TIMES.forEach(time => {
            const filename = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.jpg`);
            if (fs.existsSync(filename)) {
                console.log(`    ✓ ${filename}`);
            }
        });

        console.log('  Previous iteration:');
        SCREENSHOT_TIMES.forEach(time => {
            const filename = path.join(PREVIOUS_DIR, `screenshot-${time}ms.jpg`);
            if (fs.existsSync(filename)) {
                console.log(`    ✓ ${filename}`);
            } else {
                console.log(`    - ${filename} (not available)`);
            }
        });

        console.log('  Reference (golden):');
        SCREENSHOT_TIMES.forEach(time => {
            const filename = path.join(REFERENCE_DIR, `screenshot-${time}ms.jpg`);
            if (fs.existsSync(filename)) {
                console.log(`    ✓ ${filename}`);
            } else {
                console.log(`    - ${filename} (not set - copy from screenshots/ to set reference)`);
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
