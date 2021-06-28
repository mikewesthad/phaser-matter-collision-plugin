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

export {
  PhaserMatterCollisionPlugin,
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

export default PhaserMatterCollisionPlugin;
