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

export function createPair(bodyA, bodyB) {
  return { bodyA, bodyB };
}
