import logger from "./logger";

/**
 * Get the root body of a compound Matter body.
 */
export function getRootBody(body: MatterJS.BodyType) {
  while (body.parent !== body) body = body.parent;
  return body;
}

/**
 * @param obj
 */
export function warnInvalidObject(obj: any) {
  logger.warn(
    `Expected a Matter body, a Tile, a GameObject, a Sprite, an Image, a TileBody, or an object with a body property, but instead, received: ${obj}`
  );
}
