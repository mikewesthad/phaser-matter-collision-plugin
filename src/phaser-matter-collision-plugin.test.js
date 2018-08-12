import Plugin from "./phaser-matter-collision-plugin";
import EventEmitter from "eventemitter3";

jest.mock("./logger.js");

import logger from "./logger";

const createMockScene = ({ addMatter = true }) => {
  const mockScene = { events: new EventEmitter() };
  if (addMatter) {
    mockScene.matter = { world: new EventEmitter() };
  }
  return mockScene;
};
const createMockPluginManager = () => ({});

describe("scene without matter", () => {
  let scene;
  let manager;
  let plugin;

  beforeEach(() => {
    scene = createMockScene({ addMatter: false });
    manager = createMockPluginManager();
    plugin = new Plugin(scene, manager);
  });

  test("creating plugin without matter should warn the user", () => {
    scene.events.emit("start");
    expect(plugin).toBeDefined();
    expect(logger.warn).toHaveBeenCalled();
  });
});

describe("scene with matter", () => {
  let scene;
  let manager;
  let plugin;

  beforeEach(() => {
    scene = createMockScene({ addMatter: true });
    manager = createMockPluginManager();
    plugin = new Plugin(scene, manager);
  });

  test("can create plugin with matter installed", () => {
    scene.events.emit("start");
    expect(plugin).toBeDefined();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("after destroying a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("start");
    scene.events.emit("destroy");
    scene.events.eventNames().forEach(name => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach(name => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });

  test("after shutting down a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("start");
    scene.events.emit("destroy");
    scene.events.eventNames().forEach(name => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach(name => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });
});
