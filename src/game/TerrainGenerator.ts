import { createNoise2D } from 'simplex-noise';

export class TerrainGenerator {
  private static noise2D = createNoise2D();
  private static biomeNoise2D = createNoise2D();
  private static seed: number = Math.random() * 10000;
  
  static setSeed(seed: number) {
    this.seed = seed;
    this.noise2D = createNoise2D();
    this.biomeNoise2D = createNoise2D();
  }
  
  static generateTerrain(width: number, height: number, tileSize: number): any[] {
    const terrain = [];
    const scale = 0.05;
    const biomeScale = 0.03;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Add seed offset to coordinates for variation
        const nx = (x + this.seed * 10) * scale;
        const ny = (y + this.seed * 10) * scale;
        const elevation = (this.noise2D(nx, ny) + 1) / 2;
        
        const bx = (x + this.seed * 5) * biomeScale;
        const by = (y + this.seed * 5) * biomeScale;
        const biomeValue = (this.biomeNoise2D(bx, by) + 1) / 2;
        
        const type = this.getTerrainType(elevation, biomeValue);
        const walkable = type !== 'mountain' && type !== 'deep_water';
        
        terrain.push({
          position: { x: x * tileSize, y: y * tileSize },
          terrain: { 
            type,
            walkable,
            elevation
          },
          sprite: { 
            width: tileSize, 
            height: tileSize 
          }
        });
      }
    }
    
    return this.postProcessTerrain(terrain, width, height);
  }

  private static getTerrainType(elevation: number, biomeValue: number): string {
    // Use both elevation and biome value to determine terrain type
    if (elevation < 0.2) return 'deep_water';
    if (elevation < 0.3) return 'water';
    if (elevation < 0.4) return biomeValue < 0.5 ? 'sand' : 'grass';
    if (elevation < 0.6) return biomeValue < 0.4 ? 'grass' : 'forest';
    if (elevation < 0.8) return biomeValue < 0.6 ? 'forest' : 'hills';
    return 'mountain';
  }

  private static postProcessTerrain(terrain: any[], width: number, height: number): any[] {
    const processed = [...terrain];
    
    // Smooth transitions between different terrain types
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const current = processed[idx];
        const neighbors = this.getNeighbors(processed, x, y, width);
        
        if (this.isIsolatedTile(current, neighbors)) {
          current.terrain.type = this.getMostCommonNeighborType(neighbors);
        }
        
        if (current.terrain.type === 'water' && this.countNeighborsOfType(neighbors, 'deep_water') >= 3) {
          current.terrain.type = 'deep_water';
        }
      }
    }
    
    return processed;
  }

  private static getNeighbors(terrain: any[], x: number, y: number, width: number): any[] {
    const neighbors = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const idx = (y + dy) * width + (x + dx);
        if (terrain[idx]) {
          neighbors.push(terrain[idx]);
        }
      }
    }
    return neighbors;
  }

  private static isIsolatedTile(tile: any, neighbors: any[]): boolean {
    return neighbors.every(n => n.terrain.type !== tile.terrain.type);
  }

  private static getMostCommonNeighborType(neighbors: any[]): string {
    const typeCounts = new Map<string, number>();
    neighbors.forEach(n => {
      typeCounts.set(n.terrain.type, (typeCounts.get(n.terrain.type) || 0) + 1);
    });
    return Array.from(typeCounts.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private static countNeighborsOfType(neighbors: any[], type: string): number {
    return neighbors.filter(n => n.terrain.type === type).length;
  }
}