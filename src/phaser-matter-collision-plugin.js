/**
 * A valid physics-enabled game object or a native Matter body
 * @typedef {object} ObjectWithBody
 * @property {Matter.Body} body - A native Matter body
 */

/**
 * A valid physics-enabled game object or a native Matter body
 * @typedef {(Phaser.Physics.Matter.Sprite|Phaser.Physics.Matter.Image|Phaser.Physics.Matter.MatterGameObject|Phaser.Tilemaps.Tile)} PhysicsObject
 */

import Phaser from "phaser";
import { getRootBody, isMatterBody } from "./matter-utils";
import logger from "./logger";

const Tile = Phaser.Tilemaps.Tile;
const isPhysicsObject = obj => isMatterBody(obj) || obj.body || obj instanceof Tile;

const warnInvalidObject = obj =>
  logger.warn(
    `Expected a matter body or a GameObject with a body property, but instead, recieved: ${obj}`
  );

/**
 * @export
 * @class MatterCollisionPlugin
 * @extends {Phaser.Plugins.ScenePlugin}
 */
export default class MatterCollisionPlugin extends Phaser.Plugins.ScenePlugin {
  /**
   * Creates an instance of MatterCollisionPlugin.
   * @param {Phaser.Scene} scene
   * @param {Phaser.Plugins.PluginManager} pluginManager
   * @memberof MatterCollisionPlugin
   */
  constructor(scene, pluginManager) {
    super(scene, pluginManager);

    this.scene = scene;
    this.events = new Phaser.Events.EventEmitter();

    // Map from physics object => {target?, callback, context?}
    this.collisionStartListeners = new Map();
    this.collisionEndListeners = new Map();
    this.collisionActiveListeners = new Map();

    /**
     * @fires CollisionStart
     * @fires PairCollisionStart
     */
    this.onCollisionStart = this.onCollisionEvent.bind(
      this,
      this.collisionStartListeners,
      "collisionstart"
    );

    /**
     * @fires CollisionEnd
     * @fires PairCollisionEnd
     */
    this.onCollisionEnd = this.onCollisionEvent.bind(
      this,
      this.collisionEndListeners,
      "collisionend"
    );

    /**
     * @fires CollisionActive
     * @fires PairCollisionActive
     */
    this.onCollisionActive = this.onCollisionEvent.bind(
      this,
      this.collisionActiveListeners,
      "collisionactive"
    );

    this.scene.events.once("start", this.start, this);
  }

  /**
   * Add a listener for collidestart events between objectA and objectB. The collidestart event is
   * fired by Matter when two bodies start colliding within a tick of the engine. If objectB is
   * omitted, any collisions with objectA will be passed along to the listener. @see
   * {@link PairCollisionStart} for information on callback parameters.
   *
   * @param {object} options
   * @param {PhysicsObject|ObjectWithBody} options.objectA - The first object to watch for in
   * colliding pairs.
   * @param {PhysicsObject|ObjectWithBody} [options.objectB] - Optional, the second object to watch
   * for in colliding pairs. If not defined, all collisions with objectA will trigger the callback
   * @param {function} options.callback - The function to be invoked on collision
   * @param {any} [options.context] - The context to apply when invoking the callback.
   * @returns {function} A function that can be invoked to unsubscribe the listener that was just
   * added.
   * @memberof MatterCollisionPlugin
   */
  addOnCollideStart({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
    return this.removeOnCollideStart.bind(this, { objectA, objectB, callback, context });
  }

  /**
   * @see MatterCollisionPlugin#addOnCollideStart
   * @memberof MatterCollisionPlugin
   */
  addOnCollideEnd({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
    return this.removeOnCollideEnd.bind(this, { objectA, objectB, callback, context });
  }

  /**
   * @see MatterCollisionPlugin#addOnCollideStart
   * @memberof MatterCollisionPlugin
   */
  addOnCollideActive({ objectA, objectB, callback, context } = {}) {
    this.addOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
    return this.removeOnCollideActive.bind(this, { objectA, objectB, callback, context });
  }

  /**
   * Remove any listeners that were added with addOnCollideStart that match the given options object
   * parameter exactly. I.e. this will only remove the listener if the listener was added via
   * addOnCollideStart with the same parameters.
   *
   * @param {object} options
   * @param {PhysicsObject|ObjectWithBody} options.objectA - The first object to watch for in
   * colliding pairs.
   * @param {PhysicsObject|ObjectWithBody} options.objectB - the second object to watch for in
   * colliding pairs. If not defined, all collisions with objectA will trigger the callback
   * @param {function} options.callback - The function to be invoked on collision
   * @param {[any]} options.context - The context to apply when invoking the callback.
   * @returns {function} A function that can be invoked to unsubscribe the listener that was just
   * added.
   * @memberof MatterCollisionPlugin
   */
  removeOnCollideStart({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
  }

  /**
   * @see MatterCollisionPlugin#removeOnCollideStart
   * @memberof MatterCollisionPlugin
   */
  removeOnCollideEnd({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
  }

  /**
   * @see MatterCollisionPlugin#removeOnCollideStart
   * @memberof MatterCollisionPlugin
   */
  removeOnCollideActive({ objectA, objectB, callback, context } = {}) {
    this.removeOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
  }

  /**
   * Remove any listeners that were added with addOnCollideStart.
   * @memberof MatterCollisionPlugin
   */
  removeAllCollideStartListeners() {
    this.collisionStartListeners.clear();
  }
  /**
   * Remove any listeners that were added with addOnCollideActive.
   * @memberof MatterCollisionPlugin
   */
  removeAllCollideActiveListeners() {
    this.collisionActiveListeners.clear();
  }
  /**
   * Remove any listeners that were added with addOnCollideEnd.
   * @memberof MatterCollisionPlugin
   */
  removeAllCollideEndListeners() {
    this.collisionEndListeners.clear();
  }
  /**
   * Remove any listeners that were added with addOnCollideStart, addOnCollideActive or
   * addOnCollideEnd.
   * @memberof MatterCollisionPlugin
   */
  removeAllCollideListeners() {
    this.removeAllCollideStartListeners();
    this.removeAllCollideActiveListeners();
    this.removeAllCollideEndListeners();
  }

  /** @private */
  addOnCollide(map, objectA, objectB, callback, context) {
    if (!callback || typeof callback !== "function") {
      warn(`No valid callback specified. Received: ${callback}`);
      return;
    }
    const objectsA = Array.isArray(objectA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectB) ? objectB : [objectB];
    objectsA.forEach(a => {
      objectsB.forEach(b => {
        this.addOnCollideObjectVsObject(map, a, b, callback, context);
      });
    });
  }

  /** @private */
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

  /** @private */
  addOnCollideObjectVsObject(map, objectA, objectB, callback, context) {
    // Can't do anything if the first object is not defined or invalid
    if (!objectA || !isPhysicsObject(objectA)) {
      warnInvalidObject(objectA);
      return;
    }

    // The second object can be undefined or a valid body
    if (objectB && !isPhysicsObject(objectB)) {
      warnInvalidObject(objectA);
      return;
    }

    const callbacks = map.get(objectA) || [];
    callbacks.push({ target: objectB, callback, context });
    map.set(objectA, callbacks);
  }

  /**
   * Reusable handler for collisionstart, collisionend, collisionactive.
   * @private
   * */
  onCollisionEvent(listenerMap, eventName, event) {
    const pairs = event.pairs;
    const pairEventName = "pair" + eventName;

    pairs.map((pair, i) => {
      const { bodyA, bodyB } = pair;

      let gameObjectA = getRootBody(bodyA).gameObject;
      let gameObjectB = getRootBody(bodyB).gameObject;

      // Special case for tiles, where it's more useful to have a reference to the Tile object not
      // the TileBody. This is hot code, so use a property check instead of instanceof.
      if (gameObjectA && gameObjectA.tile) gameObjectA = gameObjectA.tile;
      if (gameObjectB && gameObjectB.tile) gameObjectB = gameObjectB.tile;

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

  /** @private */
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
      logger.warn("Plugin requires matter!");
      return;
    }
    matter.world.on("collisionstart", this.onCollisionStart);
    matter.world.on("collisionactive", this.onCollisionActive);
    matter.world.on("collisionend", this.onCollisionEnd);
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

  start() {
    // console.log("start"); // Verify this only runs once
    this.scene.events.on("shutdown", this.shutdown, this);
    this.scene.events.once("destroy", this.destroy, this);
    this.subscribeMatterEvents();
  }

  shutdown() {
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
  }

  destroy() {
    this.scene.events.off("start", this.start, this);
    this.scene.events.off("shutdown", this.shutdown, this);
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
    this.scene = undefined;
  }
}

/**
 * This event proxies the Matter collisionstart event, which is fired when any bodies have started
 * colliding.
 *
 * @event CollisionStart
 * @param {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event proxies the Matter collisionend event, which is fired when any bodies have stopped
 * colliding.
 *
 * @event CollisionEnd
 * @param {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event proxies the Matter collisionactive event, which is fired when any bodies are still
 * colliding (after the tick of the engine where they started colliding).
 *
 * @event CollisionActive
 * @param {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event is fired for each pair of bodies that collide during Matter's collisionstart.
 *
 * @event PairCollisionStart
 * @param {object} event
 * @param {object} event.bodyA - The native Matter bodyA from the pair
 * @param {object} event.bodyB - The native Matter bodyB from the pair
 * @param {object|undefined} event.gameObjectA - The game object associated with bodyA, if it exists
 * @param {object|undefined} event.gameObjectB - The game object associated with bodyB, if it exists
 * @param {object} event.pair - The original pair data from Matter
 */

/**
 * This event is fired for each pair of bodies that collide during Matter's collisionend.
 *
 * @event PairCollisionEnd
 * @param {object} event
 * @param {object} event.bodyA - The native Matter bodyA from the pair
 * @param {object} event.bodyB - The native Matter bodyB from the pair
 * @param {object|undefined} event.gameObjectA - The game object associated with bodyA, if it exists
 * @param {object|undefined} event.gameObjectB - The game object associated with bodyB, if it exists
 * @param {object} event.pair - The original pair data from Matter
 */

/**
 * This event is fired for each pair of bodies that collide during Matter's collisionactive.
 *
 * @event PairCollisionActive
 * @param {object} event
 * @param {object} event.bodyA - The native Matter bodyA from the pair
 * @param {object} event.bodyB - The native Matter bodyB from the pair
 * @param {object|undefined} event.gameObjectA - The game object associated with bodyA, if it exists
 * @param {object|undefined} event.gameObjectB - The game object associated with bodyB, if it exists
 * @param {object} event.pair - The original pair data from Matter
 */
