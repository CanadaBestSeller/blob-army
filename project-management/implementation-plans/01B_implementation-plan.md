# Implementation Plan 01B: Babylon.js with Game-Focused Features

## Overview
Use Babylon.js, a game-focused 3D engine with built-in physics, collision detection, and game-specific features. More batteries-included than Three.js.

## Technology Stack
- **3D Engine**: Babylon.js (7.0+)
- **Rendering**: WebGL via Babylon.js
- **Architecture**: ES6 Modules + Babylon.js scene structure

## Visual Approach
- **Camera**: ArcRotateCamera locked at 45-degree angle
- **Blobs**: Sphere meshes with Babylon materials
- **Gates**: Box meshes with GUI textures for numbers
- **Track**: Ground mesh with Babylon's grid material
- **Lighting**: HemisphericLight for uniform lighting

## File Structure
```
01B.html                       # Standalone HTML wrapper for Babylon.js implementation
js/01B/
├── main.js                    # Entry point, Babylon.js initialization
├── game/
│   ├── Game.js               # Main game loop and state
│   ├── GameState.js          # State constants
│   └── GameParameters.js     # Centralized parameters
├── scene/
│   ├── SceneSetup.js         # Babylon.js scene initialization
│   ├── CameraSetup.js        # Camera configuration
│   └── EnvironmentSetup.js   # Lighting and background
├── entities/
│   ├── Player.js             # Player blob group
│   ├── Gate.js               # Gate obstacle with Babylon GUI
│   └── Track.js              # Track/lane visualization
├── systems/
│   ├── InputManager.js       # Keyboard input (Babylon InputManager)
│   ├── CollisionSystem.js    # Babylon's collision/intersection
│   └── GateSpawner.js        # Gate spawning
└── ui/
    ├── HUD.js                # Babylon GUI for HUD
    └── GameOverScreen.js     # Babylon GUI for game over
```

## Implementation Steps

### Step 1: HTML Wrapper and Babylon.js Setup
**Files to create/modify:**
- `01B.html` - Standalone HTML file with Babylon.js CDN and canvas
- `js/01B/game/GameParameters.js` - All constants
- `js/01B/main.js` - Initialize Babylon engine
- `js/01B/scene/SceneSetup.js` - Create scene

**Details:**
- Create `01B.html` with canvas element and Babylon.js CDN import
- Link to `js/01B/main.js` as module
- Create Babylon.Engine with canvas
- Create Scene
- Set up render loop with scene.render()
- Configure basic scene settings

### Step 2: Camera Configuration
**Files to create/modify:**
- `js/01B/scene/CameraSetup.js` - Camera setup

**Details:**
- ArcRotateCamera positioned at 45-degree elevation
- Lock camera rotation (no user control)
- Camera follows player in x-axis only
- Fixed z and y offset from player

### Step 3: Environment and Lighting
**Files to create/modify:**
- `js/01B/scene/EnvironmentSetup.js` - Lighting and sky
- `js/01B/entities/Track.js` - Ground and lanes

**Details:**
- HemisphericLight for even lighting
- Ground mesh with simple material or grid
- Lane divider lines (thin box meshes)
- Background color/skybox

### Step 4: Player Entity
**Files to create/modify:**
- `js/01B/entities/Player.js` - Player mesh

**Details:**
- Create sphere mesh (MeshBuilder.CreateSphere)
- Position at origin, between lanes
- Material with simple color
- Horizontal movement (x-axis)
- Boundary constraints
- Blob count property

### Step 5: Input System (Babylon Style)
**Files to create/modify:**
- `js/01B/systems/InputManager.js` - Babylon InputManager wrapper

**Details:**
- Use Babylon's scene.onKeyboardObservable
- Track left/right arrow states
- Clean API for game loop queries

### Step 6: World Scrolling System
**Files to create/modify:**
- `js/01B/game/Game.js` - Scroll management

**Details:**
- Move gates toward camera (negative z)
- Camera follows player but maintains z offset
- Track distance traveled
- Convert to meters for scoring

### Step 7: Gate Entity with GUI
**Files to create/modify:**
- `js/01B/entities/Gate.js` - 3D gate with number display

**Details:**
- Box mesh for gate frame
- Babylon GUI AdvancedDynamicTexture for number display
- Create texture, add text control
- Position in lane, spawn far ahead (z-axis)
- Store gate value (N)

### Step 8: Gate Spawning
**Files to create/modify:**
- `js/01B/systems/GateSpawner.js` - Spawning logic
- `js/01B/game/Game.js` - Integration

**Details:**
- Timer-based spawning (every 2 seconds)
- Create pair of gates (one per lane)
- Random values between -20 and +20
- Add to scene
- Track in array for updates

### Step 9: Collision Detection (Babylon Native)
**Files to create/modify:**
- `js/01B/systems/CollisionSystem.js` - Collision logic

**Details:**
- Use mesh.intersectsMesh() for collision
- Check player against all gates each frame
- Return collided gates
- Babylon's built-in collision detection

### Step 10: Game Logic Integration
**Files to create/modify:**
- `js/01B/game/Game.js` - Core game logic

**Details:**
- Update gate positions (move toward player)
- Detect collisions, apply effects
- Update blob count
- Update score from distance
- Check game over condition
- Dispose off-screen gates (Babylon dispose())

### Step 11: HUD with Babylon GUI
**Files to create/modify:**
- `js/01B/ui/HUD.js` - Babylon GUI overlay

**Details:**
- Create AdvancedDynamicTexture.CreateFullscreenUI()
- Add TextBlocks for blob count and score
- Position in screen space
- Update each frame

### Step 12: Game Over Screen
**Files to create/modify:**
- `js/01B/ui/GameOverScreen.js` - Game over with Babylon GUI
- `js/01B/game/Game.js` - State transitions

**Details:**
- Create GUI panel for game over
- Display final stats
- Restart button (Babylon GUI Button)
- Reset scene and game state

### Step 13: Polish and Testing
**Files to modify:**
- All entity and system files

**Details:**
- Tune camera distance/angle
- Adjust materials and colors
- Test collision accuracy
- Performance check
- Final bug fixes

## Advantages
- ✅ Game-focused engine with built-in features
- ✅ Excellent built-in GUI system (no HTML overlay needed)
- ✅ Strong collision detection out of the box
- ✅ Built-in physics engine (for future phases)
- ✅ Inspector tool for debugging
- ✅ Great documentation and playground examples

## Disadvantages
- ❌ Larger library than Three.js
- ❌ Less popular (smaller community)
- ❌ More opinionated architecture
- ❌ Steeper learning curve for Babylon-specific patterns

## Estimated Complexity
**Medium** - Feature-rich but requires learning Babylon.js patterns
