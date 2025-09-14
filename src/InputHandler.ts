import { GameEngine } from './GameEngine';
import { GameMode, GameState } from './types';

export class InputHandler {
  private gameEngine: GameEngine;
  private keys: Set<string> = new Set();
  private lastKeyTime: Map<string, number> = new Map();
  private keyRepeatDelay: number = 150; // milliseconds

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.handleKeyUp(event);
    });

    // Setup UI button event listeners
    this.setupUIControls();
  }

  private setupUIControls(): void {
    const startHumanBtn = document.getElementById('start-human');
    const startAIBtn = document.getElementById('start-ai');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');

    if (startHumanBtn) {
      startHumanBtn.addEventListener('click', () => {
        this.gameEngine.startGame(GameMode.HUMAN);
        this.updateButtonStates();
      });
    }

    if (startAIBtn) {
      startAIBtn.addEventListener('click', () => {
        this.gameEngine.startGame(GameMode.AI);
        this.updateButtonStates();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.gameEngine.pauseGame();
        this.updateButtonStates();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.gameEngine.resetGame();
        this.updateButtonStates();
      });
    }
  }

  private updateButtonStates(): void {
    const startHumanBtn = document.getElementById('start-human') as HTMLButtonElement;
    const startAIBtn = document.getElementById('start-ai') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pause') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset') as HTMLButtonElement;

    const gameState = this.gameEngine.getGameState();
    const isPlaying = gameState === GameState.PLAYING;
    const isPaused = gameState === GameState.PAUSED;
    const isGameOver = gameState === GameState.GAME_OVER;

    if (startHumanBtn) startHumanBtn.disabled = isPlaying;
    if (startAIBtn) startAIBtn.disabled = isPlaying;
    if (pauseBtn) {
      pauseBtn.disabled = gameState === GameState.IDLE || isGameOver;
      pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }
    if (resetBtn) resetBtn.disabled = false;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.code;
    const now = Date.now();
    
    // Prevent default browser behavior for game keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(key)) {
      event.preventDefault();
    }

    // Handle non-repeating keys immediately
    if (!this.keys.has(key)) {
      this.keys.add(key);
      this.processKey(key);
      this.lastKeyTime.set(key, now);
    } else {
      // Handle key repeat for movement keys
      const lastTime = this.lastKeyTime.get(key) || 0;
      if (now - lastTime > this.keyRepeatDelay) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key)) {
          this.processKey(key);
          this.lastKeyTime.set(key, now);
        }
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.code;
    this.keys.delete(key);
    this.lastKeyTime.delete(key);
  }

  private processKey(key: string): void {
    const gameState = this.gameEngine.getGameState();
    const gameMode = this.gameEngine.getGameMode();

    // Global keys (work in any state)
    switch (key) {
      case 'KeyR':
        if (gameState === GameState.GAME_OVER) {
          this.gameEngine.resetGame();
          this.updateButtonStates();
        }
        return;
      
      case 'KeyP':
        if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
          this.gameEngine.pauseGame();
          this.updateButtonStates();
        }
        return;
    }

    // Game control keys (only work during human play)
    if (gameState === GameState.PLAYING && gameMode === GameMode.HUMAN) {
      switch (key) {
        case 'ArrowLeft':
          this.gameEngine.moveBlock('left');
          break;
        
        case 'ArrowRight':
          this.gameEngine.moveBlock('right');
          break;
        
        case 'ArrowDown':
          this.gameEngine.moveBlock('down');
          break;
        
        case 'ArrowUp':
          this.gameEngine.rotateBlock();
          break;
        
        case 'Space':
          this.gameEngine.dropBlock();
          break;
      }
    }
  }

  public updateUI(): void {
    this.updateButtonStates();
    this.updateStats();
  }

  private updateStats(): void {
    const stats = this.gameEngine.getStats();
    
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');

    if (scoreElement) scoreElement.textContent = stats.score.toString();
    if (levelElement) levelElement.textContent = stats.level.toString();
    if (linesElement) linesElement.textContent = stats.linesCleared.toString();
  }
}