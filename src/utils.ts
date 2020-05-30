import { Physics } from "phaser";
import logger from "./logger";

// prettier-ignore
import M = Physics.Matter.Matter;

/**
 * Get the root body of a compound Matter body
 * @private
 */
export function getRootBody(body: M.Body) {
  while (body.parent !== body) body = body.parent;
  return body;
}

/**
 * Duck type to check if the given object is a Matter body (because there isn't a prototype)
 * @private
 */
export function isMatterBody(obj: any) {
  return (
    obj.hasOwnProperty("collisionFilter") &&
    obj.hasOwnProperty("parts") &&
    obj.hasOwnProperty("slop")
  );
}

/**
 * Check if object is an acceptable physical object for this plugin - a Matter Body, a tile, or an
 * object with a body property
 * @private
 */
export function isPhysicsObject(obj: any) {
  return isMatterBody(obj) || obj.body || obj instanceof Phaser.Tilemaps.Tile;
}

/** @private */
export function warnInvalidObject(obj: any) {
  logger.warn(
    `Expected a Matter body, Tile or an object with a body property, but instead, recieved: ${obj}`
  );
}
