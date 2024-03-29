class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    preload() {
        

    }

    create() {

        //anims
        this.a_starPC_hit = this.anims.create({
            key: 'starPC_hit',
            frames: this.anims.generateFrameNumbers('starPC_hit'),
            frameRate: 2,
            repeat: 999
        });
        this.a_starPC_twirl = this.anims.create({
            key: 'starPC_twirl',
            frames: this.anims.generateFrameNumbers('starPC_twirl'),
            frameRate: 13,
            repeat: 0
        });
        this.a_starPC_wink = this.anims.create({
            key: 'starPC_wink',
            frames: this.anims.generateFrameNumbers('starPC_wink'),
            frameRate: 2,
            repeat: 999
        });
        this.a_starPC_normal = this.anims.create({
            key: 'starPC_normal',
            frames: this.anims.generateFrameNumbers('starPC_normal'),
            frameRate: 2,
            repeat: 999
        });
        this.a_starPC_powerUp_1 = this.anims.create({
            key: 'starPC_powerUp_1',
            frames: this.anims.generateFrameNumbers('starPC_powerUp_1'),
            frameRate: 7,
            repeat: 2
        });
        this.a_starPC_powerUp_2 = this.anims.create({
            key: 'starPC_powerUp_2',
            frames: this.anims.generateFrameNumbers('starPC_powerUp_2'),
            frameRate: 10,
            repeat: 1
        });
        this.a_starPC_happy = this.anims.create({
            key: 'starPC_happy',
            frames: this.anims.generateFrameNumbers('starPC_happy'),
            frameRate: 2,
            repeat: 999
        });
        this.a_starPC_orbit = this.anims.create({
            key: 'starPC_orbit',
            frames: this.anims.generateFrameNumbers('starPC_orbit'),
            frameRate: 2,
            repeat: 999
        });
        this.a_starPC_orbital = this.anims.create({
            key: 'starPC_orbital',
            frames: this.anims.generateFrameNumbers('starPC_orbital'),
            frameRate: 10,
            repeat: 999
        });


        this.physics.world.setFPS(60);

        this.satelliteTextureArray = [
        "debris_apple.png", "debris_ring.png", "debris_pillbottle.png", "debris_banana.png", "debris_donut.png", "debris_tp.png", "debris_sodacan.png", "debris_yarnball.png","debris_rubberduck.png","debris_shoe.png","debris_newspaper.png","debris_fish.png","debris_hotdog.png","debris_hat.png","debris_meat.png","debris_toybunny.png","debris_balloon.png","debris_basketball.png","debris_beachball.png","debris_fishbowl.png","debris_kite.png","debris_computer.png","debris_umbrella.png","debris_couch.png","debris_dumpster.png","debris_rocket.png" ];
        //I think scaling should be d = a + c and have the largest object in tier be 3 ahead. from newspaper i manually balance it
        this.satelliteScaleArray = [0.24,     0.24,      0.4,             0.6,               0.80,            1,                 1.2,                  1.6,                  2.0,                       2.5,                3.2,                4.0,              4.8,                 5.7,             6.6,             6.6,                  7.8,                 9.0,                     10.2,                  10.6,                  11.1,             12.5,                 14.1,                 15.6,             17.4,                  30.1];
        this.satelliteArrayIndex = 3; //start at size banana but cant go lower, can see apple, banana, soda, and shoe. scaling is adding last two together. updated upto kite

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Star
        this.p_scale = 0.25;

        let starSpawnX = canvas_width/2 + 10;
        let starSpawnY = canvas_width/2 - 320;
        this.star = new Star(
            this, starSpawnX, starSpawnY, this.p_scale, "Star"
        );
        
        
        this.star.anims.play(this.a_starPC_normal);
        this.star.startSpeeding();
        this.star.zoomTimer = 75;
        
        this.satelliteGroup = this.add.group({
            runChildUpdate: true
        });

        this.backgroundStarGroup = this.add.group({
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
        
        this.universalScalar = this.star.Scale / (this.star.Scale + (this.star.totalScaleGained)/2); //this affects the satellites and backgroundstars. decreases as the star grows "bigger"
        this.lastUniversalScalar = this.universalScalar;
        // this.star.setCameraToStar(this.star.Scale);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXAMPLE OF CREATING A NEW PHASER OBJECT
        // this.panFX = new PanFX(this, this.cameras.main);
        // this.panFX.start(0,0, 2000, 'Linear', true);
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        //if you want sometihng that is fixed to the camera, like a health bar,
        //use this.object.setScrollFactor(0); you can also do parallax like this


        this.cameras.main.setZoom(Math.abs(0.2/(0.15*0.9-(this.satelliteArrayIndex * 0.01))));
        this.farthestZoomValue = Math.abs(0.15/(this.star.postGrowthScale *1.5)); //was 0.2, didnt seem to break anythinf but i might be wrong
        this.zoomValue = this.farthestZoomValue;
        //was 0.5+(0.05/this.satelliteScaleArray[this.satelliteArrayIndex + 3]
        //this needs to be based on the zoomout of the highest possible object in the current tier of scale
        // canvas_width * 
        this.fullViewportDiameter = 1020 + (600 * this.satelliteScaleArray[this.satelliteArrayIndex + 5] * this.universalScalar * 2.0 * 0.5);// this is the radius of the largest possible satellite
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
        this.strandedTimer = 120;
        this.strandedEventTime = 120; //3 seconds
        this.strandedEventTimeLoop = 120 + 30 * this.satelliteArrayIndex;
        this.resetEventTime = 360; //emergency bug bypass
        this.isStrandedTicking = true;
////////////////////BACKGROUND
        // this.bgSize = Math.abs(1020 / (0.2/(this.star.postGrowthScale * 1.5)));
        // this.bg = this.add.tileSprite(0, 0, this.bgSize, this.bgSize, 'bg').setScrollFactor(0); //this fixes it to the camera
        // // this.bg.setOrigin(0.5,0);9 this.star.x-this.star.radiusWeighted/2
        // this.bg.setOrigin(0.3,0.3);
        // // this.bgScale = (1/(0.2/(this.star.postGrowthScale *1.5)));
        // // this.bg.setScale(this.bgScale);

        // // this.bgX = this.star.x/2-this.star.radiusWeighted;
        // console.log(this.bgSize);
        // // console.log(bgsize)
        // // this.bg.setSize(1020,1020);//(this.killDist, this.killDist);
        // // change size after updating screen values in the grow and shrink update, and then adjust the position. what should the size actually be?

        // this.updateBackground = false;
        // this.backgroundScrollX = 0;
        // this.backgroundScrollY = 0;
        // this.counter = 1;
        // //for position of bg: offset by subbing x each growth by the diff in x growth, do same for y
        // this.lastBgX = this.bgX;
        // this.lastBgSize = this.bgSize;
        // this.bgSizeDiff = 1;
/////////////////////////////////
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/color/
        this.colorIndex = 1;
        this.isColorIndexIncreasing = true;
        this.backgroundColorArray = ['#3c249c', '#8b4e95', '#dac0ff', '#9f81e1', '#6a5cc3', '#5b4cb1'];
        this.color1Value = this.backgroundColorArray[0];
        this.color2Value = this.backgroundColorArray[3];
        this.color1Object = Phaser.Display.Color.HexStringToColor(this.color1Value);
        this.color2Object = Phaser.Display.Color.HexStringToColor(this.color2Value);
        this.backgroundStarSpdX = 0;
        this.backgroundStarSpdY = 0;

//////SIZE///
        this.lowestOrbitalRadius = 0;
        this.killingSatellites = false;

        this.flashBox = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, 2000, 2000, 0xFFFFFF).setScrollFactor(0);
        this.flashBox.setDepth(10);
        this.flashBox.setVisible(false);

        this.s_subtleOrbit = this.sound.add('s_subtleOrbit', {volume: 2});

//////TEXT////

        let fontStyle = { font: "20px Garamond", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: 200, align: "center"};
        this.instructionsText = this.add.text(this.star.x - 182, this.star.y + 450, "Hold SPACE to Orbit & Zoom Out", fontStyle).setScrollFactor(0);
        this.instructionsText.setDepth(11);
    
//////SHADOW EFFECT///
        this.shadowStarGroup = this.add.group({
            runChildUpdate: true
        });

        this.shadowStarTimer = 1;
        this.shadowStarRate = 6;

        // this.testBox = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, 100, 100, 0xFFFFFF);
        // this.testBox.setDepth(13);

        this.gameBegan = false;

    }

    update() {

        // // console.log(this.star.body.deltaXFinal() +" " +this.star.body.deltaYFinal());

        let hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.color1Object, this.color2Object, 100, this.colorIndex);
        this.cameras.main.setBackgroundColor(hexColor);
        // console.log(hexColor);
        this.changeBackgroundColor();


        // if(keySPACE.isDown) this.cameras.main.zoomTo( 0.3, 1000, 'Sine.easeInOut');
        //update bg size
        // this.bg.setSize(this.bgSize+this.counter, this.bgSize);

        //readjust position
        // this.bgSizeDiff = this.bgSize - this.lastBgSize;
        // this.lastBgSize = this.bgSize;
        // this.bg.x -= this.bgSizeDiff/2;
        // this.bg.y -= this.bgSizeDiff;

        // this.bgSize = (this.counter);
        // this.counter += 0.1;
        // this.bg.setSize(this.bgSize, 200+this.bgScale);

        // this.sizeDiff = this.bgSize - this.lastBgSize;
        // this.lastBgSize = this.bgSize; 
        // this.bg.x -= this.sizeDiffX/2;
        // this.lastBgX = this.bg.x;
        // console.log(this.game.loop.actualFps);
        //dont do a hard calc every frame
        // if (!this.updateBackground) 
        // {
        //     this.bg.tilePositionX += this.backgroundScrollX;
        //     this.bg.tilePositionY += this.backgroundScrollY;
        // }

        // this.bg.x = this.star.x;
        // this.bg.y = this.star.y;

        this.star.update();

        //procedural generation of satellites
        this.screenXcurrent = this.star.x;
        this.screenYcurrent = this.star.y;

        this.calculateScreenOffset();

        if (this.offsetVolume > this.volThreshold && this.star.cameraSetBool && this.gameBegan) {
            this.generateSatellite();
        }

        this.resetTimer++;
        if (this.isStrandedTicking) this.strandedTimer ++;
        if (this.strandedTimer > this.strandedEventTime && this.gameBegan) {
            this.resetTimer = 0;
            this.strandedEventTimeLoop = 120 + 30 * this.satelliteArrayIndex;
            this.strandedEventTime = this.strandedEventTimeLoop;
            this.saveStrandedStar();
            this.star.orbitalEntered = false;
        }

        if (this.resetTimer > this.resetEventTime) 
        {
            this.resetTimer = 0;
            this.star.orbitalEntered = false;
            this.star.isBouncing = false;
            this.isStrandedTicking = true;
            this.star.cameraSetBool = true;
        }

        this.fadeFont();

        this.addShadowStar();
    }

    addShadowStar() {

        this.shadowStarTimer++;

            if (this.shadowStarTimer % this.shadowStarRate == 0)
            {
                let shadowStar = new Shadow_Star(this, this.star.x, this.star.y, this.star.anims.currentAnim.key, 
                                                this.star.Scale, this.star.rotation, this.star.anims.currentAnim.frame);

                this.shadowStarGroup.add(shadowStar);

                this.shadowStarTimer = 1;
            }
    }

    updateUniversalScalar() {
        this.lastUniversalScalar = this.universalScalar;
        this.universalScalar = this.star.Scale / (this.star.Scale + (this.star.totalScaleGained)/2); //this affects the satellites and backgroundstars. decreases as the star grows "bigger"
    }

    fadeFont() {

        if (this.isFadingFont) {
            this.gameBegan = true;
            if (this.instructionsText.alpha > 0) {
                this.instructionsText.alpha -= 0.1;
            }
        } 
    }

    triggerFlash() {
        this.time.delayedCall(333, () => {
            this.flashBox.setVisible(false);
            this.cameras.main.flash(500);
        });
    }

    changeBackgroundColor() {
        if (this.isColorIndexIncreasing) 
        {
            this.colorIndex += 0.3;
            
            if (this.colorIndex >= 100 ) {
                this.isColorIndexIncreasing = false;
                this.setBackgroundColor1();
            }
        }
        else
        {
            this.colorIndex -= 0.3;
            
            if (this.colorIndex <= 0 ) {
                this.isColorIndexIncreasing = true;
                this.setBackgroundColor2();
            }
        }
    }

    setBackgroundColor1() {
        let picker = Math.floor(Math.random() * this.backgroundColorArray.length);

        while (this.color1Value == this.backgroundColorArray[picker]) {
            picker = Math.floor(Math.random() * this.backgroundColorArray.length);
        }
        
        this.color1Object = Phaser.Display.Color.HexStringToColor(this.backgroundColorArray[picker]);
    }

    setBackgroundColor2() {
        let picker = Math.floor(Math.random() * this.backgroundColorArray.length);

        while (this.color2Value == this.backgroundColorArray[picker]) {
            picker = Math.floor(Math.random() * this.backgroundColorArray.length);
        }
        
        this.color2Object = Phaser.Display.Color.HexStringToColor(this.backgroundColorArray[picker]);
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

        if (!this.star.orbitalEntered) this.star.cameraSetBool = true;

        // let the final in normalize() params denote how far the satellite is from the star
        let normVel =  this.normalize(this.star.x_velocity, this.star.y_velocity, this.killDist-1);
        let savingSatelliteX = this.star.x + normVel[0];
        let savingSatelliteY = this.star.y + normVel[1];

        //now offset it on either side of the star
        let scale = this.satelliteScaleArray[this.satelliteArrayIndex + 2] * this.universalScalar;
        let orbitalRadius = 300 * scale * 2.0 * 0.5;

        let signPicker = Math.random();
        let sign;
        if (signPicker > 0.5) sign = 1;
        else sign = -1;
        //perpendicular
        let landingSpotX = savingSatelliteX;
        let landingSpotY = savingSatelliteY;
        let normOffset = this.normalize(-this.star.x_velocity, -this.star.y_velocity, orbitalRadius*4);
        
        savingSatelliteX += -sign * normOffset[0];
        savingSatelliteY += sign * normOffset[1];

        if (this.checkLocationValidity(savingSatelliteX, savingSatelliteY, this.satelliteArrayIndex+2 ))
        {
            
            this.createSatellite(savingSatelliteX, savingSatelliteY, this.satelliteArrayIndex + 2, landingSpotX, landingSpotY);
            this.strandedTimer = 0;
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
        // this.farthestZoomValue = Math.abs(0.2/(this.star.postGrowthScale * 1.5)); //was 0.5+(0.05/this.satelliteScaleArray[this.satelliteArrayIndex + 3]
        // this.fullViewportDiameter = 1020 + (600 * this.satelliteScaleArray[this.satelliteArrayIndex + 5] * this.universalScalar * 2.0 * 0.5); // this is the radius of the largest possible satellite
        // this.fullViewportRadius = this.fullViewportDiameter/2;
        this.killDist = 1.5 * Math.sqrt((this.fullViewportRadius * this.fullViewportRadius)
                        + (this.fullViewportRadius * this.fullViewportRadius)); //make this dist from star to corner of screen

        // //update bg size
        // this.bgSize = 1020/this.farthestZoomValue;
        // this.bg.setSize(this.bgSize, this.bgSize);

        // //readjust position
        // this.bgSizeDiff = this.bgSize - this.lastBgSize;
        // let bgOffset = this.bgSizeDiff/2;
        // this.bg.x -= bgOffset;
        // this.bg.y -= bgOffset;
        // this.bg.tilePositionX -= bgOffset;
        // this.bg.tilePositionY -= bgOffset;
        
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

        let indexMin = this.satelliteArrayIndex - 3;
        let indexMax = this.satelliteArrayIndex + 4;

        let satelliteIndex = Phaser.Math.Between(indexMin, indexMax);

        let radiusOfChosen = 150 * 2.0 * this.satelliteScaleArray[satelliteIndex] * this.universalScalar;
        
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

            let backgroundStarX = Math.floor(Math.random() * (x2 - x1)) + x1;
            let backgroundStarY = Math.floor(Math.random() * (y2 - y1)) + y1;

            let backgroundStarScale = (Math.random() * this.star.Scale + this.star.Scale/2 + 0.01) * (1 - 0.02 * this.satelliteArrayIndex);

            if(backgroundStarX != undefined && backgroundStarY != undefined )
                this.createBackgroundStar(backgroundStarX, backgroundStarY, "BackgroundStar", backgroundStarScale);

            backgroundStarX = Math.floor(Math.random() * (x2 - x1)) + x1;
            backgroundStarY = Math.floor(Math.random() * (y2 - y1)) + y1;

            backgroundStarScale = Math.random() * this.star.Scale + this.star.Scale/2 + 0.01;

            this.createBackgroundStar(backgroundStarX, backgroundStarY, "BackgroundStar", backgroundStarScale);

            backgroundStarX = Math.floor(Math.random() * (x2 - x1)) + x1;
            backgroundStarY = Math.floor(Math.random() * (y2 - y1)) + y1;

            backgroundStarScale = Math.random() * this.star.Scale + this.star.Scale/2 + 0.01;

            this.createBackgroundStar(backgroundStarX, backgroundStarY, "BackgroundStar", backgroundStarScale);

            this.screenXonLastSatSpawn = this.screenXcurrent;
            this.screenYonLastSatSpawn = this.screenYcurrent;

            this.checkStraySatellite();
            // this.checkStrayBackgroundStars();
        }
    }

    createBackgroundStar(backgroundStarX, backgroundStarY, texture, scale) {
        let backgroundStar = new BackgroundStar(
            this, backgroundStarX, backgroundStarY, texture, scale
        );

        this.backgroundStarGroup.add(backgroundStar);

    }

    checkLocationValidity(x, y, satelliteIndex) {
        //if too close to another satellite, return false
        let satellites = this.satelliteGroup.getChildren();
        let orbitalRadiusOfNewSat = 
            150 * this.satelliteScaleArray[satelliteIndex] * 2.0 * this.universalScalar;


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

        this.satelliteGroup.add(satellite);

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
        // let satellites = this.satelliteGroup.getChildren();
        // for (var i = 0; i < satellites.length; i++) 
        // {
        //     if (!satellites[i].hasAttachedToStar) {
        //         this.killSatellite(satellites[i]);
        //     }
        // }
        this.killingSatellites = true;
        this.time.delayedCall(200, () => {
            this.killingSatellites = false;
            this.saveStrandedStar();
        });
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
        satellites = this.satelliteGroup.getChildren();
        for (var i = 0; i < satellites.length; i++) 
        {
        //    console.log(satellites[i].hasAttachedToStar);
            
        }
    }

    killSatellite(satellite) {
        if (satellite.okayToKill) {
            satellite.orbitalBody.setEnable(true);
            satellite.orbitalBody.setEnable(false);
            satellite.isAlive = false;
            satellite.orbitalBody.destroy();
            satellite.orbital.destroy();
            satellite.destroy();
        }

    }

    updateSatellites(starScale, sizeDir) {
        let satellites = this.satelliteGroup.getChildren();

        for (var i = 0; i < satellites.length; i++) 
        {
            // this.findLowestOrbitalRadius();
            
            satellites[i].preChangeSizeGradually(sizeDir);
        }
        
        let backgroundStars = this.backgroundStarGroup.getChildren();
    
        for (var i = 0; i < backgroundStars.length; i++) 
        {
            backgroundStars[i].preChangeSizeGradually(sizeDir);
        }
    }

    // findLowestOrbitalRadius() {
    //     let scale = this.satelliteScaleArray[this.satelliteArrayIndex + 4] * this.universalScalar;
    //     let orbitalRadius = 300;
    //     this.lowestOrbitalRadius = orbitalRadius * scale * 1.8 * 0.5;
    // }
    
    
}   