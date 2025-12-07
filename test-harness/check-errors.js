/**
 * Check for JavaScript errors in the game
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:8080';

async function checkErrors() {
    console.log('🔍 Checking for JavaScript errors...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1000, height: 1000 }
    });
    const page = await context.newPage();

    const errors = [];
    const consoleMessages = [];

    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            console.log(`❌ Console Error: ${text}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`❌ Page Error: ${error.message}`);
    });

    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);

        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`\n⚠️  Found ${errors.length} error(s)`);
        }

        console.log('\n📋 Console messages:');
        consoleMessages.slice(0, 20).forEach(({ type, text }) => {
            console.log(`  [${type}] ${text}`);
        });

    } catch (error) {
        console.error('❌ Failed to load page:', error.message);
    } finally {
        await browser.close();
    }
}

checkErrors();
