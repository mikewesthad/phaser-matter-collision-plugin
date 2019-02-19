(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("phaser"));
	else if(typeof define === 'function' && define.amd)
		define(["phaser"], factory);
	else if(typeof exports === 'object')
		exports["PhaserMatterCollisionPlugin"] = factory(require("phaser"));
	else
		root["PhaserMatterCollisionPlugin"] = factory(root["Phaser"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external {"root":"Phaser","commonjs":"phaser","commonjs2":"phaser","amd":"phaser"}
var external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_ = __webpack_require__(0);
var external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default = /*#__PURE__*/__webpack_require__.n(external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_);

// CONCATENATED MODULE: ./logger.js
/* harmony default export */ var logger = ({
  log: console.log,
  warn: console.warn,
  error: console.error
});
// CONCATENATED MODULE: ./utils.js



/**
 * Get the root body of a compound Matter body
 * @private
 */
function getRootBody(body) {
  while (body.parent !== body) {
    body = body.parent;
  }return body;
}

/**
 * Duck type to check if the given object is a Matter body (because there isn't a prototype)
 * @private
 */
function isMatterBody(obj) {
  return obj.hasOwnProperty("collisionFilter") && obj.hasOwnProperty("parts") && obj.hasOwnProperty("slop");
}

/**
 * Check if object is an acceptable physical object for this plugin - a Matter Body, a tile, or an
 * object with a body property
 * @private
 */
function isPhysicsObject(obj) {
  return isMatterBody(obj) || obj.body || obj instanceof external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default.a.Tilemaps.Tile;
}

/** @private */
function warnInvalidObject(obj) {
  logger.warn("Expected a Matter body, Tile or an object with a body property, but instead, recieved: " + obj);
}
// CONCATENATED MODULE: ./phaser-matter-collision-plugin.js
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





// Possible todos:
// - add oncollide({event: "..."}) style methods
// - add addOnCollideStartOnce style methods

/**
 * @export
 * @class MatterCollisionPlugin
 * @extends {Phaser.Plugins.ScenePlugin}
 */

var phaser_matter_collision_plugin_MatterCollisionPlugin = function (_Phaser$Plugins$Scene) {
  _inherits(MatterCollisionPlugin, _Phaser$Plugins$Scene);

  /**
   * Creates an instance of MatterCollisionPlugin.
   * @param {Phaser.Scene} scene
   * @param {Phaser.Plugins.PluginManager} pluginManager
   */
  function MatterCollisionPlugin(scene, pluginManager) {
    _classCallCheck(this, MatterCollisionPlugin);

    var _this = _possibleConstructorReturn(this, (MatterCollisionPlugin.__proto__ || Object.getPrototypeOf(MatterCollisionPlugin)).call(this, scene, pluginManager));

    _this.scene = scene;

    /**
     * @type {Phaser.Events.EventEmitter}
     * @emits {collisionstart}
     * @emits {collisionactive}
     * @emits {collisionend}
     * @emits {paircollisionstart}
     * @emits {paircollisionactive}
     * @emits {paircollisionend}
     */
    _this.events = new external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default.a.Events.EventEmitter();

    // Maps from objectA => {target?, callback, context?}
    /** @private */
    _this.collisionStartListeners = new Map();
    /** @private */
    _this.collisionEndListeners = new Map();
    /** @private */
    _this.collisionActiveListeners = new Map();

    /**
     * @fires collisionstart
     * @fires paircollisionstart
     * @private
     */
    _this.onCollisionStart = _this.onCollisionEvent.bind(_this, _this.collisionStartListeners, "collisionstart");

    /**
     * @fires collisionend
     * @fires paircollisionend
     * @private
     */
    _this.onCollisionEnd = _this.onCollisionEvent.bind(_this, _this.collisionEndListeners, "collisionend");

    /**
     * @fires collisionactive
     * @fires paircollisionactive
     * @private
     */
    _this.onCollisionActive = _this.onCollisionEvent.bind(_this, _this.collisionActiveListeners, "collisionactive");

    _this.scene.events.once("start", _this.start, _this);
    _this.scene.events.once("destroy", _this.destroy, _this);
    return _this;
  }

  /**
   * Add a listener for collidestart events between objectA and objectB. The collidestart event is
   * fired by Matter when two bodies start colliding within a tick of the engine. If objectB is
   * omitted, any collisions with objectA will be passed along to the listener. See
   * {@link paircollisionstart} for information on callback parameters.
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
   */


  _createClass(MatterCollisionPlugin, [{
    key: "addOnCollideStart",
    value: function addOnCollideStart() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref.objectA,
          objectB = _ref.objectB,
          callback = _ref.callback,
          context = _ref.context;

      this.addOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
      return this.removeOnCollideStart.bind(this, { objectA: objectA, objectB: objectB, callback: callback, context: context });
    }

    /**
     * This method mirrors {@link MatterCollisionPlugin#addOnCollideStart}
     * @param {object} options
     */

  }, {
    key: "addOnCollideEnd",
    value: function addOnCollideEnd() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref2.objectA,
          objectB = _ref2.objectB,
          callback = _ref2.callback,
          context = _ref2.context;

      this.addOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
      return this.removeOnCollideEnd.bind(this, { objectA: objectA, objectB: objectB, callback: callback, context: context });
    }

    /**
     * This method mirrors {@link MatterCollisionPlugin#addOnCollideStart}
     * @param {object} options
     */

  }, {
    key: "addOnCollideActive",
    value: function addOnCollideActive() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref3.objectA,
          objectB = _ref3.objectB,
          callback = _ref3.callback,
          context = _ref3.context;

      this.addOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
      return this.removeOnCollideActive.bind(this, { objectA: objectA, objectB: objectB, callback: callback, context: context });
    }

    /**
     * Remove any listeners that were added with addOnCollideStart. If objectB, callback or context
     * parameters are omitted, any listener matching the remaining parameters will be removed. E.g. if
     * you only specify objectA and objectB, all listeners with objectA & objectB will be removed
     * regardless of the callback or context.
     *
     * @param {object} options
     * @param {PhysicsObject|ObjectWithBody} options.objectA - The first object to watch for in
     * colliding pairs.
     * @param {PhysicsObject|ObjectWithBody} [options.objectB] - the second object to watch for in
     * colliding pairs.
     * @param {function} [options.callback] - The function to be invoked on collision
     * @param {any} [options.context] - The context to apply when invoking the callback.
     */

  }, {
    key: "removeOnCollideStart",
    value: function removeOnCollideStart() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref4.objectA,
          objectB = _ref4.objectB,
          callback = _ref4.callback,
          context = _ref4.context;

      this.removeOnCollide(this.collisionStartListeners, objectA, objectB, callback, context);
    }

    /**
     * This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart}
     * @param {object} options
     */

  }, {
    key: "removeOnCollideEnd",
    value: function removeOnCollideEnd() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref5.objectA,
          objectB = _ref5.objectB,
          callback = _ref5.callback,
          context = _ref5.context;

      this.removeOnCollide(this.collisionEndListeners, objectA, objectB, callback, context);
    }

    /**
     * This method mirrors {@link MatterCollisionPlugin#removeOnCollideStart}
     * @param {object} options
     */

  }, {
    key: "removeOnCollideActive",
    value: function removeOnCollideActive() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          objectA = _ref6.objectA,
          objectB = _ref6.objectB,
          callback = _ref6.callback,
          context = _ref6.context;

      this.removeOnCollide(this.collisionActiveListeners, objectA, objectB, callback, context);
    }

    /**
     * Remove any listeners that were added with addOnCollideStart.
     */

  }, {
    key: "removeAllCollideStartListeners",
    value: function removeAllCollideStartListeners() {
      this.collisionStartListeners.clear();
    }
    /**
     * Remove any listeners that were added with addOnCollideActive.
     */

  }, {
    key: "removeAllCollideActiveListeners",
    value: function removeAllCollideActiveListeners() {
      this.collisionActiveListeners.clear();
    }
    /**
     * Remove any listeners that were added with addOnCollideEnd.
     */

  }, {
    key: "removeAllCollideEndListeners",
    value: function removeAllCollideEndListeners() {
      this.collisionEndListeners.clear();
    }
    /**
     * Remove any listeners that were added with addOnCollideStart, addOnCollideActive or
     * addOnCollideEnd.
     */

  }, {
    key: "removeAllCollideListeners",
    value: function removeAllCollideListeners() {
      this.removeAllCollideStartListeners();
      this.removeAllCollideActiveListeners();
      this.removeAllCollideEndListeners();
    }

    /** @private */

  }, {
    key: "addOnCollide",
    value: function addOnCollide(map, objectA, objectB, callback, context) {
      var _this2 = this;

      if (!callback || typeof callback !== "function") {
        logger.warn("No valid callback specified. Received: " + callback);
        return;
      }
      var objectsA = Array.isArray(objectA) ? objectA : [objectA];
      var objectsB = Array.isArray(objectB) ? objectB : [objectB];
      objectsA.forEach(function (a) {
        objectsB.forEach(function (b) {
          _this2.addOnCollideObjectVsObject(map, a, b, callback, context);
        });
      });
    }

    /** @private */

  }, {
    key: "removeOnCollide",
    value: function removeOnCollide(map, objectA, objectB, callback, context) {
      var objectsA = Array.isArray(objectA) ? objectA : [objectA];
      var objectsB = Array.isArray(objectB) ? objectB : [objectB];
      objectsA.forEach(function (a) {
        if (!objectB) {
          map.delete(a);
        } else {
          var callbacks = map.get(a) || [];
          var remainingCallbacks = callbacks.filter(function (cb) {
            return !(objectsB.includes(cb.target) && (!callback || cb.callback === callback) && (!context || cb.context === context));
          });
          if (remainingCallbacks.length > 0) map.set(a, remainingCallbacks);else map.delete(a);
        }
      });
    }

    /** @private */

  }, {
    key: "addOnCollideObjectVsObject",
    value: function addOnCollideObjectVsObject(map, objectA, objectB, callback, context) {
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

      var callbacks = map.get(objectA) || [];
      callbacks.push({ target: objectB, callback: callback, context: context });
      map.set(objectA, callbacks);
    }

    /**
     * Reusable handler for collisionstart, collisionend, collisionactive.
     * @private
     * */

  }, {
    key: "onCollisionEvent",
    value: function onCollisionEvent(listenerMap, eventName, event) {
      var _this3 = this;

      var pairs = event.pairs;
      var pairEventName = "pair" + eventName;
      var eventData = {};
      var eventDataReversed = { isReversed: true };

      pairs.map(function (pair, i) {
        var bodyA = pair.bodyA,
            bodyB = pair.bodyB;


        var gameObjectA = getRootBody(bodyA).gameObject;
        var gameObjectB = getRootBody(bodyB).gameObject;

        // Special case for tiles, where it's more useful to have a reference to the Tile object not
        // the TileBody. This is hot code, so use a property check instead of instanceof.
        if (gameObjectA && gameObjectA.tile) gameObjectA = gameObjectA.tile;
        if (gameObjectB && gameObjectB.tile) gameObjectB = gameObjectB.tile;

        pairs[i].gameObjectA = gameObjectA;
        pairs[i].gameObjectB = gameObjectB;

        eventData.bodyA = bodyA;
        eventData.bodyB = bodyB;
        eventData.gameObjectA = gameObjectA;
        eventData.gameObjectB = gameObjectB;
        eventData.pair = pair;

        _this3.events.emit(pairEventName, eventData);

        if (listenerMap.size) {
          eventDataReversed.bodyB = bodyA;
          eventDataReversed.bodyA = bodyB;
          eventDataReversed.gameObjectB = gameObjectA;
          eventDataReversed.gameObjectA = gameObjectB;
          eventDataReversed.pair = pair;

          _this3.checkPairAndEmit(listenerMap, bodyA, bodyB, gameObjectB, eventData);
          _this3.checkPairAndEmit(listenerMap, bodyB, bodyA, gameObjectA, eventDataReversed);

          if (gameObjectA) {
            _this3.checkPairAndEmit(listenerMap, gameObjectA, bodyB, gameObjectB, eventData);
          }
          if (gameObjectB) {
            _this3.checkPairAndEmit(listenerMap, gameObjectB, bodyA, gameObjectA, eventDataReversed);
          }
        }
      });

      this.events.emit(eventName, event);
    }

    /** @private */

  }, {
    key: "checkPairAndEmit",
    value: function checkPairAndEmit(map, objectA, bodyB, gameObjectB, eventData) {
      var callbacks = map.get(objectA);
      if (callbacks) {
        callbacks.forEach(function (_ref7) {
          var target = _ref7.target,
              callback = _ref7.callback,
              context = _ref7.context;

          if (!target || target === bodyB || target === gameObjectB) {
            callback.call(context, eventData);
          }
        });
      }
    }
  }, {
    key: "subscribeMatterEvents",
    value: function subscribeMatterEvents() {
      var matter = this.scene.matter;
      if (!matter || !matter.world) {
        logger.warn("Plugin requires matter!");
        return;
      }
      matter.world.on("collisionstart", this.onCollisionStart);
      matter.world.on("collisionactive", this.onCollisionActive);
      matter.world.on("collisionend", this.onCollisionEnd);
    }
  }, {
    key: "unsubscribeMatterEvents",
    value: function unsubscribeMatterEvents() {
      // Don't unsub if matter next existing or if the game is destroyed (since the matter world will
      // be already gone)
      var matter = this.scene.matter;
      if (!matter || !matter.world) return;
      matter.world.off("collisionstart", this.onCollisionStart);
      matter.world.off("collisionactive", this.onCollisionActive);
      matter.world.off("collisionend", this.onCollisionEnd);
    }
  }, {
    key: "start",
    value: function start() {
      // If restarting, unsubscribe before resubscribing to ensure only one listener is added
      this.scene.events.off("shutdown", this.shutdown, this);
      this.scene.events.on("shutdown", this.shutdown, this);
      this.subscribeMatterEvents();
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this.removeAllCollideListeners();
      this.unsubscribeMatterEvents();
      // Resubscribe to start so that the plugin is started again after Matter
      this.scene.events.once("start", this.start, this);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.scene.events.off("start", this.start, this);
      this.scene.events.off("shutdown", this.shutdown, this);
      this.removeAllCollideListeners();
      this.unsubscribeMatterEvents();
      this.scene = undefined;
    }
  }]);

  return MatterCollisionPlugin;
}(external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default.a.Plugins.ScenePlugin);

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


/* harmony default export */ var phaser_matter_collision_plugin = (phaser_matter_collision_plugin_MatterCollisionPlugin);
// CONCATENATED MODULE: ./index.js


/* harmony default export */ var index = __webpack_exports__["default"] = (phaser_matter_collision_plugin);

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=phaser-matter-collision-plugin.js.map