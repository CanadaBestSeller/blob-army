# Implementation Plan 01C: Canvas 2D with Racing Game Perspective Projection

## Overview
Use vanilla HTML5 Canvas 2D API with perspective projection math to create a racing game camera view (Mario Kart/F-Zero/Outrun style). No external 3D libraries - lightweight and full control.

## Technology Stack
- **Rendering**: HTML5 Canvas 2D API
- **3D Projection**: Manual perspective transformation with racing game camera
- **Architecture**: ES6 Classes with custom 3D-to-2D projection

## Visual Approach
- **Projection**: Perspective projection with racing game camera view
- **Camera**: Positioned behind and above player, looking down at ~45-degree angle
- **Track**: Extends forward into distance along Z-axis with vanishing point
- **Perspective**: Objects further away appear smaller AND higher on screen
- **Rendering**: All 3D coordinates converted to 2D screen space manually
- **Blobs**: Circles drawn at projected positions with size scaling for depth
- **Gates**: Rectangles drawn at projected positions
- **Track**: Lines/rectangles drawn with proper perspective convergence
- **Depth Sorting**: Manual z-sorting for proper rendering order

## File Structure
```
01C.html                         # Standalone HTML wrapper for Canvas 2D implementation
js/01C/
├── main.js                      # Entry point
├── game/
│   ├── Game.js                 # Main game loop
│   ├── GameState.js            # State constants
│   └── GameParameters.js       # Centralized parameters
├── rendering/
│   ├── Camera.js               # Camera transformation (45-degree angle)
│   ├── Projection.js           # 3D-to-2D projection math
│   └── Renderer.js             # Canvas drawing with depth sorting
├── entities/
│   ├── Entity3D.js             # Base class with 3D position
│   ├── Player.js               # Player blob group
│   ├── Gate.js                 # Gate obstacle
│   └── Track.js                # Track visualization
├── systems/
│   ├── InputManager.js         # Keyboard input
│   ├── CollisionDetector.js    # 3D collision in world space
│   └── GateSpawner.js          # Gate spawning
└── ui/
    ├── HUD.js                  # Canvas-based HUD
    └── GameOverScreen.js       # Canvas-based game over
```

## Implementation Steps

### Step 1: HTML Wrapper and Core Setup
**Files to create/modify:**
- `01C.html` - Standalone HTML file with canvas element
- `js/01C/game/GameParameters.js` - All constants
- `js/01C/main.js` - Canvas setup and initialization
- `js/01C/rendering/Projection.js` - 3D-to-2D math

**Details:**
- Create `01C.html` with canvas element
- Link to `js/01C/main.js` as module
- Set up canvas and 2D context
- Implement racing game perspective projection function:
  ```javascript
  // Convert 3D world coords to 2D screen coords
  // Racing game perspective (Mario Kart/F-Zero style)
  function project(x, y, z, camera) {
    // Camera looks down at 45-degree angle
    // Track extends forward along Z-axis
    // Perspective projection with vanishing point
    // Objects further away appear smaller and higher on screen
    return {x: screenX, y: screenY, depth: z, scale: perspectiveScale};
  }
  ```
- Basic render loop with requestAnimationFrame

### Step 2: Camera System
**Files to create/modify:**
- `js/01C/rendering/Camera.js` - Camera transformation

**Details:**
- Camera positioned behind and above player
- Camera follows player horizontally (x-axis)
- Camera maintains fixed distance behind player (z-axis offset)
- Camera at elevated position (y-axis) to look down at track
- ~45-degree viewing angle looking down the track
- Transform world coordinates relative to camera position

### Step 3: Renderer with Depth Sorting
**Files to create/modify:**
- `js/01C/rendering/Renderer.js` - Drawing system

**Details:**
- Collect all drawable objects
- Sort by z-depth (furthest first)
- Draw each object using projection
- Clear and redraw every frame

### Step 4: Base Entity with 3D Position
**Files to create/modify:**
- `js/01C/entities/Entity3D.js` - Base class

**Details:**
- Store 3D position (x, y, z)
- Abstract draw method
- Update method for movement

### Step 5: Track Visualization
**Files to create/modify:**
- `js/01C/entities/Track.js` - Ground and lanes

**Details:**
- Draw ground plane using projected corners
- Draw lane lines at fixed x positions
- Extend infinitely using z-offset
- Simple perspective grid effect

### Step 6: Player Entity
**Files to create/modify:**
- `js/01C/entities/Player.js` - Player blob

**Details:**
- 3D position (x, y=0.5, z=0)
- Draw as circle at projected position
- Scale circle size based on depth (closer = bigger)
- Horizontal movement updates x position
- Boundary constraints in world space
- Blob count property

### Step 7: Input System
**Files to create/modify:**
- `js/01C/systems/InputManager.js` - Keyboard handling

**Details:**
- Arrow key state tracking
- Provide clean API for game loop

### Step 8: World Scrolling
**Files to create/modify:**
- `js/01C/game/Game.js` - Scroll management

**Details:**
- Increase all obstacle z positions (toward camera)
- OR decrease camera z position
- Track total distance scrolled
- Convert to meters for score

### Step 9: Gate Entity
**Files to create/modify:**
- `js/01C/entities/Gate.js` - 3D gate

**Details:**
- 3D position in world space
- Draw as rectangle at projected position
- Draw text (number value) using canvas fillText
- Scale based on depth
- Store value (N)

### Step 10: Gate Spawning
**Files to create/modify:**
- `js/01C/systems/GateSpawner.js` - Spawning logic
- `js/01C/game/Game.js` - Integration

**Details:**
- Spawn gates at far z distance
- Calculate x positions for each lane
- Create pairs with random values
- Add to entities array

### Step 11: Collision Detection (3D World Space)
**Files to create/modify:**
- `js/01C/systems/CollisionDetector.js` - 3D collision

**Details:**
- Work in 3D world coordinates (not screen space)
- Check distance between player and gates
- Simple sphere/box collision
- Return collided gates

### Step 12: Game Logic Integration
**Files to create/modify:**
- `js/01C/game/Game.js` - Core game loop

**Details:**
- Update all entities (movement)
- Detect collisions
- Apply gate effects to blob count
- Remove collided gates
- Update score
- Check game over
- Clean up off-screen gates (z > threshold)

### Step 13: HUD (Canvas-based)
**Files to create/modify:**
- `js/01C/ui/HUD.js` - HUD rendering

**Details:**
- Draw text in screen space (not projected)
- Blob count (top-left)
- Score (top-right)
- Use canvas fillText with clear background

### Step 14: Game Over Screen
**Files to create/modify:**
- `js/01C/ui/GameOverScreen.js` - Game over UI
- `js/01C/game/Game.js` - State management

**Details:**
- Pause game when blob count < 1
- Draw game over overlay on canvas
- Show final stats
- Listen for restart input
- Reset game state

### Step 15: Visual Polish
**Files to modify:**
- All rendering code

**Details:**
- Fine-tune projection parameters
- Add simple shading (darker = further)
- Adjust camera angle/distance
- Test depth perception
- Final testing

## Advantages
- ✅ Zero external dependencies (except existing code)
- ✅ Smallest bundle size
- ✅ Full control over rendering
- ✅ Lightweight and fast
- ✅ No library learning curve
- ✅ Easy to debug (simple math)

## Disadvantages
- ❌ Manual projection math required
- ❌ Manual depth sorting required
- ❌ More implementation work
- ❌ Limited to simpler visuals
- ❌ No built-in 3D helpers
- ❌ Harder to add complex 3D effects later

## Estimated Complexity
**Medium-High** - More manual work but with complete control

## Notes on Isometric Projection
The 45-degree camera angle can be achieved with:
- **Isometric**: Classic 2:1 ratio, looks like "axonometric" view
- **Dimetric**: Slight variation for better perspective
- **Custom perspective**: Scale objects by depth for more realistic 3D feel

For this game, a simple isometric or dimetric projection will provide the 3D effect without complex perspective math.
