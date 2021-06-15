/**
 * Verify that the matterCollision's addOnCollideStart, addOnCollideActive and addOnCollideEnd fire
 * correctly for GO vs GO collisions. Three objects are created and only collisions between two of
 * them should fire.
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
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    const image1 = this.matter.add.image(250, 50, "emoji", "1f92c", {
      restitution: 0,
      friction: 1,
      shape: "circle",
    });

    const image2 = this.matter.add
      .image(250, 150, "emoji", "1f4a9", {
        restitution: 0,
        friction: 1,
        shape: "circle",
      })
      .setScale(0.5);

    const image3 = this.matter.add
      .image(250, 0, "emoji", "1f31e", {
        restitution: 0,
        friction: 1,
        shape: "circle",
      })
      .setScale(0.25);

    const state = { startFired: false, activeFired: false, endFired: false };
    const updateState = ({ startFired, activeFired, endFired }) => {
      if (startFired) state.startFired = true;
      if (activeFired) state.activeFired = true;
      if (endFired) state.endFired = true;
      if (state.startFired && state.activeFired && state.endFired) passTest();
    };

    startTest();

    const scene = this;

    this.matterCollision.addOnCollideStart({
      objectA: image1,
      objectB: image2,
      callback: function (pairData) {
        const { bodyA, gameObjectA, bodyB, gameObjectB, pair } = pairData;
        if (
          !this === scene ||
          gameObjectA !== image1 ||
          gameObjectB !== image2 ||
          bodyA !== image1.body ||
          bodyB !== image2.body ||
          !pair
        ) {
          failTest();
          this.game.destroy(true);
        } else {
          updateState({ startFired: true });
        }
      },
      context: this,
    });

    this.matterCollision.addOnCollideActive({
      objectA: image1,
      objectB: image2,
      callback: function (pairData) {
        const { bodyA, gameObjectA, bodyB, gameObjectB, pair } = pairData;
        if (
          !this === scene ||
          gameObjectA !== image1 ||
          gameObjectB !== image2 ||
          bodyA !== image1.body ||
          bodyB !== image2.body ||
          !pair
        ) {
          failTest();
          this.game.destroy(true);
        } else {
          updateState({ activeFired: true });
        }
      },
      context: this,
    });

    this.matterCollision.addOnCollideEnd({
      objectA: image1,
      objectB: image2,
      callback: function (pairData) {
        const { bodyA, gameObjectA, bodyB, gameObjectB, pair } = pairData;
        if (
          !this === scene ||
          gameObjectA !== image1 ||
          gameObjectB !== image2 ||
          bodyA !== image1.body ||
          bodyB !== image2.body ||
          !pair
        ) {
          failTest();
          this.game.destroy(true);
        } else {
          updateState({ endFired: true });
        }
      },
      context: this,
    });
  }
}
