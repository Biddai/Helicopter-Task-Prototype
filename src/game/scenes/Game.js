import { Scene } from 'phaser';
import Helicopter from "../objects/Helicopter.js"
import Bucket from "../objects/Bucket.js"
import Coin from "../objects/Coin.js"
import {events} from "../utils/events.js"
export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }
    spawnCoin(x, y, color) {
        const coin = this.coins.get(x, y);
        if (!coin) return null;
        coin.setPosition(x, y);
        coin.activate(color);
        console.log("coin active");
        return coin;
    }
    catchCoin(bucket, coin) {
        coin.deactivate();   // remove coin
        console.log("coin deactive");
        events.emit("score:add", 10);
        if (this.rect) this.rect.destroy();
    }
    fallenCoin(t,coin){
        console.log("Coin fell");
        this.bucket.x;
        // Draw rectangle to highlight distance from bucket
          if (this.rect) {
            this.rect.destroy();
        }
        this.rect =this.rectFromCorners(coin.x,this.bucket.y,this.bucket.x,this.bucket.y+50,0x00ff88);
        coin.deactivate();
    }
    rectFromCorners(x1, y1, x2, y2, color = 0xffaa00) {
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const r = this.add.rectangle(cx, cy, w, h, color); // origin 0.5 (center)
        return r;
    }

    // mean = μ, standard deviation = σ
    randGaussian(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // avoid 0
        while (v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    }
    updateHeliLocation(){
        const rand = Math.random();
        const newX = 1024*rand;
        this.helicopter.moveTo(newX);
        console.log("new heli location:",newX);
    }
    updateHeli(hazard_rate = 0.125,std = 20){
        //Check if we update
        if (Math.random()<hazard_rate){
            this.updateHeliLocation();
        }
        //Spawn coin on distribution
        const coinX = this.randGaussian(this.helicopter.x,std)
        this.spawnCoin(coinX,this.helicopter.y,0);
    }
    showMessage(scene, x, y, msg, duration = 2000) {
        const text = scene.add.text(x, y, msg, {
            fontSize: "28px",
            color: "#ffff00",
            fontStyle: "bold"
        }).setOrigin(0.5);

        scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: duration,
            ease: "Power1",
            onComplete: () => text.destroy()
        });
    }
    create ()
    {
        this.hasActiveCoin = false;
        // UI
        this.scene.launch("UIScene");
        this.scene.bringToTop("UIScene");
        this.events.emit("score:set",0);
        // Key to lock in the bucket and drop the next coin
        this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        // Create main objects
        this.add.image(512, 384, 'gameBackground')
        this.cursors = this.input.keyboard.createCursorKeys();
        this.helicopter = new Helicopter(this,400,300);
        this.helicopter.setGravityY(0);
        this.helicopter.body.setAllowGravity(false);
        this.bucket = new Bucket(this,384,672);
        this.bucket.body.setSize(this.bucket.width, this.bucket.height / 3).setAllowGravity(false);
        this.bucket.setImmovable(true);

        // Create coins group
        this.coins = this.physics.add.group({
        classType: Coin,          // custom class (see below)
        runChildUpdate: true,
        maxSize: 5
        });
        //Generate bottom platform
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400,950,"platform");
        // Start game mechanics
        this.physics.add.collider(this.bucket,this.coins, this.catchCoin, null, this);
        this.physics.add.collider(this.platforms,this.coins, this.fallenCoin, null, this);

        this.updateHeli();
    }

    update(){
        if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
            if(this.bucket.body.velocity.x==0)
                this.updateHeli();
            else{
                this.showMessage(this,384,360,"Bucket must be stationary for the coin drop",2000);
            }
        }   
        this.helicopter.update();
        this.bucket.update(this.cursors);
        this.input.on("pointerdown",(p)=>{this.bucket.moveTo(p.x);})

    }
}
