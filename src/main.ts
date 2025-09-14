import { GameEngine } from './GameEngine';
import { GameRenderer } from './GameRenderer';
import { InputHandler } from './InputHandler';

class Game {
  private gameEngine: GameEngine;
  private renderer: GameRenderer;
  private inputHandler: InputHandler;
  private lastTime: number = 0;
  private isRunning: boolean = true;

  constructor() {
    this.gameEngine = new GameEngine();
    
    const gameContainer = document.getElementById('game-canvas');
    if (!gameContainer) {
      throw new Error('Game canvas container not found');
    }

    this.renderer = new GameRenderer(this.gameEngine, gameContainer);
    this.inputHandler = new InputHandler(this.gameEngine);

    this.startGameLoop();
    
    // Initial render
    this.renderer.render();
    this.inputHandler.updateUI();
  }

  private startGameLoop(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game logic
    this.gameEngine.update(deltaTime);

    // Render the game
    this.renderer.render();
    
    // Update UI
    this.inputHandler.updateUI();

    // Schedule next frame
    requestAnimationFrame(this.gameLoop);
  }

  public destroy(): void {
    this.isRunning = false;
    this.renderer.destroy();
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new Game();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    
    // Show error message to user
    const gameContainer = document.getElementById('game-canvas');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center;">
          <h3>Error: Failed to initialize game</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          <p>Please refresh the page to try again.</p>
        </div>
      `;
    }
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  // Cleanup resources if needed
});

export { Game };