import { Physics, Plugins, Scene, Events, Scenes, Tilemaps } from "phaser";
import { getRootBody, warnInvalidObject } from "./utils";
import logger from "./logger";
import { CollidingObject as CO, isCollidingObject } from "./valid-collision-object";
import {
  ListenerMap,
  CollideABConfig as ABConfig,
  Unsubscribe,
  CollideCallback,
  CollideContext,
  ExtendedMatterCollisionData,
  EventData,
  CollideAConfig as AConfig,
  InternalCollideConfig,
  RemoveCollideConfigA as RemoveAConfig,
  RemoveCollideConfigAB as RemoveABConfig,
  InternalCollideRemoveConfig,
} from "./collision-types";

import Matter = Physics.Matter;
import MatterEvents = Matter.Events;
const { START, DESTROY, SHUTDOWN } = Scenes.Events;
const { COLLISION_START, COLLISION_ACTIVE, COLLISION_END } = Matter.Events;

type MatterCollisionEvent =
  | MatterEvents.CollisionActiveEvent
  | MatterEvents.CollisionEndEvent
  | MatterEvents.CollisionActiveEvent;

/**
 * @export
 */
export default class MatterCollisionPlugin extends Plugins.ScenePlugin {
  public events = new Events.EventEmitter();

  private collisionStartListeners: ListenerMap = new Map();
  private collisionEndListeners: ListenerMap = new Map();
  private collisionActiveListeners: ListenerMap = new Map();

  constructor(
    protected scene: Scene,
    protected pluginManager: Plugins.PluginManager,
    pluginKey: string
  ) {
    super(scene, pluginManager, pluginKey);
    this.scene = scene;
    this.scene.events.once(START, this.start, this);
    this.scene.events.once(DESTROY, this.destroy, this);
  }

  /**
   * Add a listener for collidestart events between objectA and objectB. The collidestart event is
   * fired by Matter when two bodies start colliding within a tick of the engine. If objectB is
   * omitted, any collisions with objectA will be passed along to the listener. See
   * {@link paircollisionstart} for information on callback parameters.
   */
  public addOnCollideStart<T extends CO, K extends CO>(config: ABConfig<T, K>): Unsubscribe;
  public addOnCollideStart<T extends CO>(config: AConfig<T>): Unsubscribe;
  public addOnCollideStart(config: InternalCollideConfig): Unsubscribe {
    // Note: the order of overloads is important! TS matches the first one it can, so this needs
    // the most specific/constrained signature first.
    this.addOnCollide(this.collisionStartListeners, config);
    return () => this.removeOnCollide(this.collisionStartListeners, config);
  }

  /** This method mirrors {@link MatterCollisionPlugin#addOnCollideStart} */
  public addOnCollideEnd<T extends CO, K extends CO>(config: ABConfig<T, K>): Unsubscribe;
  public addOnCollideEnd<T extends CO>(config: AConfig<T>): Unsubscribe;
  public addOnCollideEnd(config: InternalCollideConfig): Unsubscribe {
    this.addOnCollide(this.collisionEndListeners, config);
    return () => this.removeOnCollide(this.collisionEndListeners, config);
  }

  /** This method mirrors {@link MatterCollisionPlugin#addOnCollideStart} */
  public addOnCollideActive<T extends CO, K extends CO>(config: ABConfig<T, K>): Unsubscribe;
  public addOnCollideActive<T extends CO>(config: AConfig<T>): Unsubscribe;
  public addOnCollideActive(config: InternalCollideConfig): Unsubscribe {
    this.addOnCollide(this.collisionActiveListeners, config);
    return () => this.removeOnCollide(this.collisionActiveListeners, config);
  }

  /**
   * Remove any listeners that were added with addOnCollideStart. If objectB, callback or context
   * parameters are omitted, any listener matching the remaining parameters will be removed. E.g. if
   * you only specify objectA and objectB, all listeners with objectA & objectB will be removed
   * regardless of the callback or context.
   */
  public removeOnCollideStart<T extends CO, K extends CO>(config: RemoveABConfig<T, K>): void;
  public removeOnCollideStart<T extends CO>(config: RemoveAConfig<T>): void;
  public removeOnCollideStart(config: InternalCollideRemoveConfig) {
    this.removeOnCollide(this.collisionStartListeners, config);
  }

  /** This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart} */
  public removeOnCollideEnd<T extends CO, K extends CO>(config: RemoveABConfig<T, K>): void;
  public removeOnCollideEnd<T extends CO>(config: RemoveAConfig<T>): void;
  public removeOnCollideEnd(config: InternalCollideRemoveConfig) {
    this.removeOnCollide(this.collisionEndListeners, config);
  }

  /** This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart} */
  public removeOnCollideActive<T extends CO, K extends CO>(config: RemoveABConfig<T, K>): void;
  public removeOnCollideActive<T extends CO>(config: RemoveAConfig<T>): void;
  public removeOnCollideActive(config: InternalCollideRemoveConfig) {
    this.removeOnCollide(this.collisionActiveListeners, config);
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

  private addOnCollide(map: ListenerMap, config: InternalCollideConfig): void {
    const { context, callback, objectA, objectB } = config;
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

  private removeOnCollide(map: ListenerMap, config: InternalCollideRemoveConfig) {
    const { context, callback, objectA, objectB } = config;
    const objectsA = Array.isArray(objectA) ? objectA : [objectA];
    const objectsB = Array.isArray(objectB) ? objectB : [objectB];
    objectsA.forEach((a) => {
      const callbacks = map.get(a) || [];
      const remainingCallbacks = callbacks.filter((cb) => {
        // If anything doesn't match a provided config value (i.e. anything other than undefined),
        // we can bail and keep listener.
        if (context !== undefined && cb.context !== context) return true;
        if (callback !== undefined && cb.callback !== callback) return true;
        if (objectB !== undefined && !objectsB.includes(cb.target)) return true;
        return false;
      });
      if (remainingCallbacks.length > 0) map.set(a, remainingCallbacks);
      else map.delete(a);
    });
  }

  private addOnCollideObjectVsObject(
    map: ListenerMap,
    objectA: CO,
    objectB: CO | undefined,
    callback: CollideCallback<CO, CO>,
    context: CollideContext | undefined
  ) {
    // Can't do anything if the first object is not defined or invalid.
    if (!objectA || !isCollidingObject(objectA)) {
      warnInvalidObject(objectA);
      return;
    }

    // The second object can be undefined or a valid body.
    if (objectB && !isCollidingObject(objectB)) {
      warnInvalidObject(objectA);
      return;
    }

    const callbacks = map.get(objectA) || [];
    callbacks.push({ target: objectB, callback, context });
    map.set(objectA, callbacks);
  }

  private onCollisionStart(event: MatterEvents.CollisionActiveEvent) {
    this.onCollisionEvent(this.collisionStartListeners, COLLISION_START, event);
  }

  private onCollisionEnd(event: MatterEvents.CollisionEndEvent) {
    this.onCollisionEvent(this.collisionEndListeners, COLLISION_END, event);
  }

  private onCollisionActive(event: MatterEvents.CollisionActiveEvent) {
    this.onCollisionEvent(this.collisionActiveListeners, COLLISION_ACTIVE, event);
  }

  /**
   * Reusable handler for collisionstart, collisionend, collisionactive.
   * */
  private onCollisionEvent(
    listenerMap: ListenerMap,
    eventName: string,
    event: MatterCollisionEvent
  ) {
    const pairs = event.pairs as ExtendedMatterCollisionData[];
    const pairEventName = "pair" + eventName;
    const eventData: Partial<EventData<CO, CO>> = { isReversed: false };
    const eventDataReversed: Partial<EventData<CO, CO>> = { isReversed: true };

    pairs.map((pair, i) => {
      const { bodyA, bodyB } = pair;
      const rootBodyA = getRootBody(bodyA);
      const rootBodyB = getRootBody(bodyB);
      let gameObjectA: CO | undefined = rootBodyA.gameObject ?? undefined;
      let gameObjectB: CO | undefined = rootBodyB.gameObject ?? undefined;

      // Special case for tiles, where it's more useful to have a reference to the Tile object not
      // the TileBody. This is hot code, so use a property check instead of instanceof.
      if (gameObjectA && gameObjectA instanceof Matter.TileBody) {
        gameObjectA = gameObjectA.tile;
      }
      if (gameObjectB && gameObjectB instanceof Matter.TileBody) {
        gameObjectB = gameObjectB.tile;
      }

      pairs[i].gameObjectA = gameObjectA ?? undefined;
      pairs[i].gameObjectB = gameObjectB ?? undefined;

      eventData.bodyA = bodyA;
      eventData.bodyB = bodyB;
      eventData.gameObjectA = gameObjectA ?? undefined;
      eventData.gameObjectB = gameObjectB ?? undefined;
      eventData.pair = pair;

      this.events.emit(pairEventName, eventData);

      if (listenerMap.size > 0) {
        eventDataReversed.bodyB = bodyA;
        eventDataReversed.bodyA = bodyB;
        eventDataReversed.gameObjectB = gameObjectA;
        eventDataReversed.gameObjectA = gameObjectB;
        eventDataReversed.pair = pair;

        const data = eventData as EventData<CO, CO>;
        const dataReversed = eventDataReversed as EventData<CO, CO>;

        this.checkPairAndEmit(listenerMap, bodyA, bodyB, gameObjectB, data);
        this.checkPairAndEmit(listenerMap, bodyB, bodyA, gameObjectA, dataReversed);

        if (gameObjectA) {
          this.checkPairAndEmit(listenerMap, gameObjectA, bodyB, gameObjectB, data);
        }

        if (gameObjectB) {
          this.checkPairAndEmit(listenerMap, gameObjectB, bodyA, gameObjectA, dataReversed);
        }
      }
    });

    this.events.emit(eventName, event);
  }

  private checkPairAndEmit(
    map: ListenerMap,
    objectA: CO,
    bodyB: MatterJS.Body,
    gameObjectB: CO | undefined,
    eventData: EventData<CO, CO>
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
    matter.world.on(COLLISION_START, this.onCollisionStart, this);
    matter.world.on(COLLISION_ACTIVE, this.onCollisionActive, this);
    matter.world.on(COLLISION_END, this.onCollisionEnd, this);
  }

  unsubscribeMatterEvents() {
    // Don't unsub if matter next existing or if the game is destroyed (since the matter world will
    // be already gone)
    const matter = this.scene.matter;
    if (!matter || !matter.world) return;
    matter.world.off(COLLISION_START, this.onCollisionStart, this);
    matter.world.off(COLLISION_ACTIVE, this.onCollisionActive, this);
    matter.world.off(COLLISION_END, this.onCollisionEnd, this);
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
