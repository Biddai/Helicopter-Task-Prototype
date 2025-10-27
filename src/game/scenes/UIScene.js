// src/scenes/UIScene.js
import { events } from "../utils/events.js";

export default class UIScene extends Phaser.Scene {
  constructor() { super({ key: "UIScene" }); }

  create() {
    // Score state
    this.score = 0;

    // Score text (use BitmapText if you need performance)
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "48px",
      color: "#fff",
      stroke: '#000000',strokeThickness:8
    }).setScrollFactor(0).setDepth(1000);

    // Listen for score updates
    events.on("score:add", this.onScoreAdd, this);
    events.on("score:set", this.onScoreSet, this);

    // Clean up when scene stops
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("score:add", this.onScoreAdd, this);
      events.off("score:set", this.onScoreSet, this);
    });
  }

  onScoreAdd(amount = 1) {
    this.score += amount;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  onScoreSet(value = 0) {
    this.score = value;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}
