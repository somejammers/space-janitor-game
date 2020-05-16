class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        console.log("in level 1");
        
        //Star
        this.p_scale = 0.15;

        this.star = new Star(
            this, canvas_width/2, canvas_width/2 - 300, this.p_scale, "Star"
        );
        


        this.satelliteGroup = this.add.group({
            runChildUpdate: true
        });

        // this.satellite = new Satellite(
        //     this, canvas_width/1.5, canvas_height/2, 1, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite);

        this.satellite_2 = new Satellite(
            this, canvas_width/9, canvas_height/1.5, 1, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_2);

        // this.satellite_3 = new Satellite(
        //     this, canvas_width/2, canvas_height/9, 0.19, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite_3);

        this.satellite_4 = new Satellite(
            this, canvas_width/2, canvas_height/5, 0.14, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_4);

        // this.satellite_5 = new Satellite(
        //     this, canvas_width/2, canvas_height/3, 0.19, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite_5);

        this.satellite_6 = new Satellite(
            this, canvas_width/2, canvas_height/2, 0.90, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_6);

        this.satellite_7 = new Satellite(
            this, canvas_width/2, canvas_height/1.5, 0.19, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_7);

        //Camera
        // object, roundPixels, lerpX, lerpY
        // lerp determines how quickly the camera follows
        
        this.star.setCameraToStar();

        //if you want sometihng that is fixed to the camera, like a health bar,
        //use this.object.setScrollFactor(0); you can also do parallax like this

    }

    update() {
        this.star.update();

    }

    updateSatellites() {
        console.log("updating");
        let children = this.satelliteGroup.getChildren();
        for (var i = 0; i < children.length; i++) 
        {
            children[i].updateOrbital();
        }
    }

    exampleGroupCall() {
        let children = this.satelliteGroup.getChildren();
        for (var i = 0; i < children.length; i++) 
        {
            children[i].test();
        }
    }
    
}   