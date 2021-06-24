import PhaserMatterCollisionPlugin from "./phaser-matter-collision-plugin";
import { getRootBody } from "./utils";
import {
  isCollidingObject,
  isMatterBody,
  ObjectWithBody,
  CollidingObject,
} from "./valid-collision-object";
import {
  ExtendedMatterCollisionData,
  CollisionEvent,
  EventData,
  CollideCallback,
  CollideAConfig,
  CollideABConfig,
  CollideContext,
  Unsubscribe,
} from "./collision-types";

export default PhaserMatterCollisionPlugin;

export {
  getRootBody,
  isCollidingObject,
  isMatterBody,
  ObjectWithBody,
  CollidingObject,
      ExtendedMatterCollisionData,
  CollisionEvent,
  EventData,
  CollideCallback,
  CollideAConfig,
  CollideABConfig,
  CollideContext,
  Unsubscribe,
};
