import { GameEngine } from '../GameEngine';
import { GameMode, GameState } from '../types';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('constructor', () => {
    it('should initialize with idle state', () => {
      expect(engine.getGameState()).toBe(GameState.IDLE);
    });

    it('should have initial stats', () => {
      const stats = engine.getStats();
      expect(stats.score).toBe(0);
      expect(stats.level).toBe(1);
      expect(stats.linesCleared).toBe(0);
    });

    it('should have a next block ready', () => {
      expect(engine.getNextBlock()).toBeDefined();
      expect(engine.getNextBlock().boxes).toHaveLength(3);
    });
  });

  describe('startGame', () => {
    it('should start human game correctly', () => {
      engine.startGame(GameMode.HUMAN);
      
      expect(engine.getGameState()).toBe(GameState.PLAYING);
      expect(engine.getGameMode()).toBe(GameMode.HUMAN);
      expect(engine.getCurrentBlock()).toBeDefined();
    });

    it('should start AI game correctly', () => {
      engine.startGame(GameMode.AI);
      
      expect(engine.getGameState()).toBe(GameState.PLAYING);
      expect(engine.getGameMode()).toBe(GameMode.AI);
      expect(engine.getCurrentBlock()).toBeDefined();
    });

    it('should reset stats when starting new game', () => {
      // Simulate some progress
      engine.startGame(GameMode.HUMAN);
      
      // Reset and start new game
      engine.resetGame();
      engine.startGame(GameMode.HUMAN);
      
      const stats = engine.getStats();
      expect(stats.score).toBe(0);
      expect(stats.level).toBe(1);
      expect(stats.linesCleared).toBe(0);
    });
  });

  describe('pauseGame', () => {
    it('should pause playing game', () => {
      engine.startGame(GameMode.HUMAN);
      engine.pauseGame();
      
      expect(engine.getGameState()).toBe(GameState.PAUSED);
    });

    it('should resume paused game', () => {
      engine.startGame(GameMode.HUMAN);
      engine.pauseGame();
      engine.pauseGame(); // Second call should resume
      
      expect(engine.getGameState()).toBe(GameState.PLAYING);
    });

    it('should not pause idle game', () => {
      engine.pauseGame();
      expect(engine.getGameState()).toBe(GameState.IDLE);
    });
  });

  describe('resetGame', () => {
    it('should reset game to idle state', () => {
      engine.startGame(GameMode.HUMAN);
      engine.resetGame();
      
      expect(engine.getGameState()).toBe(GameState.IDLE);
      expect(engine.getCurrentBlock()).toBeNull();
    });

    it('should reset stats', () => {
      engine.startGame(GameMode.HUMAN);
      engine.resetGame();
      
      const stats = engine.getStats();
      expect(stats.score).toBe(0);
      expect(stats.level).toBe(1);
      expect(stats.linesCleared).toBe(0);
    });
  });

  describe('moveBlock', () => {
    beforeEach(() => {
      engine.startGame(GameMode.HUMAN);
    });

    it('should move block left when valid', () => {
      const currentBlock = engine.getCurrentBlock();
      const originalX = currentBlock!.position.x;
      
      const moved = engine.moveBlock('left');
      expect(moved).toBe(true);
      expect(currentBlock!.position.x).toBe(originalX - 1);
    });

    it('should move block right when valid', () => {
      const currentBlock = engine.getCurrentBlock();
      const originalX = currentBlock!.position.x;
      
      const moved = engine.moveBlock('right');
      expect(moved).toBe(true);
      expect(currentBlock!.position.x).toBe(originalX + 1);
    });

    it('should move block down when valid', () => {
      const currentBlock = engine.getCurrentBlock();
      const originalY = currentBlock!.position.y;
      
      const moved = engine.moveBlock('down');
      expect(moved).toBe(true);
      expect(currentBlock!.position.y).toBe(originalY + 1);
    });

    it('should not move block when invalid', () => {
      // Try to move way left (should be invalid)
      for (let i = 0; i < 10; i++) {
        engine.moveBlock('left');
      }
      
      const currentBlock = engine.getCurrentBlock();
      const originalX = currentBlock!.position.x;
      
      const moved = engine.moveBlock('left');
      expect(moved).toBe(false);
      expect(currentBlock!.position.x).toBe(originalX);
    });

    it('should not move block when game is not playing', () => {
      engine.pauseGame();
      
      const moved = engine.moveBlock('left');
      expect(moved).toBe(false);
    });
  });

  describe('rotateBlock', () => {
    beforeEach(() => {
      engine.startGame(GameMode.HUMAN);
    });

    it('should rotate block when valid', () => {
      const currentBlock = engine.getCurrentBlock();
      const originalRotation = currentBlock!.rotation;
      
      const rotated = engine.rotateBlock();
      expect(rotated).toBe(true);
      
      // Get the current block again as rotation creates a new block object
      const rotatedBlock = engine.getCurrentBlock();
      expect(rotatedBlock!.rotation).toBe((originalRotation + 90) % 360);
    });

    it('should not rotate block when game is not playing', () => {
      engine.pauseGame();
      
      const rotated = engine.rotateBlock();
      expect(rotated).toBe(false);
    });
  });

  describe('update', () => {
    it('should not update when game is not playing', () => {
      const originalState = engine.getGameState();
      engine.update(1000);
      expect(engine.getGameState()).toBe(originalState);
    });

    it('should update when game is playing', () => {
      engine.startGame(GameMode.HUMAN);
      const currentBlock = engine.getCurrentBlock();
      const originalY = currentBlock!.position.y;
      
      // Update with enough time to trigger block drop
      engine.update(1500);
      
      // Block should have moved down or been replaced
      const newBlock = engine.getCurrentBlock();
      expect(newBlock!.position.y >= originalY).toBe(true);
    });
  });
});