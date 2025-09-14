# AI Tris Game Browser Extension

AI Color Tris is a 2D arcade game similar to other Tetris-like games, written in TypeScript using Pixi.js. The game runs as a browser extension in the side panel, allowing you to play while browsing other tabs. It features 14 different kinds of 3-box blocks in red or blue colors. The objective is to arrange falling blocks to create filled rows of the same color, which are then cleared from the grid.

## Game Features

- **3-box blocks** instead of traditional 4-box Tetris pieces
- **14 different block types**: 6 straight + 8 bent patterns
- **Dual colors**: Red and blue blocks (28 total variants)
- **8×16 game grid**
- **Color-based row clearing**: rows only clear when all boxes are the same color
- **Two game modes**: Human player and AI player
- **Real-time scoring and level progression**
- **Side panel interface**: Play while browsing other tabs

## How to Install and Run

This is a **browser extension** that runs in the side panel.

### Installing the Extension

1. **Build the extension**:
```bash
npm install
npm run build:extension
```

2. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Open the game**:
   - Click the extension icon in the Chrome toolbar
   - The game will open in the side panel
   - You can now play while browsing other tabs!

### Development Mode (Web Version)

You can also run it as a web application for development:

```bash
npm install
npm run dev
```
Then open http://localhost:3000 in your browser.

## Available Commands

- `npm run build:extension` - Build the browser extension
- `npm run dev` - Start development server (web version)
- `npm run build` - Create production build (web version)
- `npm run preview` - Preview production build (web version)
- `npm run test` - Run test suite (45 tests)
- `npm run lint` - Validate code quality

## Controls

- **Arrow keys**: Move blocks left/right/down
- **Up arrow**: Rotate blocks
- **Space**: Drop blocks instantly

## Technical Notes

- Built with TypeScript and Pixi.js
- Uses Manifest V3 for Chrome extensions
- Responsive design optimized for side panel width
- 45 comprehensive unit tests
- AI player with intelligent block placement algorithm
