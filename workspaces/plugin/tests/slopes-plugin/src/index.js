import Phaser from "phaser";
import PhaserMatterCollisionPlugin from "../../../src";
import Slopes from "phaser-slopes";
import MainScene from "./main-scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000c1f",
  parent: "game-container",
  pixelArt: true,
  scene: MainScene,
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  plugins: {
    scene: [
      {
        key: "MatterCollisionPlugin",
        plugin: PhaserMatterCollisionPlugin,
        mapping: "matterCollision",
      },
      {
        key: "Slopes",
        plugin: Slopes,
        mapping: "slopes",
      },
    ],
  },
};

const game = new Phaser.Game(config);
