/**
 * Set Reference Screenshots
 *
 * Copies current screenshots to the reference directory.
 * Use this when you've verified that the current screenshots are correct
 * and want to use them as the "golden" reference for future comparisons.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REFERENCE_DIR = path.join(__dirname, 'screenshots-reference');
const SCREENSHOT_TIMES = [1000, 5000, 10000];

console.log('📌 Setting reference screenshots...');

let copiedCount = 0;
SCREENSHOT_TIMES.forEach(time => {
    const sourceFile = path.join(SCREENSHOTS_DIR, `screenshot-${time}ms.jpg`);
    const refFile = path.join(REFERENCE_DIR, `screenshot-${time}ms.jpg`);

    if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, refFile);
        console.log(`  ✓ Copied screenshot-${time}ms.jpg to reference`);
        copiedCount++;
    } else {
        console.log(`  ✗ Source file not found: screenshot-${time}ms.jpg`);
    }
});

console.log(`\n✅ Set ${copiedCount} reference screenshot(s)`);
console.log('These will now be used as the "golden" reference for future test runs.');
