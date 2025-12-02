# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Testing
- We are always editing index.html
- For testing, use http://localhost:8080/ - we have a python server
- If I ask you to implement a 3D entity that we don’t have art assets for, I want you to render it as a placeholder asset: a cylinder with a checkerboard texture and text label

# Rules for Claude

- If I don't go into plan mode and I want to execute something that's not unbelievably simple like not one single small change, make sure to push back on me if there are any clarifying questions.
- Always stop after completing a phase of a plan to ask for approval to proceed with the next phase
- Clarify which phase of the development plan + the task number you will be working on, if necessary.
- Don't do visual testing. The user will perform visual testing.
- When the implementation is complete, move the status to Visual QA. Don't mark it as done

# This pository

## Project Overview

Blob Army is a JavaScript-based physics experiment/interactive game that runs in a web browser. The project consists of a simple HTML5 Canvas application with a portfolio-style navigation linking back to David Li's portfolio site.

## Architecture

This is a vanilla JavaScript web application with the following structure:
- `index.html` - Main HTML page with canvas element and navigation
- `js/main.js` - Game logic and canvas rendering (currently minimal with only canvas reference)
- `css/style.css` - Styling with CSS custom properties for theming

The application uses:
- HTML5 Canvas for rendering
- CSS Grid/Flexbox for layout
- Google Fonts (Mulish) for typography
- CSS custom properties for consistent theming

## Development

Since this is a static web application with no build process:
- Open `index.html` directly in a browser to run the application
- Use browser developer tools for debugging
- Live server/local development server recommended for development

## Theming

The project uses CSS custom properties defined in `:root`:
- `--card-bg: #FFF2F2` (Pinkish background)
- `--text-color: #515369` (Dark blue-grey)
- `--accent-color: #C74646` (Red)
- `--accent-hover: #FF0000` (Hover red)

## Game Container

The main game area is styled as:
- 80% viewport width, 70% viewport height
- Max width of 1200px
- Rounded borders with solid shadow effect
- Canvas fills the entire container
