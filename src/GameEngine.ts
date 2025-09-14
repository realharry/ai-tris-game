import { GameBoard } from './GameBoard';
import { BlockFactory } from './BlockFactory';
import { Block, GameMode, GameState, GameStats, Position } from './types';

export class GameEngine {
  private board: GameBoard;
  private currentBlock: Block | null = null;
  private nextBlock: Block;
  private gameState: GameState = GameState.IDLE;
  private gameMode: GameMode = GameMode.HUMAN;
  private stats: GameStats = { score: 0, level: 1, linesCleared: 0 };
  private dropTimer: number = 0;
  private dropInterval: number = 1000; // milliseconds
  private aiMoveTimer: number = 0;
  private aiMoveInterval: number = 200; // AI makes moves every 200ms for consistent tempo

  constructor() {
    this.board = new GameBoard();
    this.nextBlock = BlockFactory.createRandomBlock();
  }

  public startGame(mode: GameMode): void {
    this.gameMode = mode;
    this.gameState = GameState.PLAYING;
    this.board.clear();
    this.stats = { score: 0, level: 1, linesCleared: 0 };
    this.spawnNewBlock();
  }

  public pauseGame(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  public resetGame(): void {
    this.gameState = GameState.IDLE;
    this.currentBlock = null;
    this.board.clear();
    this.stats = { score: 0, level: 1, linesCleared: 0 };
    this.nextBlock = BlockFactory.createRandomBlock();
    this.dropTimer = 0;
    this.dropInterval = 1000;
    this.aiMoveTimer = 0;
  }

  public update(deltaTime: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    this.dropTimer += deltaTime;
    
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      this.moveBlockDown();
    }

    if (this.gameMode === GameMode.AI && this.currentBlock) {
      this.aiMoveTimer += deltaTime;
      if (this.aiMoveTimer >= this.aiMoveInterval) {
        this.aiMoveTimer = 0;
        this.updateAI();
      }
    }
  }

  private spawnNewBlock(): void {
    this.currentBlock = this.nextBlock;
    this.nextBlock = BlockFactory.createRandomBlock();

    // Reset AI timer when a new block spawns for consistent timing
    if (this.gameMode === GameMode.AI) {
      this.aiMoveTimer = 0;
    }

    if (!this.board.isValidPosition(this.currentBlock, this.currentBlock.position)) {
      this.gameState = GameState.GAME_OVER;
    }
  }

  public moveBlock(direction: 'left' | 'right' | 'down'): boolean {
    if (!this.currentBlock || this.gameState !== GameState.PLAYING) return false;

    const offset: Position = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 },
    }[direction];

    const newPosition: Position = {
      x: this.currentBlock.position.x + offset.x,
      y: this.currentBlock.position.y + offset.y,
    };

    if (this.board.isValidPosition(this.currentBlock, newPosition)) {
      this.currentBlock.position = newPosition;
      return true;
    }

    return false;
  }

  public rotateBlock(): boolean {
    if (!this.currentBlock || this.gameState !== GameState.PLAYING) return false;

    const rotatedBlock = BlockFactory.rotateBlock(this.currentBlock);
    
    if (this.board.isValidPosition(rotatedBlock, this.currentBlock.position)) {
      this.currentBlock = rotatedBlock;
      return true;
    }

    return false;
  }

  public dropBlock(): void {
    if (!this.currentBlock || this.gameState !== GameState.PLAYING) return;

    while (this.moveBlock('down')) {
      // Keep dropping until it can't move down anymore
    }
    this.lockBlock();
  }

  private moveBlockDown(): void {
    if (!this.moveBlock('down')) {
      this.lockBlock();
    }
  }

  private lockBlock(): void {
    if (!this.currentBlock) return;

    this.board.placeBlock(this.currentBlock);
    const clearedLines = this.board.clearCompletedRows();
    
    if (clearedLines > 0) {
      this.updateScore(clearedLines);
    }

    if (this.board.isGameOver()) {
      this.gameState = GameState.GAME_OVER;
    } else {
      this.spawnNewBlock();
    }
  }

  private updateScore(linesCleared: number): void {
    const lineValues = [0, 100, 300, 500, 800];
    const points = lineValues[Math.min(linesCleared, 4)] * this.stats.level;
    
    this.stats.score += points;
    this.stats.linesCleared += linesCleared;
    this.stats.level = Math.floor(this.stats.linesCleared / 10) + 1;
    
    // Increase drop speed with level
    this.dropInterval = Math.max(100, 1000 - (this.stats.level - 1) * 50);
  }

  private updateAI(): void {
    if (!this.currentBlock) return;

    // Simple AI: try to find the best position for the current block
    const bestMove = this.findBestMove();
    
    if (bestMove) {
      // Make one move per update for consistent tempo
      // Priority: rotation first, then horizontal movement, then drop
      
      // First, handle rotation if needed
      if (this.currentBlock.rotation !== bestMove.rotation) {
        this.rotateBlock();
        return; // Only do one action per AI update
      }
      
      // Then handle horizontal movement
      if (this.currentBlock.position.x < bestMove.x) {
        this.moveBlock('right');
        return;
      } else if (this.currentBlock.position.x > bestMove.x) {
        this.moveBlock('left');
        return;
      }
      
      // Finally, drop if in correct position and rotation
      if (this.currentBlock.position.x === bestMove.x && 
          this.currentBlock.rotation === bestMove.rotation) {
        this.dropBlock();
      }
    }
  }

  private findBestMove(): { x: number; rotation: number } | null {
    if (!this.currentBlock) return null;

    let bestScore = -Infinity;
    let bestMove: { x: number; rotation: number } | null = null;

    // Try all possible positions and rotations
    for (let rotation = 0; rotation < 4; rotation++) {
      let testBlock = { ...this.currentBlock };
      
      // Apply rotations
      for (let i = 0; i < rotation; i++) {
        testBlock = BlockFactory.rotateBlock(testBlock);
      }

      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        testBlock.position = { x, y: 0 };
        
        // Drop the block to the lowest valid position
        while (this.board.isValidPosition(testBlock, { x, y: testBlock.position.y + 1 })) {
          testBlock.position.y++;
        }

        if (this.board.isValidPosition(testBlock, testBlock.position)) {
          const score = this.evaluatePosition(testBlock);
          if (score > bestScore) {
            bestScore = score;
            bestMove = { x, rotation: rotation * 90 };
          }
        }
      }
    }

    return bestMove;
  }

  private evaluatePosition(block: Block): number {
    // Create a temporary board to simulate the placement
    const tempBoard = new GameBoard();
    const currentGrid = this.board.getGrid();
    
    // Copy current state
    for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        tempBoard.setCellColor(x, y, currentGrid[y][x]);
      }
    }

    // Place the block
    tempBoard.placeBlock(block);
    const clearedLines = tempBoard.clearCompletedRows();

    // Scoring factors
    const heightScore = -tempBoard.getFilledHeight() * 5;
    const holeScore = -tempBoard.getHoles() * 10;
    const lineScore = clearedLines * 100;

    return heightScore + holeScore + lineScore;
  }

  // Getters
  public getGameState(): GameState { return this.gameState; }
  public getGameMode(): GameMode { return this.gameMode; }
  public getBoard(): GameBoard { return this.board; }
  public getCurrentBlock(): Block | null { return this.currentBlock; }
  public getNextBlock(): Block { return this.nextBlock; }
  public getStats(): GameStats { return { ...this.stats }; }
}