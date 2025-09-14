import { Block, BlockType, Box, Color } from './types';

export class BlockFactory {
  private static blockId = 0;

  // Define the 12 different block patterns (6 straight + 6 bent, each with red/blue colors)
  private static blockPatterns = {
    [BlockType.STRAIGHT]: [
      // Straight blocks: 3 boxes in a line
      { positions: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] }, // Horizontal
      { positions: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] }, // Vertical
    ],
    [BlockType.BENT]: [
      // L-shaped blocks: bent configurations
      { positions: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }] }, // L shape
      { positions: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] }, // Reverse L
      { positions: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }, // Another L
      { positions: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] }, // T-like
    ],
  };

  static createRandomBlock(): Block {
    const types = Object.values(BlockType);
    const colors = Object.values(Color);
    
    const blockType = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const patterns = this.blockPatterns[blockType];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const boxes: Box[] = pattern.positions.map(pos => ({
      position: { x: pos.x, y: pos.y },
      color: color,
    }));

    return {
      id: `block_${++this.blockId}`,
      type: blockType,
      boxes,
      position: { x: 3, y: 0 }, // Start at top center of 8-wide grid
      rotation: 0,
    };
  }

  static getAllBlockVariants(): Block[] {
    const variants: Block[] = [];
    
    for (const blockType of Object.values(BlockType)) {
      for (const color of Object.values(Color)) {
        const patterns = this.blockPatterns[blockType];
        for (const pattern of patterns) {
          const boxes: Box[] = pattern.positions.map(pos => ({
            position: { x: pos.x, y: pos.y },
            color: color,
          }));

          variants.push({
            id: `${blockType}_${color}_${variants.length}`,
            type: blockType,
            boxes,
            position: { x: 0, y: 0 },
            rotation: 0,
          });
        }
      }
    }
    
    return variants;
  }

  static rotateBlock(block: Block): Block {
    // Rotate the block 90 degrees clockwise around its center
    const rotatedBoxes: Box[] = block.boxes.map(box => {
      const relativeX = box.position.x;
      const relativeY = box.position.y;
      
      // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
      const newX = relativeY;
      const newY = -relativeX;
      
      return {
        position: { x: newX, y: newY },
        color: box.color,
      };
    });

    // Normalize positions to ensure they're all positive
    const minX = Math.min(...rotatedBoxes.map(box => box.position.x));
    const minY = Math.min(...rotatedBoxes.map(box => box.position.y));
    
    const normalizedBoxes = rotatedBoxes.map(box => ({
      position: { 
        x: box.position.x - minX, 
        y: box.position.y - minY 
      },
      color: box.color,
    }));

    return {
      ...block,
      boxes: normalizedBoxes,
      rotation: (block.rotation + 90) % 360,
    };
  }
}