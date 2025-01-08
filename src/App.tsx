import React, { useEffect, useRef } from 'react';
import { World } from './ecs/core/World';
import { RenderSystem } from './ecs/systems/RenderSystem';
import { MovementSystem } from './ecs/systems/MovementSystem';
import { CollectibleSystem } from './ecs/systems/CollectibleSystem';
import { TerrainGenerator } from './game/TerrainGenerator';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const systemsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 800;
    canvas.height = 600;

    const world = new World();
    worldRef.current = world;

    // Generate terrain
    const terrain = TerrainGenerator.generateTerrain(20, 15, 40);
    terrain.forEach(tile => {
      const entity = world.createEntity();
      world.addComponent(entity, 'position', tile.position);
      world.addComponent(entity, 'terrain', tile.terrain);
      world.addComponent(entity, 'sprite', tile.sprite);
    });

    // Create player
    const player = world.createEntity();
    world.addComponent(player, 'position', { x: 400, y: 300 });
    world.addComponent(player, 'player', { speed: 200 });
    world.addComponent(player, 'sprite', { width: 32, height: 32 });

    // Initialize systems
    const renderSystem = new RenderSystem(ctx, world);
    const movementSystem = new MovementSystem(world, renderSystem);
    const collectibleSystem = new CollectibleSystem(world);
    systemsRef.current = [renderSystem, movementSystem, collectibleSystem];

    // Generate initial collectibles
    movementSystem.generateNewCollectibles();

    // Game loop
    let lastTime = 0;
    function gameLoop(timestamp: number) {
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      movementSystem.update(deltaTime);
      collectibleSystem.update();
      renderSystem.update();

      requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl text-white mb-4">HoloExplorer</h1>
        <div className="mb-4">
          <span className="text-white">Score: </span>
          <span id="score" className="text-yellow-400">0</span>
        </div>
        <canvas
          ref={canvasRef}
          className="border-4 border-indigo-500"
        />
        <p className="text-white mt-4">Use arrow keys to move</p>
      </div>
    </div>
  );
}

export default App;