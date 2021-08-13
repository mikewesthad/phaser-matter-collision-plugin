class MainScene extends Phaser.Scene {
  /**
   * Only necessary if you want your code editor to know type information!
   * @type {PhaserMatterCollisionPlugin}
   */
  matterCollision;

  preload() {
    this.load.tilemapTiledJSON("map", "./assets/tilemaps/level.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "./assets/tilesets/kenney-tileset-64px-extruded.png"
    );
    this.load.atlas("emoji", "./assets/atlases/emoji.png", "./assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createLayer("Lava", tileset, 0, 0);

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Create two simple animations - one angry => grimace emoji and one heart eyes => grimace
    this.anims.create({
      key: "angry",
      frames: [
        { key: "emoji", frame: "1f92c" },
        { key: "emoji", frame: "1f62c" },
      ],
      frameRate: 3,
      repeat: 0,
    });
    this.anims.create({
      key: "love",
      frames: [
        { key: "emoji", frame: "1f60d" },
        { key: "emoji", frame: "1f62c" },
      ],
      frameRate: 3,
      repeat: 0,
    });

    const bodyOptions = { restitution: 1, friction: 0, shape: "circle" };
    const emoji1 = this.matter.add.sprite(350, 100, "emoji", "1f62c", bodyOptions);
    const emoji2 = this.matter.add.sprite(350, 275, "emoji", "1f62c", bodyOptions);
    const emoji3 = this.matter.add.sprite(350, 350, "emoji", "1f4a9", bodyOptions);

    // Only listen for collisions between emoji 1 & 2 - make them love-hate when they start
    // colliding or continue colliding
    this.matterCollision.addOnCollideStart({
      objectA: emoji1,
      objectB: emoji2,
      callback: ({ gameObjectA, gameObjectB }) => {
        gameObjectA.play("angry", false); // gameObjectA will always match the given "objectA"
        gameObjectB.play("love", false); // gameObjectB will always match the given "objectB"
      },
    });
    this.matterCollision.addOnCollideActive({
      objectA: emoji1,
      objectB: emoji2,
      callback: ({ gameObjectA, gameObjectB }) => {
        gameObjectA.play("angry", false);
        gameObjectB.play("love", false);
      },
    });

    // Kill poop emoji on collide with lava
    const unsubscribe = this.matterCollision.addOnCollideStart({
      objectA: emoji3,
      callback: ({ gameObjectB }) => {
        if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;
        if (gameObjectB.index === 290) {
          emoji3.destroy();
          unsubscribe();
        }
      },
    });

    // Make the emoji draggable
    emoji1.setInteractive();
    emoji2.setInteractive();
    emoji3.setInteractive();
    this.input.setDraggable(emoji1);
    this.input.setDraggable(emoji2);
    this.input.setDraggable(emoji3);
    this.input.on("drag", (pointer, gameObject, x, y) => gameObject.setPosition(x, y));
    this.input.on("dragstart", (pointer, gameObject) => gameObject.setStatic(true));
    this.input.on("dragend", (pointer, gameObject) => gameObject.setStatic(false));

    const text = "Click and drag the emoji.\nArrow keys to move the camera.";
    const help = this.add.text(16, 16, text, {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000",
    });
    help.setScrollFactor(0).setDepth(1000);

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5,
    };
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

    this.cameras.main.scrollX = 100;
    this.cameras.main.scrollY = 100;
  }

  update(time, delta) {
    this.controls.update(delta);
  }
}
