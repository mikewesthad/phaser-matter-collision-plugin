import { createBody } from "./matter";

export class Tile {
  constructor({ withMatter = false }) {
    this.physics = {};

    if (withMatter) this.physics.matterBody = new MatterTileBody(this);
  }
}

export class MatterTileBody {
  constructor(tile) {
    this.body = createBody({ gameObject: this });
    this.tile = tile;
  }
}
