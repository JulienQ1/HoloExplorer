import { World } from '../core/World';
import { TerrainGenerator } from '../../game/TerrainGenerator';

export class MovementSystem {
  private world: World;
  private keys: Set<string> = new Set();
  private renderSystem: any;
  private seed: number;

  constructor(world: World, renderSystem: any) {
    this.world = world;
    this.renderSystem = renderSystem;
    this.seed = Math.random() * 10000;
    window.addEventListener('keydown', (e) => this.keys.add(e.key));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));
  }

  update(deltaTime: number) {
    const playerEntities = this.world.query('position', 'player');
    
    for (const entity of playerEntities) {
      const position = this.world.getComponent(entity, 'position');
      const player = this.world.getComponent(entity, 'player');
      const sprite = this.world.getComponent(entity, 'sprite');
      
      const movement = {
        x: 0,
        y: 0
      };

      if (this.keys.has('ArrowUp')) movement.y -= player.speed * deltaTime;
      if (this.keys.has('ArrowDown')) movement.y += player.speed * deltaTime;
      if (this.keys.has('ArrowLeft')) movement.x -= player.speed * deltaTime;
      if (this.keys.has('ArrowRight')) movement.x += player.speed * deltaTime;

      // Store the potential new position
      const newPosition = {
        x: position.x + movement.x,
        y: position.y + movement.y
      };

      // Check collision with terrain
      if (!this.isColliding(newPosition, sprite)) {
        position.x = newPosition.x;
        position.y = newPosition.y;
      }

      // Screen transition
      const canvas = document.querySelector('canvas')!;
      if (position.x < 0) {
        this.renderSystem.startTransition();
        this.handleScreenTransition('left', position);
        this.regenerateTerrain();
        this.generateNewCollectibles();
      }
      if (position.x > canvas.width) {
        this.renderSystem.startTransition();
        this.handleScreenTransition('right', position);
        this.regenerateTerrain();
        this.generateNewCollectibles();
      }
      if (position.y < 0) {
        this.renderSystem.startTransition();
        this.handleScreenTransition('up', position);
        this.regenerateTerrain();
        this.generateNewCollectibles();
      }
      if (position.y > canvas.height) {
        this.renderSystem.startTransition();
        this.handleScreenTransition('down', position);
        this.regenerateTerrain();
        this.generateNewCollectibles();
      }
    }
  }

  private isColliding(position: { x: number; y: number }, sprite: any): boolean {
    const tileSize = 40; // Same as in TerrainGenerator
    
    // Get the corners of the player's hitbox
    const corners = [
      { x: position.x, y: position.y }, // Top-left
      { x: position.x + sprite.width, y: position.y }, // Top-right
      { x: position.x, y: position.y + sprite.height }, // Bottom-left
      { x: position.x + sprite.width, y: position.y + sprite.height } // Bottom-right
    ];

    // Check each corner for collision with terrain
    return corners.some(corner => {
      // Convert position to tile coordinates
      const tileX = Math.floor(corner.x / tileSize);
      const tileY = Math.floor(corner.y / tileSize);

      // Find terrain at this position
      const terrainEntities = this.world.query('position', 'terrain');
      for (const entity of terrainEntities) {
        const terrainPos = this.world.getComponent(entity, 'position');
        const terrain = this.world.getComponent(entity, 'terrain');

        if (
          terrainPos.x === tileX * tileSize &&
          terrainPos.y === tileY * tileSize &&
          !terrain.walkable
        ) {
          return true; // Collision detected
        }
      }
      return false;
    });
  }

  private handleScreenTransition(direction: string, position: any) {
    const canvas = document.querySelector('canvas')!;
    switch (direction) {
      case 'left':
        position.x = canvas.width - 1;
        this.seed -= 1;
        break;
      case 'right':
        position.x = 1;
        this.seed += 1;
        break;
      case 'up':
        position.y = canvas.height - 1;
        this.seed -= 100;
        break;
      case 'down':
        position.y = 1;
        this.seed += 100;
        break;
    }
    TerrainGenerator.setSeed(this.seed);
  }

  private regenerateTerrain() {
    // Remove existing terrain
    const terrainEntities = this.world.query('terrain');
    terrainEntities.forEach(id => this.world.removeEntity(id));

    // Generate new terrain
    const canvas = document.querySelector('canvas')!;
    const tileSize = 40;
    const width = Math.ceil(canvas.width / tileSize);
    const height = Math.ceil(canvas.height / tileSize);
    
    const newTerrain = TerrainGenerator.generateTerrain(width, height, tileSize);
    newTerrain.forEach(tile => {
      const entity = this.world.createEntity();
      this.world.addComponent(entity, 'position', tile.position);
      this.world.addComponent(entity, 'terrain', tile.terrain);
      this.world.addComponent(entity, 'sprite', tile.sprite);
    });
  }

  private generateNewCollectibles() {
    // Remove existing collectibles
    const existingCollectibles = this.world.query('collectible');
    existingCollectibles.forEach(id => this.world.removeEntity(id));

    // Generate new collectibles
    const numCollectibles = Math.floor(Math.random() * 5) + 3;
    const canvas = document.querySelector('canvas')!;
    
    for (let i = 0; i < numCollectibles; i++) {
      const collectible = this.world.createEntity();
      const x = Math.random() * (canvas.width - 40) + 20;
      const y = Math.random() * (canvas.height - 40) + 20;
      
      this.world.addComponent(collectible, 'position', { x, y });
      this.world.addComponent(collectible, 'sprite', { width: 20, height: 20 });
      this.world.addComponent(collectible, 'collectible', {
        type: Math.random() > 0.7 ? 'special' : 'coin',
        value: Math.random() > 0.7 ? 10 : 1
      });
    }
  }
}