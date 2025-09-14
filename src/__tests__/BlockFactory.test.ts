import { BlockFactory } from '../BlockFactory';
import { BlockType, Color } from '../types';

describe('BlockFactory', () => {
  describe('createRandomBlock', () => {
    it('should create a block with 3 boxes', () => {
      const block = BlockFactory.createRandomBlock();
      expect(block.boxes).toHaveLength(3);
    });

    it('should create a block with a valid type', () => {
      const block = BlockFactory.createRandomBlock();
      expect(Object.values(BlockType)).toContain(block.type);
    });

    it('should create a block with valid colors', () => {
      const block = BlockFactory.createRandomBlock();
      block.boxes.forEach(box => {
        expect(Object.values(Color)).toContain(box.color);
      });
    });

    it('should create a block with starting position', () => {
      const block = BlockFactory.createRandomBlock();
      expect(block.position).toEqual({ x: 3, y: 0 });
    });

    it('should create blocks with unique IDs', () => {
      const block1 = BlockFactory.createRandomBlock();
      const block2 = BlockFactory.createRandomBlock();
      expect(block1.id).not.toBe(block2.id);
    });
  });

  describe('getAllBlockVariants', () => {
    it('should return 20 different block variants', () => {
      const variants = BlockFactory.getAllBlockVariants();
      expect(variants).toHaveLength(20); // 10 types (2 straight + 8 bent) × 2 colors each
    });

    it('should include both block types', () => {
      const variants = BlockFactory.getAllBlockVariants();
      const types = variants.map(v => v.type);
      expect(types).toContain(BlockType.STRAIGHT);
      expect(types).toContain(BlockType.BENT);
    });

    it('should include both colors', () => {
      const variants = BlockFactory.getAllBlockVariants();
      const colors = variants.flatMap(v => v.boxes.map(b => b.color));
      expect(colors).toContain(Color.RED);
      expect(colors).toContain(Color.BLUE);
    });
  });

  describe('rotateBlock', () => {
    it('should rotate a block and maintain 3 boxes', () => {
      const originalBlock = BlockFactory.createRandomBlock();
      const rotatedBlock = BlockFactory.rotateBlock(originalBlock);
      expect(rotatedBlock.boxes).toHaveLength(3);
    });

    it('should update rotation value', () => {
      const originalBlock = BlockFactory.createRandomBlock();
      const rotatedBlock = BlockFactory.rotateBlock(originalBlock);
      expect(rotatedBlock.rotation).toBe((originalBlock.rotation + 90) % 360);
    });

    it('should preserve colors after rotation', () => {
      const originalBlock = BlockFactory.createRandomBlock();
      const rotatedBlock = BlockFactory.rotateBlock(originalBlock);
      
      const originalColors = originalBlock.boxes.map(b => b.color).sort();
      const rotatedColors = rotatedBlock.boxes.map(b => b.color).sort();
      expect(rotatedColors).toEqual(originalColors);
    });
  });
});