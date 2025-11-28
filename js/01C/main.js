/**
 * main.js
 * Entry point for 01C implementation
 */

import { GameParameters } from './game/GameParameters.js';

// Get canvas element
const canvas = document.getElementById('gameCanvas');

if (!canvas) {
    console.error('Canvas element not found!');
    throw new Error('Failed to initialize: Canvas element #gameCanvas not found');
}

// Get 2D context
const ctx = canvas.getContext('2d');

if (!ctx) {
    console.error('Failed to get 2D context!');
    throw new Error('Failed to initialize: Could not get 2D rendering context');
}

// Set canvas size to match container dimensions (fixed size, no resize)
function initCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    console.log(`Canvas initialized at ${canvas.width}x${canvas.height}`);
}

// Initialize canvas once
initCanvas();

// Test rendering - draw a simple background and text
ctx.fillStyle = GameParameters.COLOR_BACKGROUND;
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = GameParameters.COLOR_HUD_TEXT;
ctx.font = '24px Mulish, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Blob Army - 01C Implementation', canvas.width / 2, canvas.height / 2 - 20);
ctx.font = '16px Mulish, sans-serif';
ctx.fillText('Canvas initialized successfully!', canvas.width / 2, canvas.height / 2 + 20);
ctx.fillText(`Canvas size: ${canvas.width}x${canvas.height}`, canvas.width / 2, canvas.height / 2 + 50);

console.log('✅ 01C initialized successfully');
console.log('Canvas:', canvas);
console.log('Context:', ctx);
console.log('Game Parameters loaded');
