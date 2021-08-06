import { Physics, Types } from "phaser";
import { CollidingObject } from "./valid-collision-object";

type CO = CollidingObject;

/** Helper to construct variants of the types where specific properties are optional. */
export type SelectivePartial<Type, OptionalKeys extends keyof Type> = Omit<Type, OptionalKeys> &
  Partial<Type>;

/** Alias to Matter type. */
export type MatterCollisionData = Types.Physics.Matter.MatterCollisionData;

/** Extended matter collision event data with game objects. */
export interface ExtendedMatterCollisionData extends MatterCollisionData {
  gameObjectA?: CO;
  gameObjectB?: CO;
}

export type CollisionEvent =
  | Physics.Matter.Events.CollisionStartEvent
  | Physics.Matter.Events.CollisionActiveEvent
  | Physics.Matter.Events.CollisionEndEvent;

export interface EventData<T extends CO, K extends CO> {
  bodyA: MatterJS.Body;
  bodyB: MatterJS.Body;
  gameObjectA?: T;
  gameObjectB?: K;
  isReversed: boolean;
  pair: ExtendedMatterCollisionData;
}

/**
 * This generic type represents a start/active/end callback. It is used internally, but it can also
 * be used when you need to type a "callback" property manually, for example:
 * ```ts
 * const sprite = this.matter.add.sprite(350, 100, "emoji", "1f62c");
 * const image = this.matter.add.image(350, 200, "emoji", "1f62c");
 * const callback: CollideCallback<typeof sprite, typeof image> = (e) => {
 *   console.log("Hit!");
 * };
 * this.matterCollision.addOnCollideStart({
 *   objectA: sprite,
 *   objectB: image,
 *   callback: callback,
 * });
 * ```
 */
export interface CollideCallback<T extends CO = CO, K extends CO = CO> {
  (event: EventData<T, K>): void;
}

/** Config for specified A object(s) vs anything else collision listeners. */
export interface CollideAConfig<T extends CO> {
  objectA: T | T[];
  callback: CollideCallback<T, CO>;
  context?: CollideContext;
}

/** Config for specified A object(s) vs specified B object(s). */
export interface CollideABConfig<T extends CO, K extends CO> {
  objectA: T | T[];
  objectB: K | K[];
  callback: CollideCallback<T, K>;
  context?: CollideContext;
}

export interface InternalCollideConfig {
  objectA: CO | CO[];
  objectB?: CO | CO[];
  callback: CollideCallback<CO, CO>;
  context?: CollideContext;
}

export type CollideContext = any;

/** Variant of CollideAConfig to be used when removing listeners (where callback is optional). */
export type RemoveCollideConfigA<T extends CO> = SelectivePartial<CollideAConfig<T>, "callback">;

/** Variant of CollideABConfig to be used when removing listeners (where callback is optional). */
export type RemoveCollideConfigAB<T extends CO, K extends CO> = SelectivePartial<
  CollideABConfig<T, K>,
  "callback"
>;

export type InternalCollideRemoveConfig = SelectivePartial<InternalCollideConfig, "callback">;
export interface ListenerInfo<T extends CO, K extends CO> {
  target?: CO;
  callback: CollideCallback<T, K>;
  context?: CollideContext;
}

export type ListenerMap = Map<CO, ListenerInfo<any, any>[]>;

export interface Unsubscribe {
  (): void;
}
