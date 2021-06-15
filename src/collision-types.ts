import { Physics, Types } from "phaser";
import { CollidingObject } from "./valid-collision-object";

/** Alias to Matter type. */
export type MatterCollisionData = Types.Physics.Matter.MatterCollisionData;

/** Extended matter collision event data with game objects. */
export interface ExtendedMatterCollisionData extends MatterCollisionData {
  gameObjectA?: CollidingObject;
  gameObjectB?: CollidingObject;
}

export type CollisionEvent =
  | Physics.Matter.Events.CollisionStartEvent
  | Physics.Matter.Events.CollisionActiveEvent
  | Physics.Matter.Events.CollisionEndEvent;

export interface EventData<T extends CollidingObject, K extends CollidingObject> {
  bodyA: MatterJS.Body;
  bodyB: MatterJS.Body;
  gameObjectA?: T;
  gameObjectB?: K;
  isReversed: boolean;
  pair: ExtendedMatterCollisionData;
}

export interface CollideCallback<T extends CollidingObject, K extends CollidingObject> {
  (event: EventData<T, K>): void;
}

/** Config for specified A object(s) vs anything else collision listeners. */
export interface CollideAConfig<T extends CollidingObject> {
  objectA: T | T[];
  callback: CollideCallback<T, CollidingObject>;
  context?: CollideContext;
}

/** Config for specified A object(s) vs specified B object(s). */
export interface CollideABConfig<T extends CollidingObject, K extends CollidingObject> {
  objectA: T | T[];
  objectB: K | K[];
  callback: CollideCallback<T, K>;
  context?: CollideContext;
}

export interface InternalCollideConfig {
  objectA: CollidingObject | CollidingObject[];
  objectB?: CollidingObject | CollidingObject[];
  callback: CollideCallback<CollidingObject, CollidingObject>;
  context?: CollideContext;
}

export type CollideContext = any;

export interface ListenerInfo<T extends CollidingObject, K extends CollidingObject> {
  target?: CollidingObject;
  callback: CollideCallback<T, K>;
  context?: CollideContext;
}

export type ListenerMap = Map<CollidingObject, ListenerInfo<any, any>[]>;

export interface Unsubscribe {
  (): void;
}
