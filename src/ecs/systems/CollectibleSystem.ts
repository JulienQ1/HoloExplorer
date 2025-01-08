import { World } from '../core/World';

export class CollectibleSystem {
  private world: World;

  constructor(world: World) {
    this.world = world;
  }

  update() {
    const playerEntities = this.world.query('position', 'player');
    const collectibleEntities = this.world.query('position', 'collectible');

    for (const playerId of playerEntities) {
      const playerPos = this.world.getComponent(playerId, 'position');
      
      for (const collectibleId of collectibleEntities) {
        const collectiblePos = this.world.getComponent(collectibleId, 'position');
        const collectible = this.world.getComponent(collectibleId, 'collectible');
        
        // Check collision (simple distance-based)
        const dx = playerPos.x - collectiblePos.x;
        const dy = playerPos.y - collectiblePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          // Collect item
          this.world.removeEntity(collectibleId);
          this.onCollect(collectible);
        }
      }
    }
  }

  private onCollect(collectible: any) {
    const score = document.getElementById('score');
    if (score) {
      score.textContent = (parseInt(score.textContent || '0') + collectible.value).toString();
    }
  }
}