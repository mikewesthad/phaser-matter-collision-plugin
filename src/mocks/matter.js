import { Tile, MatterTileBody } from "./game-objects";

export function emitMatterCollisionEvent(scene, eventName, pairs) {
  scene.matter.world.emit(eventName, { pairs });
}

export function createBody(options = {}) {
  // Necessary for faking body detection: collisionFilter, slop, parts
  if (!options.collisionFilter) options.collisionFilter = 0;
  if (!options.slop) options.slop = 0.05;
  const body = { ...options };
  body.parts = [body];
  body.parent = body;
  return body;
}

export function createPair(objectA, objectB) {
  let bodyA = objectA.body ? objectA.body : objectA;
  let bodyB = objectB.body ? objectB.body : objectB;
  if (objectA instanceof Tile) bodyA = objectA.physics.matterBody.body;
  if (objectB instanceof Tile) bodyB = objectB.physics.matterBody.body;
  return { bodyA, bodyB };
}
