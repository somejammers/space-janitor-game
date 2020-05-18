class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
        //Star
        this.p_scale = 0.15;

        this.star = new Star(
            this, canvas_width/2 + 10, canvas_width/2 - 320, this.p_scale, "Star"
        );
        


        this.satelliteGroup = this.add.group({
            runChildUpdate: true
        });

        // this.satellite = new Satellite(
        //     this, canvas_width/1.5, canvas_height/2, 1, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite);

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

        //Camera
        // object, roundPixels, lerpX, lerpY
        // lerp determines how quickly the camera follows
        
        this.star.setCameraToStar(this.star.Scale);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXAMPLE OF CREATING A NEW PHASER OBJECT
        // this.panFX = new PanFX(this, this.cameras.main);
        // this.panFX.start(0,0, 2000, 'Linear', true);
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        //if you want sometihng that is fixed to the camera, like a health bar,
        //use this.object.setScrollFactor(0); you can also do parallax like this

        this.fullViewportDiameter = 720;//later, set this to be based on the camera zoomout regarding the object 2 tiers higher than the current player's scale tier. Edge case for last 3 objects
        this.fullViewportRadius = 720/2;
        this.killDist = 1020; //make this dist from star to corner of screen

        this.screenXonLastSatSpawn = this.star.x;
        this.screenYonLastSatSpawn = this.star.y;
        //keep track of screen location using star's position every frame
        this.screenXcurrent = this.star.x;
        this.screenYcurrent = this.star.y;
        //
        this.xOffset;
        this.yOffset;
        //volumes
        this.boxA;
        this.boxB;
        this.boxC;
        this.offsetVolume;
        //required volume difference to spawn satellite
        this.volThreshold = 300 * 300;
        //distance from other satellits required to spawn
        //update the following in generateSatellite() by picking a random valid object and updating tier
        this.spawnThreshold = 200;//I'm thinking it should be the object that's being placed's orbital radius * 2
        this.tier = 1;
    }


    update() {
        this.star.update();

        //procedural generation of satellites
        this.screenXcurrent = this.star.x;
        this.screenYcurrent = this.star.y;

        this.calculateScreenOffset();

        if (this.offsetVolume > this.volThreshold) {
            this.generateSatellite();
        }
    }

    calculateScreenOffset() {
        //two problems:
        // box A is like never chosen
        // generation slows down immensely
        // generated in weird places
        // satellites that are attached also check distance..
        // the rate reduces bc it odesnt scale w star size idiot
        // you definitely do need to account for the objects specific orbital when considering spawnThreshold and add a random offst
        
        //calculate 3 boxes based on distance from current screen to screen from last spawn
        // and then calculate the total volume of the Offset, to put into an if statement for the spawn
        this.xOffset = this.screenXcurrent - this.screenXonLastSatSpawn;
        this.yOffset = this.screenYcurrent - this.screenYonLastSatSpawn;
        
        //volumes:
        this.boxA = Math.abs(this.xOffset * (this.fullViewportDiameter - Math.abs(this.yOffset)));
        this.boxB = Math.abs(this.yOffset * (this.fullViewportDiameter - Math.abs(this.xOffset)));
        this.boxC = Math.abs(this.yOffset * this.xOffset);

        // console.log(this.boxA);

        this.offsetVolume = this.boxA + this.boxB + this.boxC;
    }

    generateSatellite() {
        //Use this after calculateScreenOffset
        //pick which box to generate the satellite in
        let ticket = Math.random() * this.offsetVolume;
        let volArray = [this.boxA, this.boxB, this.boxC];
        let currBox = Math.floor(Math.random() * 3);

        //weighted random picker
        while (true) {
            ticket -= volArray[currBox];
            if (ticket < volArray[currBox]) break;
            currBox++;
            currBox = currBox % 3;
        }

        let xOffsetSign = this.xOffset >= 0 ? 1 : -1;
        let yOffsetSign = this.yOffset >= 0 ? 1 : -1;
        let x1, x2, y1, y2, xSpawn, ySpawn;

        //A
        if (currBox == 0) {
            //pick a random spot in the box
            x1 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius);
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + this.xOffset;

            y1 = this.screenYonLastSatSpawn + (-yOffsetSign * this.fullViewportRadius); //testing 
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius);

        } 
        //B
        else if (currBox == 1)
        {
            x1 = this.screenXonLastSatSpawn + (-xOffsetSign * this.fullViewportRadius); //testing
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius);

            y1 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius);
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + this.yOffset;

        }
        //C
        else
        {
            x1 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius);
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + this.xOffset;

            y1 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius);
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + this.yOffset;

        }

            xSpawn = Math.floor(Math.random() * (x2 - x1)) + x1;
            ySpawn = Math.floor(Math.random() * (y2 - y1)) + y1;


            if(this.checkLocationValidity(xSpawn, ySpawn))
            {
                //add the tier as aVol parameter later, which checks the scaleArray and textureArray
                this.createSatellite(xSpawn, ySpawn);
                this.screenXonLastSatSpawn = this.screenXcurrent;
                this.screenYonLastSatSpawn = this.screenYcurrent;
                this.checkStraySatellite();
            }
    }

    checkLocationValidity(x, y) {
        //if too close to another satellite, return false
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            let distToSatellite = satellites[i].getDistFromOrbitalTo(x, y);
            if (!satellites[i].isAttachedToStar && distToSatellite < this.spawnThreshold) return false;
        }
        return true;
    }

    createSatellite(x, y, tier) {
        // let scale = scaleArray[tier]; 
        // let texture = textureArray[tier];
        let scale = 0.14;

        let satellite = new Satellite(
            this, x, y, scale, "Satellite"
        );

        this.satelliteGroup.add(satellite);
    }

    updateScaleTier(sizeMod) {
        this.tier += sizeMod;
    }

    checkStraySatellite() {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            if (!satellites[i].isAttachedToStar) {
                if (satellites[i].getDistFromOrbitalTo(this.star.x, this.star.y) > this.killDist) {
                    satellites[i].destroy();
                }
            }
        }
    }

    updateSatellites(starScale) {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            satellites[i].updateOrbital(starScale);
        }
    }
    
}   