import { MatterTileBody, Tile } from "./game-objects";
const EventEmitter = require("phaser/src/events/EventEmitter");
const SceneEvents = require("phaser/src/scene/events/index");
const MatterEvents = require("phaser/src/physics/matter-js/events/index");

const Plugins = {
  ScenePlugin: class ScenePlugin {},
};
const Physics = {
  Matter: {
    TileBody: MatterTileBody,
    Events: MatterEvents,
  },
};
const Tilemaps = { Tile };
const Events = { EventEmitter };
const Scenes = {
  Events: SceneEvents,
};
const Types = {};
const Phaser = {
  Plugins,
  Physics,
  Tilemaps,
  Events,
  Scenes,
  Types,
};

export default Phaser;
export { Plugins, Physics, Tilemaps, Events, Types, Scenes };
