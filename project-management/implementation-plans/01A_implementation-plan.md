# Implementation Plan 01A: Three.js with Basic 3D Primitives

## Overview
Use Three.js (most popular WebGL library) with simple 3D geometric primitives. Focus on getting the 3D perspective and game mechanics working with minimal complexity.

## Technology Stack
- **3D Engine**: Three.js (r160+)
- **Rendering**: WebGL via Three.js
- **Architecture**: ES6 Modules + Three.js scene graph

## Visual Approach
- **Camera**: PerspectiveCamera at 45-degree angle
- **Blobs**: Simple spheres (SphereGeometry)
- **Gates**: Box geometry with text texture/sprite
- **Track**: Simple plane or subtle grid lines
- **Lighting**: Basic ambient + directional light

## File Structure
```
01A.html                       # Standalone HTML wrapper for Three.js implementation
js/01A/
├── main.js                    # Entry point, Three.js initialization
├── game/
│   ├── Game.js               # Main game loop and state
│   ├── GameState.js          # State constants
│   └── GameParameters.js     # Centralized parameters
├── scene/
│   ├── SceneManager.js       # Three.js scene setup
│   ├── CameraController.js   # Camera positioning and follow
│   └── LightingSetup.js      # Scene lighting
├── entities/
│   ├── Player.js             # Player blob group (Three.js Object3D)
│   ├── Gate.js               # Gate obstacle (Three.js Group)
│   └── Track.js              # Background track/lane markers
├── systems/
│   ├── InputManager.js       # Keyboard input
│   ├── CollisionDetector.js  # 3D collision detection
│   └── GateSpawner.js        # Gate spawning logic
└── ui/
    ├── HUD.js                # HTML overlay for HUD
    └── GameOverScreen.js     # Game over HTML overlay
```

## Implementation Steps

### Step 1: HTML Wrapper and Three.js Setup
**Files to create/modify:**
- `01A.html` - Standalone HTML file with Three.js CDN and canvas
- `js/01A/game/GameParameters.js` - All constants
- `js/01A/main.js` - Initialize Three.js renderer
- `js/01A/scene/SceneManager.js` - Create scene, camera, renderer

**Details:**
- Create `01A.html` with canvas element and Three.js CDN import
- Link to `js/01A/main.js` as module
- Create WebGL renderer, attach to canvas
- PerspectiveCamera with 45-degree angle (position: `{x: 0, y: 10, z: 10}`, lookAt: `{x: 0, y: 0, z: 0}`)
- Basic scene setup
- Animation loop with requestAnimationFrame

### Step 2: Basic Track/World
**Files to create/modify:**
- `js/01A/entities/Track.js` - Create visual track
- `js/01A/scene/LightingSetup.js` - Add lights

**Details:**
- Create ground plane or infinite grid
- Add lane markers (2 lanes clearly visible)
- Ambient + directional light for depth
- Test rendering and camera view

### Step 3: Player Entity (3D Blob)
**Files to create/modify:**
- `js/01A/entities/Player.js` - Player as Three.js Group

**Details:**
- Create sphere mesh for blob (SphereGeometry)
- Position at z=0, centered between lanes
- Horizontal movement (x-axis) based on input
- Boundary constraints
- Track blob count property

### Step 4: Input System
**Files to create/modify:**
- `js/01A/systems/InputManager.js` - Keyboard input tracking

**Details:**
- Arrow key tracking
- Provide clean API for game loop

### Step 5: World Scrolling (Camera/Object Movement)
**Files to create/modify:**
- `js/01A/game/Game.js` - Track scroll distance
- `js/01A/scene/CameraController.js` - Camera follows player

**Details:**
- Move obstacles toward camera (negative z direction)
- OR move camera forward (positive z direction)
- Track total distance traveled
- Convert to meters for score

### Step 6: Gate Entity (3D)
**Files to create/modify:**
- `js/01A/entities/Gate.js` - 3D gate object

**Details:**
- Box geometry for gate frame
- Text sprite or texture showing value (N)
- Position in specific lane
- Move with world scroll (z-axis)

### Step 7: Gate Spawning System
**Files to create/modify:**
- `js/01A/systems/GateSpawner.js` - Spawn logic
- `js/01A/game/Game.js` - Integrate spawner

**Details:**
- Spawn pair of gates at fixed intervals
- Position far ahead in z-axis
- One per lane (calculate x positions)
- Add to scene
- Track in array

### Step 8: Collision Detection (3D)
**Files to create/modify:**
- `js/01A/systems/CollisionDetector.js` - 3D collision

**Details:**
- Use Three.js bounding boxes or sphere collision
- Check player position against gate positions
- Distance-based collision (if within threshold)
- Return collided gates

### Step 9: Game Logic Integration
**Files to create/modify:**
- `js/01A/game/Game.js` - All game logic

**Details:**
- Apply gate effects to blob count
- Remove collided gates from scene and array
- Update score from distance
- Check game over condition
- Clean up off-screen gates (z position check)

### Step 10: HUD (HTML Overlay)
**Files to create/modify:**
- `js/01A/ui/HUD.js` - DOM-based HUD
- `01A.html` - Add HUD div overlay

**Details:**
- Position HTML elements over canvas
- Update blob count and score via DOM manipulation
- Style with CSS for visibility

### Step 11: Game Over Screen
**Files to create/modify:**
- `js/01A/ui/GameOverScreen.js` - Game over UI
- `js/01A/game/Game.js` - State management

**Details:**
- Show overlay when game over
- Display final stats
- Restart functionality
- Reset Three.js scene objects

### Step 12: Visual Polish
**Files to modify:**
- All entity files

**Details:**
- Add simple materials with colors
- Test different camera distances
- Ensure proper depth perception
- Final testing

## Advantages
- ✅ Most popular 3D library (huge community, lots of examples)
- ✅ Clean API, well-documented
- ✅ Built-in helpers for debugging (axes, stats, etc.)
- ✅ Easy to add effects later (shadows, particles, etc.)
- ✅ Good performance with simple geometries

## Disadvantages
- ❌ Requires learning Three.js API
- ❌ Larger bundle size than vanilla Canvas
- ❌ Text rendering requires sprites or HTML overlay

## Estimated Complexity
**Medium** - Requires Three.js knowledge but straightforward implementation
