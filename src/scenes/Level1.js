class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        console.log("in level 1");
        
        //Star
        this.p_scale = 0.2;

        this.star = new Star(
            this, canvas_width/2, canvas_width/2 - 400, this.p_scale, "Star"
        );

        this.satellite = new Satellite(
            this, canvas_width/2, canvas_height/2, 1, "Satellite"
        );
    }

    update() {
        this.star.update();
        this.satellite.update();
    }
}   