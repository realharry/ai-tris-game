export enum Color {
  RED = 'red',
  BLUE = 'blue',
}

export enum BlockType {
  STRAIGHT = 'straight',
  BENT = 'bent',
}

export interface Position {
  x: number;
  y: number;
}

export interface Box {
  position: Position;
  color: Color;
}

export interface Block {
  id: string;
  type: BlockType;
  boxes: Box[];
  position: Position;
  rotation: number;
}

export enum GameMode {
  HUMAN = 'human',
  AI = 'ai',
}

export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

export interface GameStats {
  score: number;
  level: number;
  linesCleared: number;
}