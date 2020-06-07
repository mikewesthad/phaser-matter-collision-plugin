import PhaserMatterCollisionPlugin from "./phaser-matter-collision-plugin";
import { getRootBody } from "./utils";
import {
  isCollidingObject,
  isMatterBody,
  ObjectWithBody,
  CollidingObject,
} from "./valid-collision-object";

export default PhaserMatterCollisionPlugin;

export { getRootBody, isCollidingObject, isMatterBody, ObjectWithBody, CollidingObject };
