class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        this.satelliteTextureArray = ["debris_apple.png", "debris_banana.png", "debris_sodacan.png", "debris_shoe.png", "debris_newspaper.png", "debris_fish.png", "debris_toybunny.png", "debris_kite.png", "debris_computer.png", "debris_couch.png", "debris_dumpster.png", "debris_rocket.png"];
        //I think scaling should be d = 2a + b + c and have the largest object in tier be 3 ahead
        this.satelliteScaleArray =   [0.2,                0.25,                0.5,                 0.75,               1.25,                   2,                3.25,                  5.25,              31.9,                  51.6,               115.4,                 218.6]
        this.satelliteArrayIndex = 1; //start at size banana but cant go lower, can see apple, banana, soda, and shoe. scaling is adding last two together. updated upto kite

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Star
        this.p_scale = 0.25;

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

        // this.satellite_4 = new Satellite(
        //     this, canvas_width/2, canvas_height/5, 0.14, "debris_banana.png"
        // );

        // this.satelliteGroup.add(this.satellite_4);

        // this.satellite_5 = new Satellite(
        //     this, canvas_width/2, canvas_height/3, 0.19, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite_5);

        // this.satellite_6 = new Satellite(
        //     this, canvas_width/2, canvas_height/2, 0.90, "Satellite"
        // );

        // this.satelliteGroup.add(this.satellite_6);

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


        this.farthestZoomValue = Math.abs(0.2/(this.star.postGrowthScale *1.5)); //was 0.5+(0.05/this.satelliteScaleArray[this.satelliteArrayIndex + 3]
        //this needs to be based on the zoomout of the highest possible object in the current tier of scale
        // canvas_width * 
        this.fullViewportDiameter = 720/this.farthestZoomValue  +
            (150 * this.satelliteScaleArray[this.satelliteArrayIndex + 3])/2; // this is the radius of the largest possible satellite
        this.fullViewportRadius = this.fullViewportDiameter/2;
        this.killDist = Math.sqrt(this.fullViewportRadius * this.fullViewportRadius
            + this.fullViewportRadius * this.fullViewportRadius);
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
        this.volThreshold = 250 * 250; //needa scale this bc speed inc
        //distance from other satellits required to spawn
        //update the following in generateSatellite() by picking a random valid object and updating tier
        this.strandedTimer = 0;
        this.strandedEventTime = 120; //3 seconds
        this.strandedEventTimeLoop = 120 + 30 * this.satelliteArrayIndex;
        this.resetEventTime = 360; //emergency bug bypass

        // this.saveStrandedStar();
    }


    update() {
        this.star.update();

        //procedural generation of satellites
        this.screenXcurrent = this.star.x;
        this.screenYcurrent = this.star.y;

        this.calculateScreenOffset();

        if (this.offsetVolume > this.volThreshold && this.star.cameraSetBool) {
            this.generateSatellite();
        }

        this.resetTimer++;
        if (this.isStrandedTicking) this.strandedTimer ++;
        if (this.strandedTimer > this.strandedEventTime) {
            this.strandedTimer = 0;
            this.resetTimer = 0;
            this.strandedEventTimeLoop = 120 + 30 * this.satelliteArrayIndex;
            this.strandedEventTime = this.strandedEventTimeLoop;
            this.saveStrandedStar();
            this.star.orbitalEntered = false;
        }

        if (this.resetTimer > this.resetEventTime) 
        {
            console.log("bug");
            this.resetTimer = 0;
            this.star.orbitalEntered = false;
            this.star.isBouncing = false;
            this.isStrandedTicking = true;
            this.star.cameraSetBool = true;
        }
    }

    normalize(x, y, mod) {
        if (x * y != 0) 
        {  
            let length = Math.sqrt(
                (x * x)
                +
                (y * y)
            );  

            let normX = x / length;
            let normY = y / length;

            let results = [normX * mod, normY * mod];
            return results;
        }
        return 0;
    }
    
    saveStrandedStar() {
        console.log("saving");
        if (!this.star.orbitalEntered) this.star.cameraSetBool = true;

        // let the final in normalize() params denote how far the satellite is from the star
        let normVel =  this.normalize(this.star.x_velocity, this.star.y_velocity, this.killDist-1);
        let savingSatelliteX = this.star.x + normVel[0];
        let savingSatelliteY = this.star.y + normVel[1];

        //now offset it on either side of the star
        let scale = this.satelliteScaleArray[this.satelliteArrayIndex + 2];
        let orbitalRadius = 150 * scale * 1.8;

        let signPicker = Math.random();
        let sign;
        if (signPicker > 0.5) sign = 1;
        else sign = -1;
        //perpendicular
        let landingSpotX = savingSatelliteX;
        let landingSpotY = savingSatelliteY;
        let normOffset = this.normalize(-this.star.x_velocity, -this.star.y_velocity, orbitalRadius / 1.5);
        
        savingSatelliteX += -sign * normOffset[0];
        savingSatelliteY += sign * normOffset[1];

        if (this.killOverlappingSatellites(savingSatelliteX, savingSatelliteY, orbitalRadius) )
        {
            this.createSatellite(savingSatelliteX, savingSatelliteY, this.satelliteArrayIndex + 2, landingSpotX, landingSpotY);
        }

    }

    killOverlappingSatellites(x, y, orbitalRadius, landingX, landingY) {
        //doesn't kill larger satellites
        let satellites = this.satelliteGroup.getChildren();

        for (var i = 0; i < satellites.length; i++) 
        {
            let distToSatelliteOrbital = satellites[i].getDistFromOrbitalTo(x, y);
            let distFromLandingToSatellite = satellites[i].getDistFromSatelliteTo(landingX, landingY);
            if (distFromLandingToSatellite < satellites[i].orbitalRadiusWeighted) return false;
            // console.log(distToSatelliteOrbital+"comp"+orbitalRadiusOfNewSat);
            if ((!satellites[i].isAttachedToStar) && distToSatelliteOrbital < orbitalRadius
                ) {
                  this.killSatellite(satellites[i]);
                } 
        }
        return true;
    }

    updateScreenValues() {
        this.farthestZoomValue = Math.abs(0.2/(this.star.postGrowthScale * 1.5)); //was 0.5+(0.05/this.satelliteScaleArray[this.satelliteArrayIndex + 3]
        this.fullViewportDiameter = 720/this.farthestZoomValue  +
            (150 * this.satelliteScaleArray[this.satelliteArrayIndex + 3]/2); // this is the radius of the largest possible satellite
        this.fullViewportRadius = this.fullViewportDiameter/2;
        this.killDist = 1.5 * Math.sqrt(this.fullViewportRadius * this.fullViewportRadius
                        + this.fullViewportRadius * this.fullViewportRadius); //make this dist from star to corner of screen
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


        //pick the satellite

        let indexMin = this.satelliteArrayIndex - 1;
        let indexMax = this.satelliteArrayIndex + 3;

        let satelliteIndex = Phaser.Math.Between(indexMin, indexMax);

        let radiusOfChosen = 150 * 1.8 * this.satelliteScaleArray[satelliteIndex];
        
        //A
        if (currBox == 0) {
            //pick a random spot in the box
            x1 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + (xOffsetSign * radiusOfChosen);
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + (xOffsetSign * radiusOfChosen) + this.xOffset;

            y1 = this.screenYonLastSatSpawn + (-yOffsetSign * this.fullViewportRadius); //testing 
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius);

        } 
        //B
        else if (currBox == 1)
        {
            x1 = this.screenXonLastSatSpawn + (-xOffsetSign * this.fullViewportRadius); //testing
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius);

            y1 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + (yOffsetSign * radiusOfChosen);
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + (yOffsetSign * radiusOfChosen) + this.yOffset;

        }
        //C
        else
        {
            x1 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + (xOffsetSign * radiusOfChosen);
            x2 = this.screenXonLastSatSpawn + (xOffsetSign * this.fullViewportRadius) + (xOffsetSign * radiusOfChosen) + this.xOffset;

            y1 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + (yOffsetSign * radiusOfChosen);
            y2 = this.screenYonLastSatSpawn + (yOffsetSign * this.fullViewportRadius) + (yOffsetSign * radiusOfChosen) + this.yOffset;

        }

        xSpawn = Math.floor(Math.random() * (x2 - x1)) + x1;
        ySpawn = Math.floor(Math.random() * (y2 - y1)) + y1;

        if(this.checkLocationValidity(xSpawn, ySpawn, satelliteIndex))
        {
            //add the tier as aVol parameter later, which checks the scaleArray and textureArray
            this.createSatellite(xSpawn, ySpawn, satelliteIndex);
            this.screenXonLastSatSpawn = this.screenXcurrent;
            this.screenYonLastSatSpawn = this.screenYcurrent;
            this.checkStraySatellite();
        }
    }

    checkLocationValidity(x, y, satelliteIndex) {
        //if too close to another satellite, return false
        let satellites = this.satelliteGroup.getChildren();
        let orbitalRadiusOfNewSat = 
            150 * this.satelliteScaleArray[satelliteIndex] * 1.8;


        for (var i = 0; i < satellites.length; i++) 
        {
            let distToSatelliteOrbital = satellites[i].getDistFromOrbitalTo(x, y);
            // console.log(distToSatelliteOrbital+"comp"+orbitalRadiusOfNewSat);
            if ((!satellites[i].isAttachedToStar) && distToSatelliteOrbital < orbitalRadiusOfNewSat * 1.25
                ) {
                  return false;
                } 
        }
        return true;
    }

    createSatellite(x, y, satelliteIndex) {
        // let scale = scaleArray[tier]; 
        // let texture = textureArray[tier];

        let satellite = new Satellite(
            this, x, y, 
            this.satelliteScaleArray[satelliteIndex], 
            this.satelliteTextureArray[satelliteIndex],
            satelliteIndex
        );

    }

    checkStraySatellite() {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            if (!satellites[i].isAttachedToStar) {
                if (satellites[i].getDistFromSatelliteTo(this.star.x, this.star.y) > this.killDist) {
                    this.killSatellite(satellites[i]);
                }
            }
        }
    }

    killAllSatellites() {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            if (!satellites[i].hasAttachedToStar) {
                this.killSatellite(satellites[i]);
            }
        }
    }

    killHigherTierSatellites() {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            if (!satellites[i].hasAttachedToStar) {
                this.killSatellite(satellites[i]);
            }
        }
    }

    killOldSatellites() {
        //use this with pre-update screen sizes
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            if (!satellites[i].isAttachedToStar) {
                if ( (satellites[i].getDistFromSatelliteTo(this.star.x, this.star.y) 
                    > this.fullViewportRadius + satellites[i].radiusWeighted)
                || (satellites[i].Scale < this.satelliteScaleArray[this.satelliteArrayIndex - 1]) && !satellites[i].hasAttachedToStar)  {
                    this.killSatellite(satellites[i]);
                }
            }
        }
    }

    killSatellite(satellite) {
        if (satellite.okayToKill);
            satellite.orbitalBody.setEnable(true);
            satellite.orbitalBody.setEnable(false);
            satellite.isAlive = false;
            satellite.orbitalBody.destroy();
            satellite.orbital.destroy();
            satellite.destroy();

    }

    updateSatellites(starScale) {
        let satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
            satellites[i].updateOrbital(starScale);
        }
    }
    
}   