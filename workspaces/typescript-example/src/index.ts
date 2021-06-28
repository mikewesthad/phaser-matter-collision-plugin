/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Twemoji, https://github.com/twitter/twemoji, CC-BY 4.0
 *  - Tilesets by Kenney, https://www.kenney.nl/assets/platformer-art-pixel-redux and
 *    https://www.kenney.nl/assets/abstract-platformer, public domain
 */

import Phaser, { Game } from "phaser";
import MainScene from "./main-scene";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";

const pluginConfig = {
  // The plugin class:
  plugin: PhaserMatterCollisionPlugin,
  // Where to store in Scene.Systems, e.g. scene.sys.matterCollision:
  key: "matterCollision" as "matterCollision",
  // Where to store in the Scene, e.g. scene.matterCollision:
  mapping: "matterCollision" as "matterCollision",
};

declare module "phaser" {
  interface Scene {
    [pluginConfig.mapping]: PhaserMatterCollisionPlugin;
  }
  namespace Scenes {
    interface Systems {
      [pluginConfig.key]: PhaserMatterCollisionPlugin;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000c1f",
  parent: "game-container",
  scene: MainScene,
  physics: { default: "matter" },
  plugins: {
    scene: [pluginConfig],
  },
};

const game = new Game(config);
