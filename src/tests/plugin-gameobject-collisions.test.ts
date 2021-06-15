import Plugin from "../phaser-matter-collision-plugin";
import Scene from "../mocks/scene";
import { emitMatterCollisionEvent, createBody, createPair } from "../mocks/matter";
import { Tile } from "../mocks/game-objects";

describe("scene started with matter", () => {
  let scene: Phaser.Scene;
  let plugin: Plugin;

  beforeEach(() => {
    scene = new Scene({ addMatter: true }) as Phaser.Scene;
    plugin = new Plugin(scene as Phaser.Scene, {} as Phaser.Plugins.PluginManager, "");
    scene.events.emit("start");
  });

  test("addOnCollideStart between body and physics-enabled Tile should fire callback with body and Tile", () => {
    const objectA = createBody() as Phaser.Types.Physics.Matter.MatterBody;
    const objectB = new Tile({ withMatter: true }) as Phaser.Tilemaps.Tile;
    const callback = jest.fn();
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideStart({ objectA, objectB, callback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    expect(callback.mock.calls.length).toBe(1);
    const callbackData = callback.mock.calls[0][0];
    expect(callbackData.bodyA).toBe(objectA);
    expect(callbackData.bodyB).toBe((objectB.physics as any).matterBody.body);
    expect(callbackData.gameObjectA).toBe(undefined);
    expect(callbackData.gameObjectB).toBe(objectB);
    expect(callbackData.pair).toBe(pair);
  });

  test("removeOnCollideStart between body and Tile should remove callbacks", () => {
    const objectA = createBody() as Phaser.Types.Physics.Matter.MatterBody;
    const objectB = new Tile({ withMatter: true }) as Phaser.Tilemaps.Tile;
    const callback = jest.fn();
    const pair = createPair(objectA, objectB);
    plugin.addOnCollideStart({ objectA, objectB, callback });
    plugin.removeOnCollideStart({ objectA, objectB, callback });
    emitMatterCollisionEvent(scene, "collisionstart", [pair]);
    expect(callback.mock.calls.length).toBe(0);
  });
});
