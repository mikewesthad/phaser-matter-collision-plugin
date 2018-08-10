import Phaser from "phaser";
import { getRootBody, isMatterBody } from "./matter-utils";

const isPhysicsObject = obj => isMatterBody(obj) || obj.body;
const warnInvalidObject = obj =>
  console.warn(
    `Expected a matter body or a GameObject with a body property, but instead, recieved: ${obj}`
  );

export default class MatterCollisionPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);

    this.scene = scene;
    this.systems = this.scene.sys;

    this.events = new Phaser.Events.EventEmitter();

    this.collisionStartListeners = new Map();
    this.collisionEndListeners = new Map();
    this.collisionActiveListeners = new Map();

    this.onCollisionStart = this.onCollisionEvent.bind(
      this,
      this.collisionStartListeners,
      "collisionstart"
    );

    this.onCollisionEnd = this.onCollisionEvent.bind(
      this,
      this.collisionEndListeners,
      "collisionend"
    );

    this.onCollisionActive = this.onCollisionEvent.bind(
      this,
      this.collisionActiveListeners,
      "collisionactive"
    );

    this.scene.events.once("start", this.start, this);
  }

  // physicsObject = Matter.Body|Sprite|Image|GO with body
  // other = Matter.Body|Sprite|Image|GO with body or array containing any of those
  // Could also add options: { checkTiles = true, checkMatterBodies = true, checkGameObjects = true }
  // Could add Tile as a possible parameter, or TilemapLayer
  addCollisionStart(physicsObject, others, callback, context) {
    this.addCollision(this.collisionStartListeners, physicsObject, others, callback, context);
  }
  addCollisionEnd(physicsObject, others, callback, context) {
    this.addCollision(this.collisionEndListeners, physicsObject, others, callback, context);
  }
  addCollisionActive(physicsObject, others, callback, context) {
    this.addCollision(this.collisionActiveListeners, physicsObject, others, callback, context);
  }

  removeCollisionStart(physicsObject, others, callback, context) {
    this.removeCollision(this.collisionStartListeners, physicsObject, others, callback, context);
  }
  removeCollisionEnd(physicsObject, others, callback, context) {
    this.removeCollision(this.collisionEndListeners, physicsObject, others, callback, context);
  }
  removeCollisionActive(physicsObject, others, callback, context) {
    this.removeCollision(this.collisionActiveListeners, physicsObject, others, callback, context);
  }

  addCollision(map, physicsObject, others, callback, context) {
    if (!isPhysicsObject(physicsObject)) {
      warnInvalidObject();
      return;
    }
    if (!Array.isArray(others)) others = [others];
    others.forEach(other => {
      if (!isPhysicsObject(other)) {
        warnInvalidObject();
        return;
      }
      this.addCollisionObjectVsObject(map, physicsObject, other, callback, context);
    });
  }

  removeCollision(map, physicsObject, others, callback, context) {
    if (!Array.isArray(others)) others = [others];
    const callbacks = map.get(physicsObject) || [];
    const remainingCallbacks = callbacks.filter(
      cb => !(others.includes(cb.target) && cb.callback === callback && cb.context === context)
    );
    if (remainingCallbacks.length > 0) map.set(physicsObject, remainingCallbacks);
    else map.delete(physicsObject);
  }

  addCollisionObjectVsObject(map, objectA, objectB, callback, context) {
    const callbacks = map.get(objectA) || [];
    callbacks.push({ target: objectB, callback, context });
    this.collisionStartListeners.set(objectA, callbacks);
  }

  /** Phaser.Scene lifecycle event */
  start() {
    console.log("start"); // Verify this only runs once

    this.systems.events.on("shutdown", this.shutdown, this);
    this.systems.events.once("destroy", this.destroy, this);

    if (!this.scene.matter) {
      console.warn("Plugin requires matter!");
      return;
    }

    this.scene.matter.world.on("collisionstart", this.onCollisionStart);
    this.scene.matter.world.on("collisionactive", this.onCollisionActive);
    this.scene.matter.world.on("collisionend", this.onCollisionEnd);
  }

  onCollisionEvent(trackersMap, eventName, event) {
    const pairs = event.pairs;
    pairs.map(pair => {
      const gameObjectA = getRootBody(pair.bodyA).gameObject;
      const gameObjectB = getRootBody(pair.bodyB).gameObject;
      this.events.emit(eventName, pair.bodyA, gameObjectA, pair.bodyB, gameObjectB, pair);
      if (trackersMap.size) {
        this.checkAndEmit(trackersMap, pair.bodyA, pair.bodyB, gameObjectB, pair);
        this.checkAndEmit(trackersMap, gameObjectA, pair.bodyB, gameObjectB, pair);
        this.checkAndEmit(trackersMap, pair.bodyB, pair.bodyA, gameObjectA, pair);
        this.checkAndEmit(trackersMap, gameObjectB, pair.bodyA, gameObjectA, pair);
      }
    });
  }

  checkAndEmit(map, object, otherBody, otherGameObject, pair) {
    const callbacks = map.get(object);
    if (callbacks) {
      callbacks.forEach(({ target, callback, context }) => {
        if (!target || target === otherBody || target === otherGameObject) {
          callback.call(context, otherBody, otherGameObject, pair);
        }
      });
    }
  }

  clearAllListeners() {
    this.collisionStartListeners.clear();
    this.collisionEndListeners.clear();
    this.collisionActiveListeners.clear();
    this.scene.matter.world.off("collisionstart", this.onCollisionStart);
    this.scene.matter.world.off("collisionactive", this.onCollisionActive);
    this.scene.matter.world.off("collisionend", this.onCollisionEnd);
  }

  shutdown() {
    this.clearAllListeners();
  }

  /** Phaser.Scene lifecycle event */
  destroy() {
    this.systems.events.off("start", this.start, this);
    this.clearAllListeners();
    this.scene = undefined;
    this.systems = undefined;
  }
}
