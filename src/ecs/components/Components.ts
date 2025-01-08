export interface Position {
  x: number;
  y: number;
}

export interface Sprite {
  image: string;
  width: number;
  height: number;
}

export interface Player {
  speed: number;
}

export interface Terrain {
  type: 'water' | 'grass' | 'forest' | 'mountain';
  walkable: boolean;
}

export interface Collectible {
  type: string;
  value: number;
}