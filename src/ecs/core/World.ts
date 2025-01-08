export class World {
  private entities: Map<number, Set<string>> = new Map();
  private components: Map<string, Map<number, any>> = new Map();
  private nextEntityId: number = 1;

  createEntity(): number {
    const entityId = this.nextEntityId++;
    this.entities.set(entityId, new Set());
    return entityId;
  }

  addComponent(entityId: number, componentName: string, data: any) {
    if (!this.components.has(componentName)) {
      this.components.set(componentName, new Map());
    }
    this.components.get(componentName)!.set(entityId, data);
    this.entities.get(entityId)!.add(componentName);
  }

  getComponent(entityId: number, componentName: string): any {
    return this.components.get(componentName)?.get(entityId);
  }

  removeEntity(entityId: number) {
    const componentTypes = this.entities.get(entityId);
    if (componentTypes) {
      for (const componentType of componentTypes) {
        this.components.get(componentType)?.delete(entityId);
      }
      this.entities.delete(entityId);
    }
  }

  query(...componentTypes: string[]): number[] {
    const entities: number[] = [];
    for (const [entityId, components] of this.entities) {
      if (componentTypes.every(type => components.has(type))) {
        entities.push(entityId);
      }
    }
    return entities;
  }
}