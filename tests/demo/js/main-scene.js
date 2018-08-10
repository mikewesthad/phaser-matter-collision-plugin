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

    const cb = (otherBody, otherGameObject, pair) => {
      console.log(`Angry emoji hit ${otherGameObject.getData("name")}`);
      this.matterCollision.removeCollisionStart(image1, [image2, image3], cb);
    };
    this.matterCollision.addCollisionStart(image1, [image2, image3], cb);

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
