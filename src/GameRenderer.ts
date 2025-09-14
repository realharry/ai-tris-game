import * as PIXI from 'pixi.js';
import { GameEngine } from './GameEngine';
import { GameBoard } from './GameBoard';
import { Color, GameState } from './types';

export class GameRenderer {
  private app: PIXI.Application;
  private gameEngine: GameEngine;
  private boardContainer: PIXI.Container;
  private currentBlockContainer: PIXI.Container;
  private nextBlockContainer: PIXI.Container;
  private cellSize: number = 30;
  private boardOffsetX: number = 50;
  private boardOffsetY: number = 50;

  constructor(gameEngine: GameEngine, parentElement: HTMLElement) {
    this.gameEngine = gameEngine;
    
    this.app = new PIXI.Application({
      width: 600,
      height: 700,
      backgroundColor: 0x222222,
    });

    parentElement.appendChild(this.app.view as HTMLCanvasElement);

    this.boardContainer = new PIXI.Container();
    this.currentBlockContainer = new PIXI.Container();
    this.nextBlockContainer = new PIXI.Container();

    this.app.stage.addChild(this.boardContainer);
    this.app.stage.addChild(this.currentBlockContainer);
    this.app.stage.addChild(this.nextBlockContainer);

    this.setupBoard();
    this.setupNextBlockPreview();
  }

  private setupBoard(): void {
    // Draw board background
    const boardBg = new PIXI.Graphics();
    boardBg.beginFill(0x111111);
    boardBg.drawRect(
      this.boardOffsetX - 2,
      this.boardOffsetY - 2,
      GameBoard.BOARD_WIDTH * this.cellSize + 4,
      GameBoard.BOARD_HEIGHT * this.cellSize + 4
    );
    boardBg.endFill();

    // Draw grid lines
    boardBg.lineStyle(1, 0x444444, 0.5);
    
    // Vertical lines
    for (let x = 0; x <= GameBoard.BOARD_WIDTH; x++) {
      const xPos = this.boardOffsetX + x * this.cellSize;
      boardBg.moveTo(xPos, this.boardOffsetY);
      boardBg.lineTo(xPos, this.boardOffsetY + GameBoard.BOARD_HEIGHT * this.cellSize);
    }
    
    // Horizontal lines
    for (let y = 0; y <= GameBoard.BOARD_HEIGHT; y++) {
      const yPos = this.boardOffsetY + y * this.cellSize;
      boardBg.moveTo(this.boardOffsetX, yPos);
      boardBg.lineTo(this.boardOffsetX + GameBoard.BOARD_WIDTH * this.cellSize, yPos);
    }

    this.boardContainer.addChild(boardBg);
  }

  private setupNextBlockPreview(): void {
    // Next block preview area
    const previewBg = new PIXI.Graphics();
    previewBg.beginFill(0x333333);
    previewBg.drawRect(350, 50, 120, 80);
    previewBg.endFill();

    const previewLabel = new PIXI.Text('Next Block:', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
    });
    previewLabel.x = 355;
    previewLabel.y = 30;

    this.app.stage.addChild(previewBg);
    this.app.stage.addChild(previewLabel);
  }

  public render(): void {
    // Clear previous renders
    this.clearDynamicElements();
    
    // Render board state
    this.renderBoard();
    
    // Render current block
    this.renderCurrentBlock();
    
    // Render next block preview
    this.renderNextBlock();
    
    // Render game over overlay if needed
    if (this.gameEngine.getGameState() === GameState.GAME_OVER) {
      this.renderGameOver();
    }
  }

  private clearDynamicElements(): void {
    // Remove all children except the background
    while (this.currentBlockContainer.children.length > 0) {
      this.currentBlockContainer.removeChildAt(0);
    }
    
    while (this.nextBlockContainer.children.length > 0) {
      this.nextBlockContainer.removeChildAt(0);
    }

    // Clear board tiles (keep background and grid)
    while (this.boardContainer.children.length > 1) {
      this.boardContainer.removeChildAt(1);
    }
  }

  private renderBoard(): void {
    const grid = this.gameEngine.getBoard().getGrid();
    
    for (let y = 0; y < GameBoard.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameBoard.BOARD_WIDTH; x++) {
        const color = grid[y][x];
        if (color !== null) {
          const cell = this.createCell(color);
          cell.x = this.boardOffsetX + x * this.cellSize;
          cell.y = this.boardOffsetY + y * this.cellSize;
          this.boardContainer.addChild(cell);
        }
      }
    }
  }

  private renderCurrentBlock(): void {
    const currentBlock = this.gameEngine.getCurrentBlock();
    if (!currentBlock) return;

    for (const box of currentBlock.boxes) {
      const cell = this.createCell(box.color);
      cell.x = this.boardOffsetX + (currentBlock.position.x + box.position.x) * this.cellSize;
      cell.y = this.boardOffsetY + (currentBlock.position.y + box.position.y) * this.cellSize;
      this.currentBlockContainer.addChild(cell);
    }
  }

  private renderNextBlock(): void {
    const nextBlock = this.gameEngine.getNextBlock();
    if (!nextBlock) return;

    const previewX = 380;
    const previewY = 80;
    const previewCellSize = 20;

    for (const box of nextBlock.boxes) {
      const cell = this.createCell(box.color, previewCellSize);
      cell.x = previewX + box.position.x * previewCellSize;
      cell.y = previewY + box.position.y * previewCellSize;
      this.nextBlockContainer.addChild(cell);
    }
  }

  private createCell(color: Color, size: number = this.cellSize): PIXI.Graphics {
    const cell = new PIXI.Graphics();
    
    const colorValue = color === Color.RED ? 0xff4444 : 0x4444ff;
    const darkColorValue = color === Color.RED ? 0xcc3333 : 0x3333cc;
    
    // Main cell body
    cell.beginFill(colorValue);
    cell.drawRect(1, 1, size - 2, size - 2);
    cell.endFill();
    
    // Border for 3D effect
    cell.lineStyle(1, darkColorValue);
    cell.drawRect(0, 0, size, size);
    
    return cell;
  }

  private renderGameOver(): void {
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();

    const gameOverText = new PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xff4444,
      align: 'center',
    });
    
    gameOverText.anchor.set(0.5);
    gameOverText.x = this.app.screen.width / 2;
    gameOverText.y = this.app.screen.height / 2;

    const restartText = new PIXI.Text('Press R to restart', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
      align: 'center',
    });
    
    restartText.anchor.set(0.5);
    restartText.x = this.app.screen.width / 2;
    restartText.y = this.app.screen.height / 2 + 50;

    this.app.stage.addChild(overlay);
    this.app.stage.addChild(gameOverText);
    this.app.stage.addChild(restartText);
  }

  public destroy(): void {
    this.app.destroy(true);
  }
}