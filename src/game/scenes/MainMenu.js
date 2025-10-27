import { Scene } from 'phaser';
import Button from "../objects/Button.js"

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        const startBtn = new Button(this,512, 460, 'Start', () => {this.scene.start('Game');});
        const settingstBtn = new Button(this,512, 520, 'Settings', () => {});
        new Button(this,512,580,"Quit",()=>{this.game.destroy(true)});
    }

}
