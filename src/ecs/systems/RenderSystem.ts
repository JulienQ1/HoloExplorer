import { World } from '../core/World';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private world: World;
  private transitionAlpha: number = 0;
  private isTransitioning: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, world: World) {
    this.ctx = ctx;
    this.world = world;
  }

  startTransition() {
    this.isTransitioning = true;
    this.transitionAlpha = 0;
  }

  update() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Render terrain
    const terrainEntities = this.world.query('position', 'terrain', 'sprite');
    for (const entity of terrainEntities) {
      const position = this.world.getComponent(entity, 'position');
      const sprite = this.world.getComponent(entity, 'sprite');
      const terrain = this.world.getComponent(entity, 'terrain');
      
      // Get base color for terrain type
      let color = this.getTerrainColor(terrain.type);
      
      // Apply elevation-based shading
      if (terrain.elevation) {
        color = this.adjustColorByElevation(color, terrain.elevation);
      }
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(position.x, position.y, sprite.width, sprite.height);
    }

    // Render collectibles
    const collectibleEntities = this.world.query('position', 'collectible', 'sprite');
    for (const entity of collectibleEntities) {
      const position = this.world.getComponent(entity, 'position');
      const sprite = this.world.getComponent(entity, 'sprite');
      const collectible = this.world.getComponent(entity, 'collectible');
      
      const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
      this.ctx.fillStyle = collectible.type === 'coin' ? '#FFD700' : '#FF69B4';
      this.ctx.beginPath();
      this.ctx.arc(
        position.x + sprite.width / 2,
        position.y + sprite.height / 2,
        sprite.width / 2 * pulse,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Render player
    const playerEntities = this.world.query('position', 'sprite', 'player');
    for (const entity of playerEntities) {
      const position = this.world.getComponent(entity, 'position');
      const sprite = this.world.getComponent(entity, 'sprite');
      
      this.ctx.fillStyle = '#FF0000';
      this.ctx.fillRect(position.x, position.y, sprite.width, sprite.height);
    }

    // Handle screen transition
    if (this.isTransitioning) {
      this.transitionAlpha += 0.05;
      if (this.transitionAlpha >= 1) {
        this.isTransitioning = false;
        this.transitionAlpha = 0;
      }
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  private getTerrainColor(type: string): string {
    switch (type) {
      case 'deep_water': return '#1E4D6B';
      case 'water': return '#4FA4FF';
      case 'sand': return '#F4D03F';
      case 'grass': return '#90EE90';
      case 'forest': return '#228B22';
      case 'hills': return '#8D6E63';
      case 'mountain': return '#6D4C41';
      default: return '#000000';
    }
  }

  private adjustColorByElevation(baseColor: string, elevation: number): string {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Adjust brightness based on elevation
    const factor = 0.7 + (elevation * 0.6); // 0.7-1.3 range
    
    // Apply adjustment and ensure values stay in 0-255 range
    const adjustColor = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
    
    return `rgb(${adjustColor(r)}, ${adjustColor(g)}, ${adjustColor(b)})`;
  }
}