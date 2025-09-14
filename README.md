# AI Tris Game

AI Color Tris is a 2D arcade game similar to other Tetris-like games, written in TypeScript using Pixi.js. The game features 14 different kinds of 3-box blocks in red or blue colors. The objective is to arrange falling blocks to create filled rows of the same color, which are then cleared from the grid.

## Game Features

- **3-box blocks** instead of traditional 4-box Tetris pieces
- **14 different block types**: 6 straight + 8 bent patterns
- **Dual colors**: Red and blue blocks (28 total variants)
- **8×16 game grid**
- **Color-based row clearing**: rows only clear when all boxes are the same color
- **Two game modes**: Human player and AI player
- **Real-time scoring and level progression**

## How to Run

This is a **web application**, not a browser extension. To run the game:

### Development Mode
```bash
npm install
npm run dev
```
Then open http://localhost:3000 in your browser.

### Production Build
```bash
npm install
npm run build
npm run preview
```
Then open the provided URL in your browser.

### Opening the Built Files
After running `npm run build`, you can serve the `dist` folder using any static file server:
```bash
# Using Python 3
cd dist && python -m http.server 8000

# Using Node.js http-server (install with: npm install -g http-server)
cd dist && http-server

# Using any other static file server
```

**Note**: Do not try to load the `dist` directory as a browser extension - it will fail with a "manifest file is missing" error because this is a web application, not a browser extension.

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run test` - Run test suite (45 tests)
- `npm run lint` - Validate code quality

## Controls

- **Arrow keys**: Move blocks left/right/down
- **Up arrow**: Rotate blocks
- **Space**: Drop blocks instantly
