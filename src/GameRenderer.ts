// Import unsafe-eval module first for Chrome extension compatibility
import '@pixi/unsafe-eval';
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
  private gameOverContainer: PIXI.Container;
  private cellSize: number;
  private boardOffsetX: number;
  private boardOffsetY: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private previewX: number = 0;
  private previewY: number = 0;

  constructor(gameEngine: GameEngine, parentElement: HTMLElement) {
    this.gameEngine = gameEngine;
    
    // Calculate responsive dimensions
    const containerWidth = parentElement.clientWidth || 300;
    this.canvasWidth = Math.min(containerWidth - 20, 320); // Increased max width to accommodate preview
    
    // Calculate cell size to fit the board
    const availableBoardWidth = this.canvasWidth - 80; // Leave more space for preview (80px instead of 60px)
    this.cellSize = Math.floor(availableBoardWidth / GameBoard.BOARD_WIDTH);
    this.cellSize = Math.max(this.cellSize, 12); // Reduced minimum cell size slightly
    this.cellSize = Math.min(this.cellSize, 22); // Reduced maximum cell size to make room for preview
    
    // Calculate required height to fit the full board plus padding
    const requiredBoardHeight = GameBoard.BOARD_HEIGHT * this.cellSize;
    const requiredCanvasHeight = requiredBoardHeight + 40; // Add padding for UI elements
    this.canvasHeight = Math.min(Math.max(requiredCanvasHeight, this.canvasWidth * 1.4), 600);
    
    this.boardOffsetX = 10;
    this.boardOffsetY = 10;
    
    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeight,
      backgroundColor: 0x222222,
    });

    parentElement.appendChild(this.app.view as HTMLCanvasElement);

    this.boardContainer = new PIXI.Container();
    this.currentBlockContainer = new PIXI.Container();
    this.nextBlockContainer = new PIXI.Container();
    this.gameOverContainer = new PIXI.Container();

    this.app.stage.addChild(this.boardContainer);
    this.app.stage.addChild(this.currentBlockContainer);
    this.app.stage.addChild(this.nextBlockContainer);
    this.app.stage.addChild(this.gameOverContainer);

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
    // Calculate preview position - place it to the right of the board or below if narrow
    const boardWidth = GameBoard.BOARD_WIDTH * this.cellSize;
    const availableRightSpace = this.canvasWidth - (this.boardOffsetX + boardWidth + 10);
    
    // Store preview position for consistent use in renderNextBlock
    if (availableRightSpace >= 70) { // Increased minimum space requirement
      this.previewX = this.boardOffsetX + boardWidth + 8;
      this.previewY = this.boardOffsetY + 15; // Offset for the label
    } else {
      this.previewX = this.boardOffsetX;
      this.previewY = this.boardOffsetY + GameBoard.BOARD_HEIGHT * this.cellSize + 25; // Offset for the label
      // Extend canvas height if needed for below-board preview
      if (this.previewY + 60 > this.canvasHeight) {
        this.canvasHeight = this.previewY + 60;
        this.app.renderer.resize(this.canvasWidth, this.canvasHeight);
      }
    }
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

    while (this.gameOverContainer.children.length > 0) {
      this.gameOverContainer.removeChildAt(0);
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

    // Calculate preview area dimensions and position
    const boardWidth = GameBoard.BOARD_WIDTH * this.cellSize;
    const availableRightSpace = this.canvasWidth - (this.boardOffsetX + boardWidth + 10);
    const previewWidth = Math.min(availableRightSpace >= 70 ? availableRightSpace - 5 : this.canvasWidth - this.boardOffsetX, 75);
    const previewHeight = 65;
    
    // Draw preview area background
    const previewBg = new PIXI.Graphics();
    previewBg.beginFill(0x333333);
    previewBg.lineStyle(1, 0x555555);
    previewBg.drawRect(this.previewX, this.previewY - 15, previewWidth, previewHeight);
    previewBg.endFill();
    this.nextBlockContainer.addChild(previewBg);

    // Draw "Next:" label
    const previewLabel = new PIXI.Text('Next:', {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
    });
    previewLabel.x = this.previewX + 2;
    previewLabel.y = this.previewY - 12;
    this.nextBlockContainer.addChild(previewLabel);

    // Use larger preview cell size for better visibility
    const previewCellSize = Math.max(Math.min(this.cellSize * 0.7, 15), 8);

    // Find the bounds of the block to center it properly
    const minX = Math.min(...nextBlock.boxes.map(box => box.position.x));
    const maxX = Math.max(...nextBlock.boxes.map(box => box.position.x));
    const minY = Math.min(...nextBlock.boxes.map(box => box.position.y));
    const maxY = Math.max(...nextBlock.boxes.map(box => box.position.y));
    
    const blockWidth = (maxX - minX + 1) * previewCellSize;
    const blockHeight = (maxY - minY + 1) * previewCellSize;
    
    // Center the block within the preview area
    const previewAreaWidth = previewWidth - 10; // Account for padding
    const previewAreaHeight = previewHeight - 20; // Account for label and padding
    const offsetX = Math.max(5, (previewAreaWidth - blockWidth) / 2);
    const offsetY = Math.max(5, (previewAreaHeight - blockHeight) / 2);

    for (const box of nextBlock.boxes) {
      const cell = this.createCell(box.color, previewCellSize);
      // Adjust for block's minimum coordinates to properly center
      const finalX = this.previewX + offsetX + (box.position.x - minX) * previewCellSize;
      const finalY = this.previewY + offsetY + (box.position.y - minY) * previewCellSize;
      cell.x = finalX;
      cell.y = finalY;
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
      fontSize: Math.min(this.canvasWidth / 8, 24),
      fill: 0xff4444,
      align: 'center',
    });
    
    gameOverText.anchor.set(0.5);
    gameOverText.x = this.app.screen.width / 2;
    gameOverText.y = this.app.screen.height / 2;

    const restartText = new PIXI.Text('Press Reset to restart', {
      fontFamily: 'Arial',
      fontSize: Math.min(this.canvasWidth / 16, 12),
      fill: 0xffffff,
      align: 'center',
    });
    
    restartText.anchor.set(0.5);
    restartText.x = this.app.screen.width / 2;
    restartText.y = this.app.screen.height / 2 + 30;

    this.gameOverContainer.addChild(overlay);
    this.gameOverContainer.addChild(gameOverText);
    this.gameOverContainer.addChild(restartText);
  }

  public destroy(): void {
    this.app.destroy(true);
  }
}