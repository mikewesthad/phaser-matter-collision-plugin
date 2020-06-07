import { Physics, Types } from "phaser";
import { CollidingObject } from "./valid-collision-object";

export type MatterCollisionData = Types.Physics.Matter.MatterCollisionData;
export type ExtendedMatterCollisionData = MatterCollisionData & {
  gameObjectA?: CollidingObject;
  gameObjectB?: CollidingObject;
};

export type CollisionEvent =
  | Physics.Matter.Events.CollisionStartEvent
  | Physics.Matter.Events.CollisionActiveEvent
  | Physics.Matter.Events.CollisionEndEvent;

export type EventData<T extends CollidingObject, K extends CollidingObject> = {
  bodyA: MatterJS.Body;
  bodyB: MatterJS.Body;
  gameObjectA?: T;
  gameObjectB?: K;
  isReversed: boolean;
  pair: ExtendedMatterCollisionData;
};

export type CollideCallback<T extends CollidingObject, K extends CollidingObject> = (
  event: EventData<T, K>
) => void;

export type CollideAConfig<T extends CollidingObject> = {
  objectA: T | T[];
  callback: CollideCallback<T, CollidingObject>;
  context?: CollideContext;
};

export type CollideABConfig<T extends CollidingObject, K extends CollidingObject> = {
  objectA: T | T[];
  objectB: K | K[];
  callback: CollideCallback<T, K>;
  context?: CollideContext;
};

export type InternalCollideConfig = {
  objectA: CollidingObject | CollidingObject[];
  objectB?: CollidingObject | CollidingObject[];
  callback: CollideCallback<CollidingObject, CollidingObject>;
  context?: CollideContext;
};

export type CollideContext = any;

export type ListenerInfo<T extends CollidingObject, K extends CollidingObject> = {
  target?: CollidingObject;
  callback: CollideCallback<T, K>;
  context?: CollideContext;
};

export type ListenerMap = Map<CollidingObject, ListenerInfo<any, any>[]>;

export type Unsubscribe = () => void;
