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
        this.p_scale = 0.2;

        this.star = new Star(
            this, canvas_width/2, canvas_width/2 - 400, this.p_scale, "Star"
        );
        


        this.satelliteGroup = this.add.group({
            runChildUpdate: true
        });

        // this.satellite = new Satellite(
        //     this, canvas_width/1.5, canvas_height/2, 1, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite);

        this.satellite_2 = new Satellite(
            this, canvas_width/9, canvas_height/2, 1, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_2);

        this.satellite_3 = new Satellite(
            this, canvas_width/2, canvas_height/9, 0.19, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_3);

        this.satellite_4 = new Satellite(
            this, canvas_width/2, canvas_height/5, 0.19, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_4);

        this.satellite_5 = new Satellite(
            this, canvas_width/2, canvas_height/4, 0.19, "Satellite"
        );

        this.satelliteGroup.add(this.satellite_5);

    }

    update() {
        this.star.update();

    }

    updateSatellites() {
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