import { Tilemaps, Types } from "phaser";

import Tile = Tilemaps.Tile;
import MatterBody = Types.Physics.Matter.MatterBody;

/** A valid physics-enabled game object, or just an object that has "body" property */
export type ObjectWithBody = {
  body: MatterJS.BodyType;
};

/**
 * A union of all the types of physics objects we could have in the simulation - from raw Matter.js
 * bodies to tiles and physics-enabled Phaser GameObjects.
 */
export type CollidingObject = MatterBody | MatterJS.BodyType | Tile | ObjectWithBody;

/** Duck type to check if the given object is a Matter body (because there isn't a prototype). */
export function isMatterBody(obj: any): obj is MatterBody {
  return (
    obj.hasOwnProperty("parts") && obj.hasOwnProperty("slop") && obj.hasOwnProperty("gameObject")
  );
}

/**
 * Check if object is an acceptable physical object for this plugin - a Matter Body, a tile, or an
 * object with a body property.
 */
export function isCollidingObject(obj: any): obj is CollidingObject {
  // GameObjects, images, sprites and tile bodies should all have a body property.
  return isMatterBody(obj) || obj.body || obj instanceof Tile;
}
