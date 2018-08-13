import EventEmitter from "eventemitter3";

export default class Scene {
  constructor({ addMatter = true } = {}) {
    this.events = new EventEmitter();
    if (addMatter)
      this.matter = {
        world: new EventEmitter()
      };
  }
}
