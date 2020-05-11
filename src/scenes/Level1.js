class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        console.log("in level 1");
        
        //Star
        this.p_scale = 0.2;

        this.star = new Star(
            this, canvas_width/2, canvas_width/2 - 400, this.p_scale, "Star"
        );

        this.satellite = new Satellite(
            this, canvas_width/1.5, canvas_height/2, 1, "Satellite"
        );

        this.satellite_2 = new Satellite(
            this, canvas_width/9, canvas_height/2, 1, "Satellite"
        );
    }

    update() {
        this.star.update();
        this.satellite.update();
    }
}   