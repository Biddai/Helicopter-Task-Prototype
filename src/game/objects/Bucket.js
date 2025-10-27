// src/objects/Helicopter.js
export default class Bucket extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object} opts
   */
    constructor(scene, x, y, opts = {}) {
        super(scene, x, y, "bucket");
        this.setScale(0.3);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // ---- Config (tweak here) ----
        this.SPEED = 240;
        this.DRAG = 600;                // smooth stop
        this.MAX_VEL = 360;
        this.TILT_MAX_DEG = 18;         // max bank angle
        this.TILT_FROM_VX = 0.06;       // tilt sensitivity (deg per px/s)
        this.TILT_LERP = 0.15;          // 0..1 smoothing each frame

        // Physics feel
        this.setCollideWorldBounds(true);
        //this.body.setOffset(10, this.height - 20);// Offset due to sprite size
    }

    handleInput(cursors) {
        const ax = (cursors.left.isDown ? -1 : 0) + (cursors.right.isDown ? 1 : 0);
        this.setVelocity(ax * this.SPEED * 1, 0);
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
    moveTo(x, y=672, speed = 1000) {
        if (!this.body) return;
        // Stop any manual acceleration/velocity first
        this.setAcceleration(0, 0);
        // Use Phaser’s built-in moveToObject helper
        const angle = Phaser.Math.Angle.Between(this.x, this.y, x, this.y);
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
        // Optional: mark target so we know when arrived
        this._moveTarget = { x, y, speed };
    }

  update(cursors) {
    if (!this.body) return;
    // 1) Input → velocity
    if (this._moveTarget) {
    // arrival check
    const { x: tx, y: ty } = this._moveTarget;
    const dx = this.x - tx, dy = this.y - ty;
    if (dx*dx + dy*dy < 16*16) {
      this.setVelocity(0, 0);
      this._moveTarget = null;
    }}
    else if(cursors) this.handleInput(cursors);
    console.log("current bucket y: %d", this.y);
    // 2) Visuals from velocity
    this.tiltFromVelocity();
  }
}
