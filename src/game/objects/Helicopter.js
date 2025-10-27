// src/objects/Helicopter.js
import Coin from "../objects/Coin.js"
export default class Helicopter extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object} opts
   *   - facesRight: does the art face right by default? (default: true)
   */
    constructor(scene, x, y, opts = {}) {
        super(scene, x, y, "helicopter");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // ---- Config (tweak here) ----
        this.SPEED = 240;
        this.DRAG = 600;                // smooth stop
        this.MAX_VEL = 360;
        this.TILT_MAX_DEG = 18;         // max bank angle
        this.TILT_FROM_VX = 0.06;       // tilt sensitivity (deg per px/s)
        this.TILT_LERP = 0.15;          // 0..1 smoothing each frame
        this.facesRight = opts.facesRight ?? true;

        // Physics feel
        this.setCollideWorldBounds(true);

        // Animation (create once globally)
        if (!scene.anims.exists("helicopter_fly")) {
        scene.anims.create({
            key: "helicopter_fly",
            frames: scene.anims.generateFrameNumbers("helicopter", { start: 0, end: 4 }),
            frameRate: 12,
            repeat: -1
        });
        }
        this.play("helicopter_fly");
    }

    handleInput(cursors) {
        const ax = (cursors.left.isDown ? -1 : 0) + (cursors.right.isDown ? 1 : 0);
        const ay = (cursors.up.isDown ? -1 : 0) + (cursors.down.isDown ? 1 : 0);
        // accelerate in 8 directions
        this.setVelocity(ax * this.SPEED * 1, ay * this.SPEED * 1);

        // If idle, bleed off acceleration
        if (ax === 0 && ay === 0) this.setAcceleration(0, 0);
    }

    mirrorFromVelocity() {
        const vx = this.body.velocity.x;

        // Decide when to flip (deadzone avoids flicker at ~0)
        const DEADZONE = 10;
        if (Math.abs(vx) <= DEADZONE) return;

        // If the art faces right by default, flip when going left.
        // If your art faces left by default, set facesRight: false in constructor.
        const goingRight = vx > 0;
        const shouldBeFlipX = this.facesRight ? !goingRight : goingRight;
        this.setFlipX(shouldBeFlipX);
    }

    tiltFromVelocity() {
        const vx = this.body.velocity.x;

        // Target tilt in DEGREES, proportional to horizontal speed
        let targetDeg = vx * this.TILT_FROM_VX;
        targetDeg = Phaser.Math.Clamp(targetDeg, -this.TILT_MAX_DEG, this.TILT_MAX_DEG);

        // Smoothly interpolate (lerp) current rotation toward target
        const currentDeg = Phaser.Math.RadToDeg(this.rotation);
        const nextDeg = Phaser.Math.Linear(currentDeg, targetDeg, this.TILT_LERP);
        this.setRotation(Phaser.Math.DegToRad(nextDeg));
    }
    moveTo(x, y = this.y, speed = 200) {
        if (!this.body) return;

        // Stop any manual acceleration/velocity first
        this.setAcceleration(0, 0);

        // Use Phaser’s built-in moveToObject helper
        const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);

        // Optional: mark target so we know when arrived
        this._moveTarget = { x, y, speed };
    }

    teleportTo(x, y, { face = null, resetTilt = true } = {}) {
    // stop any physics motion / autopilot
    this._moveTarget = null;
    this.setAcceleration(0, 0);
    this.setVelocity(0, 0);

    // snap position
    this.setPosition(x, y);

    // optional: face a direction ("left" | "right") after teleport
    if (face === "left")  this.setFlipX(!this.facesRight);
    if (face === "right") this.setFlipX(this.facesRight);

    // optional: clear any tilt/rotation so it doesn't look mid-bank
    if (resetTilt) this.setRotation(0);

    }
    spawnCoin(color){
        new Coin(this.scene,this.x,this.y,color);
    }
  update(cursors) {
    if (!this.body) return;

    // 1) Input → velocity
    if (cursors) this.handleInput(cursors);
    // 2) Visuals from velocity
    this.mirrorFromVelocity();
    this.tiltFromVelocity();
  }
}
