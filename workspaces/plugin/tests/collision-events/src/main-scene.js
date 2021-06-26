/**
 * Verify that the matterCollision.events "collisionstart", "collisionend", "collisionactive" are
 * all firing for a bouncing ball hitting the ground, bouncing and then coming to rest.
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

    const image = this.matter.add.image(250, 50, "emoji", "1f92c", {
      restitution: 0.25,
      friction: 0,
      shape: "circle",
    });

    const state = { startFired: false, activeFired: false, endFired: false };
    const updateState = ({ startFired, activeFired, endFired }) => {
      if (startFired) state.startFired = true;
      if (activeFired) state.activeFired = true;
      if (endFired) state.endFired = true;
      if (state.startFired && state.activeFired && state.endFired) passTest();
    };
    startTest();

    this.matterCollision.events.on("collisionstart", (event) => {
      event.pairs.forEach(({ gameObjectA, gameObjectB }) => {
        if ([gameObjectA, gameObjectB].includes(image)) {
          updateState({ startFired: true });
        }
      });
    });
    this.matterCollision.events.on("collisionactive", (event) => {
      event.pairs.forEach(({ gameObjectA, gameObjectB }) => {
        if ([gameObjectA, gameObjectB].includes(image)) {
          updateState({ activeFired: true });
        }
      });
    });
    this.matterCollision.events.on("collisionend", (event) => {
      event.pairs.forEach(({ gameObjectA, gameObjectB }) => {
        if ([gameObjectA, gameObjectB].includes(image)) {
          updateState({ endFired: true });
        }
      });
    });
  }
}
