/**
 * Automated Test Harness for Blob Army
 *
 * This script:
 * 1. Loads index.html in a headless browser
 * 2. Clicks the PLAY button to enter PLAYING state
 * 3. Randomly presses LEFT/RIGHT for 10 seconds
 * 4. Takes screenshots at 1s, 5s, and 10s
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TEST_DURATION = 10000; // 10 seconds
const SCREENSHOT_TIMES = [1000, 5000, 10000]; // 1s, 5s, 10s
const SCREENSHOT_DIR = join(__dirname, 'screenshots');
const INDEX_PATH = join(__dirname, '..', 'index.html');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Random input generator
function randomInput() {
    return Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight';
}

async function runTest() {
    console.log('🚀 Starting Blob Army Test Harness...');
    console.log(`📄 Loading: ${INDEX_PATH}`);

    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        defaultViewport: {
            width: 1280,
            height: 720
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--autoplay-policy=no-user-gesture-required' // Allow audio autoplay
        ]
    });

    const page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log('🎮 Game:', msg.text());
        }
    });

    // Navigate to index.html
    const fileUrl = `file://${INDEX_PATH}`;
    console.log(`🌐 Navigating to: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle2' });

    // Wait for the page to be fully loaded
    await page.waitForSelector('#gameCanvas');
    console.log('✅ Game canvas loaded');

    // Wait for the play button overlay to appear
    await page.waitForSelector('#playButtonLarge', { visible: true });
    console.log('✅ Play button found');

    // Click the play button to enter PLAYING state
    console.log('🎯 Clicking PLAY button...');
    await page.click('#playButtonLarge');

    // Wait a bit for the game to transition to PLAYING state
    await page.waitForTimeout(500);
    console.log('✅ Entered PLAYING state');

    // Get game state to verify
    const gameState = await page.evaluate(() => {
        return {
            state: window.game?.state || 'unknown',
            isRunning: window.game?.running || false
        };
    });
    console.log(`📊 Game state: ${gameState.state}, Running: ${gameState.isRunning}`);

    // Start random input simulation
    console.log('🎮 Starting random input simulation for 10 seconds...');
    const startTime = Date.now();
    const screenshotPromises = [];

    // Schedule screenshots
    SCREENSHOT_TIMES.forEach(time => {
        screenshotPromises.push(
            new Promise(async (resolve) => {
                await page.waitForTimeout(time);
                const screenshotPath = join(SCREENSHOT_DIR, `screenshot-${time / 1000}s.png`);
                await page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`📸 Screenshot taken at ${time / 1000}s: ${screenshotPath}`);
                resolve(screenshotPath);
            })
        );
    });

    // Random input loop
    const inputInterval = setInterval(async () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= TEST_DURATION) {
            clearInterval(inputInterval);
            return;
        }

        const key = randomInput();
        await page.keyboard.down(key);

        // Hold key for random duration (100-300ms)
        const holdDuration = 100 + Math.random() * 200;
        await page.waitForTimeout(holdDuration);

        await page.keyboard.up(key);

        // Wait a bit before next input (50-150ms)
        const waitDuration = 50 + Math.random() * 100;
        await page.waitForTimeout(waitDuration);
    }, 150); // Try to send input every 150ms

    // Wait for all screenshots to complete
    const paths = await Promise.all(screenshotPromises);

    // Wait a bit more to ensure 10s screenshot is taken
    await page.waitForTimeout(500);

    // Get final game stats
    const finalStats = await page.evaluate(() => {
        const player = window.game?.entities?.find(e => e.constructor.name === 'Player');
        return {
            distance: window.game?.getDistanceInMeters() || 0,
            blobCount: player?.getBlobCount() || 0,
            state: window.game?.state || 'unknown'
        };
    });

    console.log('📊 Final Stats:');
    console.log(`   Distance: ${finalStats.distance.toFixed(1)}m`);
    console.log(`   Blob Count: ${finalStats.blobCount}`);
    console.log(`   State: ${finalStats.state}`);

    console.log('\n✅ Test completed successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\nScreenshot paths:');
    paths.forEach(path => console.log(`   - ${path}`));

    // Keep browser open for a moment to see final state
    await page.waitForTimeout(2000);

    await browser.close();

    return paths;
}

// Run the test
runTest()
    .then((paths) => {
        console.log('\n🎉 Test harness completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
