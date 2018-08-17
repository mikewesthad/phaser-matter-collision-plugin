/**
 * Verify that the matterCollision's addOnCollideStart, addOnCollideActive and addOnCollideEnd fire
 * correctly for GO vs GO collisions. Three objects are created and only collisions between two of
 * them should fire.
 */

import Phaser from "phaser";
import { startTest, failTest, passTest } from "../../test-utils";

startTest();

export default class MainScene extends Phaser.Scene {
  constructor() {
    super();
    this.restartCount = 0;
  }

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
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    const image = this.matter.add.image(250, 50, "emoji", "1f92c", {
      restitution: 0,
      friction: 1,
      shape: "circle"
    });

    this.matterCollision.addOnCollideStart({
      objectA: image,
      callback: () => {
        this.matterCollision.removeAllCollideListenersOf(image);
        this.restartCount += 1;
        this.scene.restart();
        if (this.restartCount === 3) {
          passTest();
          this.game.destroy(true);
        }
      }
    });
  }
}
