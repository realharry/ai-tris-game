import { Block, Color, Position } from './types';

export class GameBoard {
  public static readonly BOARD_WIDTH = 8;
  public static readonly BOARD_HEIGHT = 16;
  
  private grid: (Color | null)[][];

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): (Color | null)[][] {
    return Array.from({ length: GameBoard.BOARD_HEIGHT }, () => 
      Array.from({ length: GameBoard.BOARD_WIDTH }, () => null)
    );
  }

  public getGrid(): (Color | null)[][] {
    return this.grid.map(row => [...row]); // Return a copy
  }

  public getCellColor(x: number, y: number): Color | null {
    if (x < 0 || x >= GameBoard.BOARD_WIDTH || y < 0 || y >= GameBoard.BOARD_HEIGHT) {
      return null;
    }
    return this.grid[y][x];
  }

  public setCellColor(x: number, y: number, color: Color | null): void {
    if (x >= 0 && x < GameBoard.BOARD_WIDTH && y >= 0 && y < GameBoard.BOARD_HEIGHT) {
      this.grid[y][x] = color;
    }
  }

  public isValidPosition(block: Block, position: Position): boolean {
    for (const box of block.boxes) {
      const newX = position.x + box.position.x;
      const newY = position.y + box.position.y;
      
      // Check boundaries
      if (newX < 0 || newX >= GameBoard.BOARD_WIDTH || 
          newY < 0 || newY >= GameBoard.BOARD_HEIGHT) {
        return false;
      }
      
      // Check collision with existing blocks
      if (this.grid[newY][newX] !== null) {
        return false;
      }
    }
    return true;
  }

  public placeBlock(block: Block): void {
    for (const box of block.boxes) {
      const x = block.position.x + box.position.x;
      const y = block.position.y + box.position.y;
      this.setCellColor(x, y, box.color);
    }
  }

  public clearCompletedRows(): number {
    const completedRows: number[] = [];
    
    // Find completed rows (all same color)
    for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
      if (this.isRowComplete(y)) {
        completedRows.push(y);
      }
    }
    
    // Remove completed rows from bottom to top to maintain indices
    completedRows.reverse().forEach(rowIndex => {
      this.grid.splice(rowIndex, 1);
      this.grid.unshift(Array(GameBoard.BOARD_WIDTH).fill(null));
    });
    
    return completedRows.length;
  }

  private isRowComplete(y: number): boolean {
    const row = this.grid[y];
    
    // Count occurrences of each color (excluding nulls)
    const colorCounts: { [key in Color]?: number } = {};
    
    for (const cell of row) {
      if (cell !== null) {
        colorCounts[cell] = (colorCounts[cell] || 0) + 1;
      }
    }
    
    // Check if any color appears 6 or more times in the row
    return Object.values(colorCounts).some(count => count >= 6);
  }

  public isGameOver(): boolean {
    // Game is over if the top row has any blocks
    return this.grid[0].some(cell => cell !== null);
  }

  public getFilledHeight(): number {
    for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
      if (this.grid[y].some(cell => cell !== null)) {
        return GameBoard.BOARD_HEIGHT - y;
      }
    }
    return 0;
  }

  public getHoles(): number {
    let holes = 0;
    for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
      let foundBlock = false;
      for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
        if (this.grid[y][x] !== null) {
          foundBlock = true;
        } else if (foundBlock) {
          holes++;
        }
      }
    }
    return holes;
  }

  public clear(): void {
    this.grid = this.createEmptyGrid();
  }
}