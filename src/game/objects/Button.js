// Class for menu buttons and such

export default class Button extends Phaser.GameObjects.Text{
    constructor(scene, x, y, label, clickFunction){
        super(scene,x,y,label,{
            fontSize: 38,
            fontFamily: "Arial",
            color: "#ffffff",
            stroke: '#000000',
            strokeThickness:8,
            padding: { x: 10, y: 5 }
        });

        this.setOrigin(0.5);
        this.setInteractive({useHandCursor:true});

        this.on('pointerover', () => this.setStyle({ color: '#ffd54a' }));
        this.on('pointerout', () => this.setStyle({ color: '#ffffff' }));
        this.on('pointerdown', clickFunction);
        scene.add.existing(this);
    }
}