# Implementation To-Do List: Option 01C
# Canvas 2D with Isometric/Pseudo-3D Projection

## Overview
This to-do list breaks down the implementation into modular, visually testable tasks. Each task includes a clear visual test to verify functionality before moving to the next step.

---

## Task List

### ✅ = Complete | 🧪 = Ready for Visual QA | 🔄 = In Progress | ⏳ = Pending

---

### **Task 1: Project Structure & Game Parameters** ✅

**Files to create:**
- `01C.html` - Standalone HTML wrapper
- `js/01C/` folder structure
- `js/01C/game/GameParameters.js`

**Implementation:**
- Create `01C.html` with canvas element and module script tag
- Set up complete folder structure as per implementation plan
- Create `GameParameters.js` with all constants:
  - World scroll speed: 200 px/s
  - Player movement speed: 300 px/s
  - Gate spawn interval: 2 seconds
  - Target FPS: 60
  - Lane positions, gate spacing, etc.

**Visual Test:**
- Open `01C.html` in browser
- Canvas element should be visible and sized correctly
- Console log should confirm parameters are loaded
- No errors in browser console

**Status:** ✅ Complete

---

### **Task 2: Projection System with Visual Test** ✅

**Files to create:**
- `js/01C/rendering/Projection.js`
- `js/01C/test-projection.html` (temporary test file)

**Implementation:**
- Implement **racing game perspective projection** (like Mario Kart/F-Zero/Outrun):
  - Camera looks down at ~45 degree angle
  - Track extends forward into distance (along Z axis)
  - Perspective projection with vanishing point
  - Objects further away appear smaller and higher on screen
  ```javascript
  function project(x, y, z, camera) {
    // Perspective projection for racing game view
    // Camera looking down road at 45 degrees
  }
  ```
- Create test page with:
  - Ground plane/lane extending into distance
  - Wireframe cube that can move in 3D space
  - Camera rotation controls to verify perspective

**Visual Test:**
- Open `test-projection.html`
- Should see lane extending straight into distance (NOT hourglass shape)
- Lane should converge to vanishing point on horizon
- Moving cube forward/back should scale larger/smaller with proper perspective
- Camera should look down at road from behind/above

**Status:** ✅ Complete

---

### **Task 3: Camera & Entity Base Class** ✅

**Files to create:**
- `js/01C/rendering/Camera.js`
- `js/01C/entities/Entity3D.js`

**Implementation:**
- Camera class with:
  - Position (x, y, z) following player
  - Transform method for world-to-camera space
  - 45-degree viewing angle configuration
- Entity3D base class with:
  - 3D position storage
  - Abstract `update()` and `draw()` methods
  - Basic position manipulation methods

**Visual Test:**
- Update `test-projection.html` to use Camera class
- Move camera position and verify cube follows correctly
- Should maintain proper perspective as camera moves

**Status:** ✅ Complete

---

### **Task 4: Renderer & Track** ✅

**Files to create:**
- `js/01C/rendering/Renderer.js`
- `js/01C/entities/Track.js`

**Implementation:**
- Renderer with:
  - Depth sorting algorithm (z-buffer)
  - Clear and redraw each frame
  - Entity collection management
- Track entity with:
  - Ground plane using projected corners
  - Lane lines at fixed x positions
  - Distance markers every 10 meters
  - Infinite scrolling using z-offset

**Visual Test:**
- Create simple test HTML page
- Render track with visible ground plane
- Should see 2 lane lines extending into distance
- Perspective should be clear (lines converge toward horizon)

**Status:** ✅ Complete

---

### **Task 5: Player Entity** ✅

**Files to create:**
- `js/01C/entities/Player.js`
- `js/01C/test-track.html` (updated)

**Implementation:**
- Player class extending Entity3D:
  - Initial position: x=0, y=0.5, z=0
  - Draw as circle at projected position
  - Scale circle based on depth (closer = bigger)
  - Store blob count property (starts at 1)
  - No movement yet (just rendering)

**Visual Test:**
- Add player to track test page
- Player blob should appear centered on track
- Should be rendered at correct depth (on ground plane)
- Circle should be visible and properly sized

**Status:** ✅ Complete

---

### **Task 6: Input & Player Movement** ✅

**Files to create:**
- `js/01C/systems/InputManager.js`
- `js/01C/test-track.html` (updated)

**Modifications:**
- Update `Player.js` with movement logic

**Implementation:**
- InputManager with:
  - Arrow key state tracking
  - Clean API for checking key states
  - Separated controls: Arrow keys for player, WASD+R/F+T/G for camera
- Player movement:
  - Horizontal position updates based on input
  - Movement speed from GameParameters
  - Boundary constraints (stay on track)

**Visual Test:**
- Add InputManager to test page
- Press left/right arrows
- Player blob should move smoothly left and right
- Should stop at track boundaries (not go off-screen)
- Movement should be smooth and responsive

**Status:** ✅ Complete

---

### **Task 7: Game Loop & World Scrolling** ✅

**Files to create:**
- `js/01C/game/Game.js`
- `js/01C/test-game.html`

**Implementation:**
- Game class with:
  - RequestAnimationFrame loop
  - Delta time calculation for frame-independent movement
  - Entity update calls
  - Renderer integration
- World scrolling:
  - Move all entities forward with scrolling speed
  - Camera follows player (X and Z locked, Y free for user control)
  - Track distance traveled (in world units and meters)
  - Smooth 60 FPS scrolling
  - Camera-relative track rendering for stable geometry

**Visual Test:**
- Integrate Game.js with existing components
- Track should scroll toward camera continuously
- Player should stay at fixed position on screen (racing game effect)
- Scrolling should be smooth at 60 FPS
- Distance meter displayed in HUD
- Camera Y and pitch controls work independently

**Status:** ✅ Complete

---

### **Task 8: Gate Entity** ✅

**Files to create:**
- `js/01C/entities/Gate.js`
- `js/01C/test-gates.html`

**Files modified:**
- `js/01C/rendering/Renderer.js` - Two-pass rendering (track background, then entities)
- `js/01C/game/Game.js` - Only move player forward, not gates
- `js/01C/rendering/Wallpaper.js` - Mountain width now responsive, bottom anchored to horizon
- `js/01C/entities/Player.js` - Added visibility flag for PREPLAY state
- `index.html` - Added PREPLAY state with centered Play button

**Implementation:**
- Gate class extending Entity3D:
  - 3D position in world space
  - Store value N (number between -20 and +20)
  - Draw as rectangle at projected position with bright colors
  - Positive gates: bright green (#00FF00), negative: bright red (#FF0000)
  - Thick yellow border (#FFFF00, 5px) for visibility
  - Draw text (number value) using canvas fillText
  - Scale based on depth
- Fixed rendering layering: Two-pass system ensures gates always on top of track
- Fixed gate movement: Gates stay at fixed Z positions, player moves forward
- Added PREPLAY game state:
  - Game scrolls on page load with invisible player and no gates
  - Large centered "Play" button with pulsing animation
  - Clicking Play button starts game, shows player, adds gates, and triggers touch tutorial
- Mountain improvements:
  - Width always matches viewport (responsive scaling: 200% on mobile ≤400px, 110% on desktop ≥1200px)
  - Bottom edge automatically anchored to horizon line
  - No manual Y positioning needed

**Visual Test:**
- Manually spawn 6 gates at far z distances (500, 1000, 1500) in test
- Gates should appear as bright rectangles with numbers
- Numbers should be centered on gates
- Gates should scale smaller when further away
- Gates should remain at fixed positions and appear to move toward camera as player advances
- Gates should always render on top of lane lines (not obscured)
- Page loads in PREPLAY state with scrolling background and centered Play button
- Mountain scales responsively and sits perfectly on horizon across all viewport sizes

**Status:** ✅ Complete

---

### **Task 9: Gate Spawning System** ⏳

**Files to create:**
- `js/01C/systems/GateSpawner.js`

**Modifications:**
- Update `Game.js` to integrate spawner

**Implementation:**
- GateSpawner with:
  - Timer-based spawning (every 2 seconds)
  - Generate random gate values (-20 to +20)
  - Create pairs of gates (one per lane)
  - Spawn at far z distance
  - Add to game entities

**Visual Test:**
- Run game with spawner enabled
- Gates should appear automatically every 2 seconds
- Always 2 gates per spawn (one in each lane)
- Gates should have different random values
- Gates should scroll toward camera and eventually pass player

**Status:** ⏳ Pending

---

### **Task 10: Collision Detection & Game Logic** ⏳

**Files to create:**
- `js/01C/systems/CollisionDetector.js`

**Modifications:**
- Update `Game.js` to handle collisions

**Implementation:**
- CollisionDetector with:
  - 3D world-space distance checks
  - Sphere/box collision between player and gates
  - Return list of collided gates
- Game collision handling:
  - Apply gate value to blob count
  - Remove collided gates from world
  - Prevent blob count from going below 0

**Visual Test:**
- Run game and move player into gates
- Blob count should increase/decrease based on gate value
- Gates should disappear after collision
- Console log should show collision events
- Player should be able to collect multiple gates

**Status:** ⏳ Pending

---

### **Task 11: Score Tracking & Cleanup** ⏳

**Modifications:**
- Update `Game.js`

**Implementation:**
- Score tracking:
  - Convert distance traveled to meters
  - Update score each frame
- Gate cleanup:
  - Remove gates that pass behind camera (z > threshold)
  - Prevent memory leaks

**Visual Test:**
- Run game without touching gates
- Score should continuously increase
- Console log should show gates being removed off-screen
- Memory usage should stay stable (check browser dev tools)
- Gates should disappear after passing player

**Status:** ⏳ Pending

---

### **Task 12: HUD Display** ⏳

**Files to create:**
- `js/01C/ui/HUD.js`

**Modifications:**
- Update `Game.js` to render HUD

**Implementation:**
- HUD class with:
  - Canvas-based text rendering (not projected)
  - Display blob count (top-left)
  - Display score (top-right)
  - Clear background behind text for readability
  - Use existing Mulish font

**Visual Test:**
- Run game
- Should see blob count in top-left corner
- Should see score in top-right corner
- Both values should update in real-time
- Text should be clear and readable
- Collecting gates should update blob count immediately

**Status:** ⏳ Pending

---

### **Task 13: Game States & Game Over** ⏳

**Files to create:**
- `js/01C/game/GameState.js`
- `js/01C/ui/GameOverScreen.js`

**Modifications:**
- Update `Game.js` for state management

**Implementation:**
- GameState constants:
  - PLAYING
  - GAME_OVER
- Game over detection:
  - Check if blob count < 1 each frame
  - Pause game loop when game over
- GameOverScreen:
  - Canvas overlay with semi-transparent background
  - Display "Game Over" text
  - Display final score and distance
  - Display "Press R to Restart" instruction
  - Reset game state on restart

**Visual Test:**
- Run game and deliberately collect negative gates
- When blob count reaches 0, game should pause
- Game over screen should appear with overlay
- Should show correct final stats
- Pressing R should restart game with fresh state
- New game should start at blob count = 1, score = 0

**Status:** ⏳ Pending

---

### **Task 14: Main Entry Point & Integration** ⏳

**Files to create:**
- `js/01C/main.js`

**Implementation:**
- Main module with:
  - Canvas setup and context creation
  - Game instance creation
  - Module initialization
  - Error handling for missing canvas

**Visual Test:**
- Open `01C.html` in browser
- Game should start automatically
- All systems should work together:
  - ✅ Player movement
  - ✅ World scrolling
  - ✅ Gates spawning
  - ✅ Collision detection
  - ✅ HUD updates
  - ✅ Game over flow
- Play complete game from start to game over to restart
- No console errors

**Status:** ⏳ Pending

---

### **Task 15: Visual Polish & Final Tuning** ⏳

**Modifications:**
- All rendering files

**Implementation:**
- Fine-tune projection parameters for optimal view
- Add depth-based shading (darker = further)
- Adjust camera angle/distance for best perspective
- Tweak gate spawn distance for better gameplay
- Adjust movement/scroll speeds if needed
- Test and balance difficulty

**Visual Test:**
- Play multiple complete games
- 3D perspective should feel natural and clear
- Depth perception should be obvious
- Gates should be visible far enough in advance
- Game should feel balanced and playable
- Visual quality should be polished and professional

**Status:** ⏳ Pending

---

## Notes

- Each task must be visually verified before proceeding
- Create temporary test HTML files as needed for isolated testing
- Delete test files after integration is complete
- Update this file's status emoji as tasks progress
- If any test fails, fix before moving to next task

---

## Summary

**Total Tasks:** 15
**Completed:** 8
**In Visual QA:** 0
**Pending:** 7

**Estimated Completion:** TBD based on development velocity
