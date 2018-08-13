import Plugin from "./phaser-matter-collision-plugin";
import EventEmitter from "eventemitter3";
import Scene from "./mocks/scene";
import { emitMatterCollisionEvent, createBody, createPair } from "./mocks/matter";

jest.mock("./logger.js");
import logger from "./logger";

describe("scene started without matter", () => {
  let scene;
  let plugin;

  beforeEach(() => {
    scene = new Scene({ addMatter: false });
    plugin = new Plugin(scene, {});
    scene.events.emit("start");
  });

  test("creating plugin without matter should warn the user", () => {
    expect(plugin).toBeDefined();
    expect(logger.warn).toHaveBeenCalled();
  });
});

describe("scene started with matter", () => {
  let scene;
  let plugin;

  beforeEach(() => {
    scene = new Scene({ addMatter: true });
    plugin = new Plugin(scene, {});
    scene.events.emit("start");
  });

  test("can create plugin with matter installed", () => {
    expect(plugin).toBeDefined();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("after destroying a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("destroy");
    scene.events.eventNames().forEach(name => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach(name => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });

  test("after shutting down a scene, the plugin should not listen to any scene or matter world events", () => {
    scene.events.emit("destroy");
    scene.events.eventNames().forEach(name => {
      expect(scene.events.listenerCount(name)).toBe(0);
    });
    scene.matter.world.eventNames().forEach(name => {
      expect(scene.matter.world.listenerCount(name)).toBe(0);
    });
  });

  test("addOnCollideStart between two colliding matter bodies should invoke the callback with the correct event data", () => {
    const objectA = createBody();
    const objectB = createBody();
    const callback = jest.fn();
    const context = "test-context";
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideStart({ objectA, objectB, callback, context });
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.instances[0]).toBe(context);
    const callbackData = callback.mock.calls[0][0];
    expect(callbackData.bodyA).toBe(objectA);
    expect(callbackData.bodyB).toBe(objectB);
    expect(callbackData.gameObjectA).toBe(undefined);
    expect(callbackData.gameObjectB).toBe(undefined);
    expect(callbackData.pair).toBe(pair);
  });

  test("addOnCollideActive between two colliding matter bodies should invoke the callback", () => {
    const objectA = createBody();
    const objectB = createBody();
    const callback = jest.fn();
    const context = "test-context";
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideActive({ objectA, objectB, callback, context });
    emitMatterCollisionEvent(scene, "collisionactive", [pair]);
    expect(callback.mock.calls.length).toBe(1);
  });

  test("addOnCollideEnd between two colliding matter bodies should invoke the callback", () => {
    const objectA = createBody();
    const objectB = createBody();
    const callback = jest.fn();
    const context = "test-context";
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideEnd({ objectA, objectB, callback, context });
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    expect(callback.mock.calls.length).toBe(1);
  });

  test("addOnCollideXXX should only be invoked for the corresponding matter collision event", () => {
    const objectA = createBody();
    const objectB = createBody();
    const startCallback = jest.fn();
    const activeCallback = jest.fn();
    const endCallback = jest.fn();
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideEnd({ objectA, objectB, callback: endCallback });
    plugin.addOnCollideActive({ objectA, objectB, callback: activeCallback });
    plugin.addOnCollideStart({ objectA, objectB, callback: startCallback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    emitMatterCollisionEvent(scene, "collisionactive", [pair]);
    emitMatterCollisionEvent(scene, "collisionactive", [pair]);
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    expect(endCallback.mock.calls.length).toBe(3);
    expect(activeCallback.mock.calls.length).toBe(2);
    expect(startCallback.mock.calls.length).toBe(1);
  });

  test("addOnCollideXXX should no longer fire callback after removeOnCollideXXX", () => {
    const objectA = createBody();
    const objectB = createBody();
    const startCallback = jest.fn();
    const activeCallback = jest.fn();
    const endCallback = jest.fn();
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideEnd({ objectA, objectB, callback: endCallback });
    plugin.addOnCollideActive({ objectA, objectB, callback: activeCallback });
    plugin.addOnCollideStart({ objectA, objectB, callback: startCallback });
    plugin.removeOnCollideEnd({ objectA, objectB, callback: endCallback });
    plugin.removeOnCollideActive({ objectA, objectB, callback: activeCallback });
    plugin.removeOnCollideStart({ objectA, objectB, callback: startCallback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    emitMatterCollisionEvent(scene, "collisionactive", [pair]);
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    expect(endCallback.mock.calls.length).toBe(0);
    expect(activeCallback.mock.calls.length).toBe(0);
    expect(startCallback.mock.calls.length).toBe(0);
  });

  test("removeAllCollideListeners should remove all callbacks", () => {
    const objectA = createBody();
    const objectB = createBody();
    const startCallback = jest.fn();
    const activeCallback = jest.fn();
    const endCallback = jest.fn();
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideEnd({ objectA, objectB, callback: endCallback });
    plugin.addOnCollideActive({ objectA, objectB, callback: activeCallback });
    plugin.addOnCollideStart({ objectA, objectB, callback: startCallback });
    plugin.removeAllCollideListeners();
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    emitMatterCollisionEvent(scene, "collisionactive", [pair]);
    emitMatterCollisionEvent(scene, "collisionend", [pair]);
    expect(endCallback.mock.calls.length).toBe(0);
    expect(activeCallback.mock.calls.length).toBe(0);
    expect(startCallback.mock.calls.length).toBe(0);
  });

  test("addOnCollideStart without objectB should listen for all objectA collisions", () => {
    const objectA = createBody();
    const objectB = createBody();
    const objectC = createBody();
    const callback = jest.fn();
    const pair1 = createPair(objectA, objectB);
    const pair2 = createPair(objectA, objectC);
    plugin.addOnCollideStart({ objectA, callback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair1, pair2]);
    expect(callback.mock.calls.length).toBe(2);
  });

  test("addOnCollideStart should listen for objectA regardless of pair ordering", () => {
    const objectA = createBody();
    const objectB = createBody();
    const callback = jest.fn();
    const pair1 = createPair(objectA, objectB);
    const pair2 = createPair(objectB, objectA);
    plugin.addOnCollideStart({ objectA, callback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair1, pair2]);
    expect(callback.mock.calls.length).toBe(2);
  });

  test("addOnCollideStart without objectB should ONLY listen for all objectA collisions", () => {
    const objectA = createBody();
    const objectB = createBody();
    const objectC = createBody();
    const callback = jest.fn();
    const pair1 = createPair(objectA, objectB);
    const pair2 = createPair(objectB, objectC);
    plugin.addOnCollideStart({ objectA, callback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair1, pair2]);
    expect(callback.mock.calls.length).toBe(1);
  });
});
