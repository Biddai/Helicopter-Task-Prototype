export default class Coin extends Phaser.Physics.Arcade.Sprite {
    
    constructor(scene,x,y,color,opts = {}){
        super(scene,x,y,"coin");
        // Animation (create once globally)
        this.createCoinAnimations(scene);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // Physics Config (Maybe use global config?)
        this.DRAG = 600;                // smooth stop
        this.setCollideWorldBounds(true).setDrag(this.DRAG,this.DRAG).setDamping(true);
        this.setScale(2);
        this.body.onWorldBounds = true;

    }

    createCoinAnimations() {
        const cfg = [
            { key: "coinR_spin", sheet: "coinR" },
            { key: "coinP_spin", sheet: "coinP" },
            { key: "coinD_spin", sheet: "coinD" }
        ];
        for (const { key, sheet } of cfg) {
            if (!this.anims.exists(key)) {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: 4 }),
                frameRate: 12,
                repeat: -1
            });
            }
        }
    }

    activate(color) {
        // Map color → texture/anim
        const animByColor = { 0: "coinR_spin", 1: "coinP_spin", 2: "coinD_spin" };

        const anim = animByColor[color];
        if (anim) this.play("coinR_spin");
        this.setActive(true).setVisible(true);
        this.body.enable = true;
    }

    deactivate() {
        this.body.stop();
        this.setActive(false).setVisible(false);
        this.body.enable = false;
    }
}