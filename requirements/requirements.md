# Blob Army - Lane-Based Scroller Game Requirements

## Project Overview

Blob Army is a lane-based vertical scroller game where players control a group of blobs, collect gates to increase their army, fight enemies, and survive as long as possible while scoring points based on distance traveled.

## Game Concept

- **Genre**: Vertical scrolling runner with continuous vertical movement
- **Core Mechanic**: Collect gates to grow your blob army, fight enemies that reduce your army
- **Win Condition**: None (infinite runner)
- **Lose Condition**: All blobs are killed by enemies
- **Scoring**: Based on total distance traveled

## Architecture & Technology Stack

- **Platform**: Web browser (HTML5 Canvas)
- **Framework**: JavaScript with 3D rendering engine
- **Rendering**: HTML5 Canvas API

---

# Phases

## Phase 1: Minimum Viable Product (MVP) - Core Runner Mechanics

### Overview
Establish the fundamental game loop, persistent forward motion (scrolling), continuous player movement, and the first functional obstacle type.

### 0. Core game concepts

**The World**
- An infinite 3D track or path that the player travels along.
- All game objects (gates, enemies, power-ups) are placed within this environment.
- The environment scrolls down toward the player to simulate constant forward movement.

**Lanes**
- 2 distinct, parallel vertical tracks (e.g. Lane 1 and Lane 2) that run down the length of the world.
- Obstacles are always spawned and centered directly within one of these two lanes.

**Camera**
- The viewpoint is fixed directly behind the Blob Group, looking down the path.
- The camera moves forward at a constant speed, which drives the sensation of speed and the world scrolling.

**Blob Group**
- Rendered as a group of blobs, but the core hitbox is always in the center

**Blob Count**
- Player's Blob Count starts at 1. It is always an integer

**Current distance**
- In meters.
- Tracks the game's current points (based on distance traveled)

**Obstacles**
- Locked to a specific distance (e.g. 200m)
- When touched by the Blob Group's center core hitbox, applies effects to the player's Blob Group

### 1. Core Initialization & Game Loop

**Game State Initialization**
- Player's Blob Count starts at 1. It is always an integer
- Score starts at 0
- Player begins in horizontal center of screen

**Game Loop Implementation**
- Continuous game loop running at ~60 FPS
- Frame-based update system

**World Scrolling**
- On every frame, entire game world moves downward at constant speed
- Simulates player moving forward through the game world
- Score increases based on distance traveled

### 2. Player Movement and Constraints

**Continuous Vertical Movement**
- Player blob moves smoothly across vertical plane
- No fixed lane snapping - fluid movement across entire width

**Input Handling**
- Listen for Left Arrow and Right Arrow key inputs
- Support both key press and key hold

**Movement Mechanics**
- When arrow key is held, adjust horizontal position at steady rate per frame
- Smooth, responsive motion

**Boundary Constraints**
- Prevent player from moving off-screen horizontally
- Constrain movement to visible game area boundaries

### 3. Lane and Gates (Addition Gate Only)

**Lanes**
- For this first MVP there will only be a 2 vertical lanes

**Gate Type: Math Gate**
- Only obstacle type in Phase 1
- Visual representation of a gate with "N" indicator, where N is any number between +20 to -20

**Spawning System**
- Automatic spawning from top of screen
- Fixed time intervals (e.g., every 2 seconds)
- One gate per lane. Gates do not appear in a staggered way - the 2 gates for the 2 lanes are always spaced at the same distance, so the player has to choose
- Gates are tied to the distance and moves downward as the world moves down.

**Collision Detection**
- Detect when player's blob(s) touch a Gate object
- Simple bounding box or circle collision detection

**Operation Application**
- On collision with Math Gate: increase/decrease Blob Count by N
- Immediate visual feedback

**Object Cleanup**
- Remove gates after collision
- Remove gates that scroll completely off bottom of screen
- Prevent memory leaks from accumulating objects

### 4. User Interface and Display

**Player Rendering**
- Visual display of player's blob(s) at current horizontal position
- For Phase 1: single blob visualization is acceptable

**Heads-Up Display (HUD)**
- Display current Blob Count under gate
- Display current Score
- Persistent on-screen positioning (e.g., top-left or top-center)
- Clear, readable font using existing Mulish typeface

**Visual Styling**
- Use existing CSS custom properties for consistency:
  - `--card-bg: #FFF2F2` (background elements)
  - `--text-color: #515369` (HUD text)
  - `--accent-color: #C74646` (important elements)

### Completion Criteria for Phase 1
- User can open the game
- User can move left and right continuously using arrow keys
- World scrolls downward at constant speed
- Math gates spawn and scroll down the screen
- Blob count visibly increases when gates are collected
- Score increases based on distance traveled
- HUD displays current blob count and score
- Game is over when blob count falls below 1

## Phase 2: TBD
