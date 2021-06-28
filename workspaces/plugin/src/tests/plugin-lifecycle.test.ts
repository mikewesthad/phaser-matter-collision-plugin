import Plugin from "../phaser-matter-collision-plugin";
import Scene from "../mocks/scene";

jest.mock("../logger");
import logger from "../logger";

describe("scene started without matter", () => {
  let scene: Phaser.Scene;
  let plugin: Plugin;

  beforeEach(() => {
    scene = new Scene({ addMatter: false }) as Phaser.Scene;
    plugin = new Plugin(scene as Phaser.Scene, {} as Phaser.Plugins.PluginManager, "");
    scene.events.emit("start");
  });

  test("creating plugin without matter should warn the user", () => {
    expect(plugin).toBeDefined();
    expect(logger.warn).toHaveBeenCalled();
  });
});

describe("scene started with matter", () => {
  let scene: Phaser.Scene;
  let plugin: Plugin;

  beforeEach(() => {
    scene = new Scene({ addMatter: true }) as Phaser.Scene;
    plugin = new Plugin(scene as Phaser.Scene, {} as Phaser.Plugins.PluginManager, "");
    scene.events.emit("start");
  });

  test("can create plugin with matter installed", () => {
    expect(plugin).toBeDefined();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("after destroying a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("destroy");
    scene.events.eventNames().forEach((name) => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach((name) => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });

  test("after shutting down a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("destroy");
    scene.events.eventNames().forEach((name) => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach((name) => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });

  test("after restarting a scene, the plugin should be subscribed to matter events", () => {
    scene.events.emit("shutdown");
    scene.events.emit("start");
    expect(scene.matter.world.listenerCount("collisionstart")).not.toBe(0);
    expect(scene.matter.world.listenerCount("collisionend")).not.toBe(0);
    expect(scene.matter.world.listenerCount("collisionactive")).not.toBe(0);
  });
});
