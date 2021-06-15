/**
 * Verify collisions fire properly for compound GO vs invidual tiles and vs all tiles
 */

import Phaser from "phaser";
import { startTest, failTest, passTest } from "../../test-utils";

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map-collision-mapped.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );
    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createLayer("Lava", tileset, 0, 0);

    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    // Compound body cross
    const graphics = this.add.graphics().setData("name", "bars");
    const M = Phaser.Physics.Matter.Matter;
    const compoundBody = M.Body.create({
      parts: [
        M.Bodies.rectangle(0, 0, 20, 200),
        M.Bodies.rectangle(100, 0, 20, 200),
        M.Bodies.rectangle(200, 0, 20, 200),
        M.Bodies.rectangle(300, 0, 20, 200),
      ],
    });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-160, -100, 20, 200);
    graphics.fillRect(-60, -100, 20, 200);
    graphics.fillRect(40, -100, 20, 200);
    graphics.fillRect(140, -100, 20, 200);
    this.matter.add.gameObject(graphics).setExistingBody(compoundBody).setPosition(400, 0);

    const signTile = groundLayer.getTileAt(4, 5);

    const state = { hitSign: false, tilesHit: 0 };
    const updateState = () => {
      if (state.hitSign && state.tilesHit >= 5) passTest();
    };
    startTest();

    this.matterCollision.addOnCollideStart({
      objectA: graphics,
      callback: (pairData) => {
        const { bodyA, bodyB, gameObjectA, gameObjectB } = pairData;
        if (gameObjectB instanceof Phaser.Tilemaps.Tile) {
          state.tilesHit++;
          updateState();
        }
      },
    });

    this.matterCollision.addOnCollideStart({
      objectA: graphics,
      objectB: signTile,
      callback: () => {
        state.hitSign = true;
        updateState();
      },
    });
  }
}
