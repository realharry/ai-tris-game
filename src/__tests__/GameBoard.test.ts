import { GameBoard } from '../GameBoard';
import { BlockFactory } from '../BlockFactory';
import { Color } from '../types';

describe('GameBoard', () => {
  let board: GameBoard;

  beforeEach(() => {
    board = new GameBoard();
  });

  describe('constructor', () => {
    it('should create an empty 8x16 grid', () => {
      const grid = board.getGrid();
      expect(grid).toHaveLength(GameBoard.BOARD_HEIGHT);
      expect(grid[0]).toHaveLength(GameBoard.BOARD_WIDTH);
      
      // Check all cells are null
      for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
          expect(grid[y][x]).toBeNull();
        }
      }
    });
  });

  describe('getCellColor and setCellColor', () => {
    it('should set and get cell colors correctly', () => {
      board.setCellColor(3, 5, Color.RED);
      expect(board.getCellColor(3, 5)).toBe(Color.RED);
    });

    it('should return null for out-of-bounds coordinates', () => {
      expect(board.getCellColor(-1, 0)).toBeNull();
      expect(board.getCellColor(GameBoard.BOARD_WIDTH, 0)).toBeNull();
      expect(board.getCellColor(0, -1)).toBeNull();
      expect(board.getCellColor(0, GameBoard.BOARD_HEIGHT)).toBeNull();
    });

    it('should not set colors for out-of-bounds coordinates', () => {
      board.setCellColor(-1, 0, Color.RED);
      board.setCellColor(GameBoard.BOARD_WIDTH, 0, Color.RED);
      board.setCellColor(0, -1, Color.RED);
      board.setCellColor(0, GameBoard.BOARD_HEIGHT, Color.RED);
      
      // Board should still be empty
      const grid = board.getGrid();
      for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
          expect(grid[y][x]).toBeNull();
        }
      }
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      const block = BlockFactory.createRandomBlock();
      block.position = { x: 2, y: 2 };
      expect(board.isValidPosition(block, block.position)).toBe(true);
    });

    it('should return false for positions that would go out of bounds', () => {
      const block = BlockFactory.createRandomBlock();
      
      // Test left boundary
      expect(board.isValidPosition(block, { x: -1, y: 0 })).toBe(false);
      
      // Test right boundary  
      expect(board.isValidPosition(block, { x: GameBoard.BOARD_WIDTH, y: 0 })).toBe(false);
      
      // Test top boundary
      expect(board.isValidPosition(block, { x: 0, y: -1 })).toBe(false);
      
      // Test bottom boundary
      expect(board.isValidPosition(block, { x: 0, y: GameBoard.BOARD_HEIGHT })).toBe(false);
    });

    it('should return false for positions that collide with existing blocks', () => {
      // Place a block on the board
      board.setCellColor(3, 5, Color.RED);
      
      const block = BlockFactory.createRandomBlock();
      block.boxes = [{ position: { x: 0, y: 0 }, color: Color.BLUE }];
      
      // Try to place at the same position
      expect(board.isValidPosition(block, { x: 3, y: 5 })).toBe(false);
    });
  });

  describe('placeBlock', () => {
    it('should place a block on the board', () => {
      const block = BlockFactory.createRandomBlock();
      block.position = { x: 2, y: 2 };
      
      board.placeBlock(block);
      
      for (const box of block.boxes) {
        const x = block.position.x + box.position.x;
        const y = block.position.y + box.position.y;
        expect(board.getCellColor(x, y)).toBe(box.color);
      }
    });
  });

  describe('clearCompletedRows', () => {
    it('should clear a completed row of same color', () => {
      // Fill bottom row with red blocks
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.RED);
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(1);
      
      // Bottom row should be empty now
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        expect(board.getCellColor(x, GameBoard.BOARD_HEIGHT - 1)).toBeNull();
      }
    });

    it('should not clear a row with mixed colors when no color has 6+ boxes', () => {
      // Fill bottom row with mixed colors (4 red, 4 blue)
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        const color = x % 2 === 0 ? Color.RED : Color.BLUE;
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, color);
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(0);
    });

    it('should clear a partially filled row when one color has 6+ boxes', () => {
      // Partially fill bottom row with red blocks (7 red, 1 empty)
      for (let x = 0; x < GameBoard.BOARD_WIDTH - 1; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.RED);
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(1);
    });

    it('should clear a row with exactly 6 boxes of same color', () => {
      // Fill bottom row with 6 red, 2 blue
      for (let x = 0; x < 6; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.RED);
      }
      for (let x = 6; x < 8; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.BLUE);
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(1);
    });

    it('should not clear a row with 5 boxes of same color', () => {
      // Fill bottom row with 5 red, 3 blue
      for (let x = 0; x < 5; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.RED);
      }
      for (let x = 5; x < 8; x++) {
        board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, Color.BLUE);
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(0);
    });

    it('should clear a row with mixed colors and gaps when one color has 6+ boxes', () => {
      // Create pattern: R R R B R R R _ (6 red, 1 blue, 1 empty)
      const pattern = [Color.RED, Color.RED, Color.RED, Color.BLUE, Color.RED, Color.RED, Color.RED, null];
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        if (pattern[x] !== null) {
          board.setCellColor(x, GameBoard.BOARD_HEIGHT - 1, pattern[x]);
        }
      }
      
      const clearedRows = board.clearCompletedRows();
      expect(clearedRows).toBe(1);
    });
  });

  describe('isGameOver', () => {
    it('should return false for empty board', () => {
      expect(board.isGameOver()).toBe(false);
    });

    it('should return true when top row has blocks', () => {
      board.setCellColor(0, 0, Color.RED);
      expect(board.isGameOver()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear the entire board', () => {
      // Place some blocks
      board.setCellColor(3, 5, Color.RED);
      board.setCellColor(4, 6, Color.BLUE);
      
      board.clear();
      
      // Check all cells are null
      const grid = board.getGrid();
      for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
          expect(grid[y][x]).toBeNull();
        }
      }
    });
  });
});