import Phaser from "phaser";
import { getRootBody, isMatterBody } from "./matter-utils";

const isPhysicsObject = obj => isMatterBody(obj) || obj.body;
const warn = console.warn;
const warnInvalidObject = obj =>
  warn(
    `Expected a matter body or a GameObject with a body property, but instead, recieved: ${obj}`
  );

export default class MatterCollisionPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);

    this.scene = scene;
    this.systems = this.scene.sys;

    // Proxies Matter collision events with more Phaser-oriented event data:
    //  collisionstart, collisionend, collisionactive
    //    event data is the normal matter.js event object with a pairs property, except that the
    //    each pair will have a gameObjectA and gameObjectB property
    //  paircollisionstart, paircollisionend, paircollisionactive
    //    event data: {bodyA, bodyB, gameObjectA, gameObjectB, pair}
    this.events = new Phaser.Events.EventEmitter();

    // Map from physics object => {target?, callback, context?}
    this.collisionStartListeners = new Map();
    this.collisionEndListeners = new Map();
    this.collisionActiveListeners = new Map();

    // Create bound versions of the generice onCollisionEvent handler so it can be reused for the
    // three Matter collision events
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
  addOnCollideStart({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
    return this.removeOnCollideStart.bind(this, { objectA, objectB, callback, context });
  }
  addOnCollideEnd({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
    return this.removeOnCollideEnd.bind(this, { objectA, objectB, callback, context });
  }
  addOnCollideActive({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
    return this.removeOnCollideActive.bind(this, { objectA, objectB, callback, context });
  }

  removeOnCollideStart({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
  }
  removeOnCollideEnd({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
  }
  removeOnCollideActive({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
  }

  removeAllCollideStartListeners() {
    this.collisionStartListeners.clear();
  }
  removeAllCollideActiveListeners() {
    this.collisionActiveListeners.clear();
  }
  removeAllCollideEndListeners() {
    this.collisionEndListeners.clear();
  }
  removeAllCollideListeners() {
    this.removeAllCollideStartListeners();
    this.removeAllCollideActiveListeners();
    this.removeAllCollideEndListeners();
  }

  /** Private */
  addOnCollide(map, objectA, objectB, callback, context) {
    if (!callback || typeof callback !== "function") {
      warn(`No valid callback specified. Received: ${callback}`);
      return;
    }
    const objectsA = Array.isArray(objectA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectB) ? objectB : [objectB];
    objectsA.forEach(a => {
      if (!isPhysicsObject(a)) return warnInvalidObject();
      objectsB.forEach(b => {
        if (!isPhysicsObject(b)) return warnInvalidObject();
        this.addOnCollideObjectVsObject(map, a, b, callback, context);
      });
    });
  }

  /** Private */
  removeOnCollide(map, objectA, objectB, callback, context) {
    const objectsA = Array.isArray(objectsA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectsB) ? objectB : [objectB];
    objectsA.forEach(a => {
      const callbacks = map.get(a) || [];
      const remainingCallbacks = callbacks.filter(
        cb => !(objectsB.includes(cb.target) && cb.callback === callback && cb.context === context)
      );
      if (remainingCallbacks.length > 0) map.set(a, remainingCallbacks);
      else map.delete(a);
    });
  }

  /** Private */
  addOnCollideObjectVsObject(map, objectA, objectB, callback, context) {
    const callbacks = map.get(objectA) || [];
    callbacks.push({ target: objectB, callback, context });
    this.collisionStartListeners.set(objectA, callbacks);
  }

  /** Phaser.Scene lifecycle event */
  start() {
    console.log("start"); // Verify this only runs once

    this.systems.events.on("shutdown", this.shutdown, this);
    this.systems.events.once("destroy", this.destroy, this);
    this.subscribeMatterEvents();
  }

  // Emits collisionxxx & paircollisionxxx events, along with invoking listeners to specific body vs
  // body collisions
  onCollisionEvent(listenerMap, eventName, event) {
    const pairs = event.pairs;
    const pairEventName = "pair" + eventName;

    pairs.map((pair, i) => {
      const { bodyA, bodyB } = pair;
      const gameObjectA = getRootBody(bodyA).gameObject;
      const gameObjectB = getRootBody(bodyB).gameObject;

      pairs[i].gameObjectA = gameObjectA;
      pairs[i].gameObjectB = gameObjectB;

      if (this.events.listenerCount(pairEventName) > 0) {
        this.events.emit(pairEventName, { bodyA, bodyB, gameObjectA, gameObjectB, pair });
      }

      if (listenerMap.size) {
        const eventData = { bodyA, gameObjectA, bodyB, gameObjectB, pair };
        this.checkPairAndEmit(listenerMap, bodyA, bodyB, gameObjectB, eventData);
        this.checkPairAndEmit(listenerMap, gameObjectA, bodyB, gameObjectB, eventData);
        this.checkPairAndEmit(listenerMap, bodyB, bodyA, gameObjectA, eventData);
        this.checkPairAndEmit(listenerMap, gameObjectB, bodyA, gameObjectA, eventData);
      }
    });

    this.events.emit(eventName, event);
  }

  checkPairAndEmit(map, objectA, bodyB, gameObjectB, eventData) {
    const callbacks = map.get(objectA);
    if (callbacks) {
      callbacks.forEach(({ target, callback, context }) => {
        if (!target || target === bodyB || target === gameObjectB) {
          callback.call(context, eventData);
        }
      });
    }
  }

  subscribeMatterEvents() {
    const matter = this.scene.matter;
    if (!matter || !matter.world) {
      warn("Plugin requires matter!");
      return;
    }
    this.scene.matter.world.on("collisionstart", this.onCollisionStart);
    this.scene.matter.world.on("collisionactive", this.onCollisionActive);
    this.scene.matter.world.on("collisionend", this.onCollisionEnd);
  }

  unsubscribeMatterEvents() {
    // Don't unsub if matter next existing or if the game is destroyed (since the matter world will
    // be already gone)
    const matter = this.scene.matter;
    if (!matter || !matter.world) return;
    matter.world.off("collisionstart", this.onCollisionStart);
    matter.world.off("collisionactive", this.onCollisionActive);
    matter.world.off("collisionend", this.onCollisionEnd);
  }

  shutdown() {
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
  }

  /** Phaser.Scene lifecycle event */
  destroy() {
    this.systems.events.off("start", this.start, this);
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
    this.scene = undefined;
    this.systems = undefined;
  }
}
