export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map-collision-mapped.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );
    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    const image1 = this.matter.add
      .image(250, 50, "emoji", "1f92c", { restitution: 1, friction: 0, shape: "circle" })
      .setScale(0.4)
      .setData("name", "angry");
    const image2 = this.matter.add
      .image(250, 150, "emoji", "1f60d", { restitution: 1, friction: 0, shape: "circle" })
      .setScale(0.4)
      .setData("name", "hearts");
    const image3 = this.matter.add
      .image(250, 250, "emoji", "1f4a9", { restitution: 1, friction: 0, shape: "circle" })
      .setScale(0.4)
      .setData("name", "poop");

    const graphics = this.add.graphics().setData("name", "bars");

    const M = Phaser.Physics.Matter.Matter;
    const compoundBody = M.Body.create({
      parts: [
        M.Bodies.rectangle(0, 0, 20, 200),
        M.Bodies.rectangle(100, 0, 20, 200),
        M.Bodies.rectangle(200, 0, 20, 200),
        M.Bodies.rectangle(300, 0, 20, 200)
      ]
    });
    this.matter.world.add(compoundBody);

    compoundBody.parts.forEach((part, i) => {
      if (i === 0) part.label = "root";
      else part.label = "bar " + i;
    });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-160, -100, 20, 200);
    graphics.fillRect(-60, -100, 20, 200);
    graphics.fillRect(40, -100, 20, 200);
    graphics.fillRect(140, -100, 20, 200);
    this.matter.add
      .gameObject(graphics)
      .setExistingBody(compoundBody)
      .setPosition(400, 0);

    // const cb = (otherBody, otherGameObject, pair) => {
    //   console.log(`Angry emoji hit ${otherGameObject.getData("name")}`);
    //   this.matterCollision.removeCollisionStart(image1, [image2, image3], cb);
    // };
    // this.matterCollision.addCollisionStart(image1, [image2, image3], cb);

    // const extractName = (gameObject, body) => {
    //   if (gameObject) {
    //     if (gameObject.tile) return gameObject.tile.index;
    //     else return gameObject.getData("name");
    //   } else {
    //     return body.label;
    //   }
    // };
    // this.matterCollision.events.on("collisionstart", (bodyA, gameObjectA, bodyB, gameObjectB) => {
    //   console.log(
    //     `${extractName(gameObjectA, bodyA)} and ${extractName(gameObjectB, bodyB)} collided`
    //   );
    // });

    // All collision, with gameObjectA & gameObjectB installed on the pairs
    // this.matterCollision.events.on("collisionstart", event => {
    //   console.log(event);
    //   debugger;
    // });
    // this.matterCollision.events.on("collisionactive", event => {
    //   console.log(event);
    //   debugger;
    // });
    // this.matterCollision.events.on("collisionend", event => {
    //   console.log(event);
    //   debugger;
    // });

    // Called for each pair, with gameObjectA & gameObjectB in the pairData
    this.matterCollision.events.on("paircollisionstart", pairData => {
      console.log(pairData);
      debugger;
    });
    this.matterCollision.events.on("paircollisionactive", pairData => {
      console.log(pairData);
      debugger;
    });
    this.matterCollision.events.on("paircollisionend", pairData => {
      console.log(pairData);
      debugger;
    });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5
    };
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
  }

  update(time, delta) {
    this.controls.update(delta);
  }
}
