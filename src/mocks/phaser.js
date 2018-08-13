import EventEmitter from "eventemitter3";
import { MatterTileBody, Tile } from "./game-objects";

export default {
  Plugins: {
    ScenePlugin: class ScenePlugin {}
  },
  Physics: {
    Matter: {
      TileBody: MatterTileBody
    }
  },
  Tilemaps: {
    Tile
  },
  Events: {
    EventEmitter
  }
};
