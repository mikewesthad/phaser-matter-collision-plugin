import { Physics, Plugins, Scene, Events, Scenes } from "phaser";
import { getRootBody, isPhysicsObject, warnInvalidObject } from "./utils";
import logger from "./logger";

// prettier-ignore
import M = Physics.Matter.Matter;
const Body = M.Body;

const { START, DESTROY, SHUTDOWN } = Scenes.Events;

// Possible todos:
// - add oncollide({event: "..."}) style methods
// - add addOnCollideStartOnce style methods

type ListenerMap = Map<object, any[]>;
type PhysicsBody = any;
type CollideCallback = () => void;
type CollideContext = any;

// * @param {object} options
// * @param {PhysicsObject|ObjectWithBody} options.objectA - The first object to watch for in
// * colliding pairs.
// * @param {PhysicsObject|ObjectWithBody} [options.objectB] - Optional, the second object to watch
// * for in colliding pairs. If not defined, all collisions with objectA will trigger the callback
// * @param {function} options.callback - The function to be invoked on collision
// * @param {any} [options.context] - The context to apply when invoking the callback.
// * @returns {function} A function that can be invoked to unsubscribe the listener that was just
// * added.
type CollideInfo = {
  objectA: PhysicsBody;
  objectB?: PhysicsBody;
  callback: CollideCallback;
  context?: CollideContext;
};

/**
 * @export
 * @class MatterCollisionPlugin
 */
export default class MatterCollisionPlugin extends Plugins.ScenePlugin {
  /**
   * @emits {collisionstart}
   * @emits {collisionactive}
   * @emits {collisionend}
   * @emits {paircollisionstart}
   * @emits {paircollisionactive}
   * @emits {paircollisionend}
   */
  public events = new Events.EventEmitter();

  // Maps from objectA => {target?, callback, context?}
  private collisionStartListeners: ListenerMap = new Map();
  private collisionEndListeners: ListenerMap = new Map();
  private collisionActiveListeners: ListenerMap = new Map();

  /**
   * @fires collisionstart
   * @fires paircollisionstart
   */
  private onCollisionStart: (this: MatterCollisionPlugin, map: ListenerMap, event: string) => void;

  /**
   * @fires collisionend
   * @fires paircollisionend
   */
  private onCollisionEnd: (this: MatterCollisionPlugin, map: ListenerMap, event: string) => void;

  /**
   * @fires collisionactive
   * @fires paircollisionactive
   */
  private onCollisionActive: (this: MatterCollisionPlugin, map: ListenerMap, event: string) => void;

  /**
   * Creates an instance of MatterCollisionPlugin.
   */
  constructor(protected scene: Scene, protected pluginManager: Plugins.PluginManager) {
    super(scene, pluginManager);

    this.scene = scene;

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

    this.scene.events.once(START, this.start, this);
    this.scene.events.once(DESTROY, this.destroy, this);
  }

  /**
   * Add a listener for collidestart events between objectA and objectB. The collidestart event is
   * fired by Matter when two bodies start colliding within a tick of the engine. If objectB is
   * omitted, any collisions with objectA will be passed along to the listener. See
   * {@link paircollisionstart} for information on callback parameters.
   */
  public addOnCollideStart({ objectA, objectB, callback, context }: CollideInfo) {
    this.addOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
    return this.removeOnCollideStart.bind(this, { objectA, objectB, callback, context });
  }

  /** This method mirrors {@link MatterCollisionPlugin#addOnCollideStart} */
  public addOnCollideEnd({ objectA, objectB, callback, context }: CollideInfo) {
    this.addOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
    return this.removeOnCollideEnd.bind(this, { objectA, objectB, callback, context });
  }

  /** This method mirrors {@link MatterCollisionPlugin#addOnCollideStart} */
  public addOnCollideActive({ objectA, objectB, callback, context }: CollideInfo) {
    this.addOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
    return this.removeOnCollideActive.bind(this, { objectA, objectB, callback, context });
  }

  /**
   * Remove any listeners that were added with addOnCollideStart. If objectB, callback or context
   * parameters are omitted, any listener matching the remaining parameters will be removed. E.g. if
   * you only specify objectA and objectB, all listeners with objectA & objectB will be removed
   * regardless of the callback or context.
   */
  public removeOnCollideStart({ objectA, objectB, callback, context }: CollideInfo) {
    this.removeOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
  }

  /** This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart} */
  public removeOnCollideEnd({ objectA, objectB, callback, context }: CollideInfo) {
    this.removeOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
  }

  /** This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart} */
  public removeOnCollideActive({ objectA, objectB, callback, context }: CollideInfo) {
    this.removeOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
  }

  /** Remove any listeners that were added with addOnCollideStart. */
  public removeAllCollideStartListeners() {
    this.collisionStartListeners.clear();
  }

  /** Remove any listeners that were added with addOnCollideActive. */
  public removeAllCollideActiveListeners() {
    this.collisionActiveListeners.clear();
  }

  /** Remove any listeners that were added with addOnCollideEnd. */
  public removeAllCollideEndListeners() {
    this.collisionEndListeners.clear();
  }

  /**
   * Remove any listeners that were added with addOnCollideStart, addOnCollideActive or
   * addOnCollideEnd.
   */
  public removeAllCollideListeners() {
    this.removeAllCollideStartListeners();
    this.removeAllCollideActiveListeners();
    this.removeAllCollideEndListeners();
  }

  private addOnCollide(
    map: ListenerMap,
    objectA: PhysicsBody,
    objectB: PhysicsBody,
    callback: CollideCallback,
    context: CollideContext
  ) {
    if (!callback || typeof callback !== "function") {
      logger.warn(`No valid callback specified. Received: ${callback}`);
      return;
    }
    const objectsA = Array.isArray(objectA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectB) ? objectB : [objectB];
    objectsA.forEach((a) => {
      objectsB.forEach((b) => {
        this.addOnCollideObjectVsObject(map, a, b, callback, context);
      });
    });
  }

  private removeOnCollide(
    map: ListenerMap,
    objectA: PhysicsBody,
    objectB: PhysicsBody,
    callback: CollideCallback,
    context: CollideContext
  ) {
    const objectsA = Array.isArray(objectA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectB) ? objectB : [objectB];
    objectsA.forEach((a) => {
      if (!objectB) {
        map.delete(a);
      } else {
        const callbacks = map.get(a) || [];
        const remainingCallbacks = callbacks.filter(
          (cb) =>
            !(
              objectsB.includes(cb.target) &&
              (!callback || cb.callback === callback) &&
              (!context || cb.context === context)
            )
        );
        if (remainingCallbacks.length > 0) map.set(a, remainingCallbacks);
        else map.delete(a);
      }
    });
  }

  private addOnCollideObjectVsObject(
    map: ListenerMap,
    objectA: PhysicsBody,
    objectB: PhysicsBody,
    callback: CollideCallback,
    context: CollideContext
  ) {
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
   * */
  private onCollisionEvent(listenerMap: ListenerMap, eventName: string, event: any) {
    const pairs = event.pairs as any[];
    const pairEventName = "pair" + eventName;
    const eventData = {} as any;
    const eventDataReversed = { isReversed: true } as any;

    pairs.map((pair, i) => {
      const { bodyA, bodyB } = pair;

      let gameObjectA = getRootBody(bodyA).gameObject;
      let gameObjectB = getRootBody(bodyB).gameObject;

      // Special case for tiles, where it's more useful to have a reference to the Tile object not
      // the TileBody. This is hot code, so use a property check instead of instanceof.
      if (gameObjectA && (gameObjectA as any).tile) gameObjectA = (gameObjectA as any).tile;
      if (gameObjectB && (gameObjectB as any).tile) gameObjectB = (gameObjectB as any).tile;

      pairs[i].gameObjectA = gameObjectA;
      pairs[i].gameObjectB = gameObjectB;

      eventData.bodyA = bodyA;
      eventData.bodyB = bodyB;
      eventData.gameObjectA = gameObjectA;
      eventData.gameObjectB = gameObjectB;
      eventData.pair = pair;

      this.events.emit(pairEventName, eventData);

      if (listenerMap.size) {
        eventDataReversed.bodyB = bodyA;
        eventDataReversed.bodyA = bodyB;
        eventDataReversed.gameObjectB = gameObjectA;
        eventDataReversed.gameObjectA = gameObjectB;
        eventDataReversed.pair = pair;

        this.checkPairAndEmit(listenerMap, bodyA, bodyB, gameObjectB, eventData);
        this.checkPairAndEmit(listenerMap, bodyB, bodyA, gameObjectA, eventDataReversed);

        if (gameObjectA) {
          this.checkPairAndEmit(listenerMap, gameObjectA, bodyB, gameObjectB, eventData);
        }
        if (gameObjectB) {
          this.checkPairAndEmit(listenerMap, gameObjectB, bodyA, gameObjectA, eventDataReversed);
        }
      }
    });

    this.events.emit(eventName, event);
  }

  private checkPairAndEmit(
    map: ListenerMap,
    objectA: PhysicsBody,
    bodyB: Body,
    gameObjectB: PhysicsBody,
    eventData: any
  ) {
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
    // If restarting, unsubscribe before resubscribing to ensure only one listener is added
    this.scene.events.off(SHUTDOWN, this.shutdown, this);
    this.scene.events.on(SHUTDOWN, this.shutdown, this);
    this.subscribeMatterEvents();
  }

  shutdown() {
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
    // Resubscribe to start so that the plugin is started again after Matter
    this.scene.events.once(START, this.start, this);
  }

  destroy() {
    this.scene.events.off(DESTROY, this.destroy, this);
    this.scene.events.off(START, this.start, this);
    this.scene.events.off(SHUTDOWN, this.shutdown, this);
    this.removeAllCollideListeners();
    this.unsubscribeMatterEvents();
  }
}

/**
 * A valid physics-enabled game object, or just an object that has "body" property
 * @typedef {object} ObjectWithBody
 * @property {Matter.Body} body - A native Matter body
 */

/**
 * A valid physics-enabled game object, or a native Matter body
 * @typedef {(Matter.Body|Phaser.Physics.Matter.Sprite|Phaser.Physics.Matter.Image|Phaser.Physics.Matter.MatterGameObject|Phaser.Tilemaps.Tile)} PhysicsObject
 */

/**
 * This event proxies the Matter collisionstart event, which is fired when any bodies have started
 * colliding.
 *
 * @typedef {event} collisionstart
 * @property {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event proxies the Matter collisionend event, which is fired when any bodies have stopped
 * colliding.
 *
 * @typedef {event} collisionend
 * @property {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event proxies the Matter collisionactive event, which is fired when any bodies are still
 * colliding (after the tick of the engine where they started colliding).
 *
 * @typedef {event} collisionactive
 * @property {object} event - The Matter event data, with the "pairs" property modified so that each
 * pair now has a gameObjectA and a gameObjectB property. Those properties will contain the game
 * object associated with the native bodyA or bodyB (or undefined if no game object exists).
 */

/**
 * This event is fired for each pair of bodies that collide during Matter's collisionstart.
 *
 * @typedef {event} paircollisionstart
 * @property {object} event
 * @property {object} event.bodyA - The native Matter bodyA from the pair
 * @property {object} event.bodyB - The native Matter bodyB from the pair
 * @property {object|undefined} event.gameObjectA - The game object associated with bodyA, if it exists
 * @property {object|undefined} event.gameObjectB - The game object associated with bodyB, if it exists
 * @property {object} event.pair - The original pair data from Matter
 */

/**
 * This event is fired for each pair of bodies that collide during Matter's collisionend.
 *
 * @typedef {event} paircollisionend
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
 * @typedef {event} paircollisionactive
 * @param {object} event
 * @param {object} event.bodyA - The native Matter bodyA from the pair
 * @param {object} event.bodyB - The native Matter bodyB from the pair
 * @param {object|undefined} event.gameObjectA - The game object associated with bodyA, if it exists
 * @param {object|undefined} event.gameObjectB - The game object associated with bodyB, if it exists
 * @param {object} event.pair - The original pair data from Matter
 */
