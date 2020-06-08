class Star extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        //update this on growth/hit
        
        this.setDepth(6); //behind bigger satellites, ahead of smaller
        //Scale measures orbital scale
        this.Scale = scale;
        this.defaultScale = 0.2;
        this.orbitalScale = this.Scale;
        this.radius = 75;
        this.postGrowthScale = this.Scale;

        this.setCircle(this.radius, 0, 0);
        this.setScale(scale); //Scales hitbox and sprite

        this.radiusWeighted = this.radius * this.Scale;
        this.ScaleScaling = 0.05;

        this.x_velocity = 0;
        this.y_velocity = 0;
        this.x_acceleration = 0;
        this.y_acceleration = 0;
        this.trajectory = 0;
        this.lastTrajectory = 0;

        //to prevent star from using overlapping orbitals
        this.orbitalEntered = false;
        this.isBouncing = false;

        this.pastSatellitesDist = 0;

        this.speedMod = 170 * Math.pow(1+this.postGrowthScale,1.4);

        this.satellitesCollected = 0;

        this.satelliteStack = [];
        this.satelliteScaleStack = [];   
        this.cameraSetBool = true;
        this.isSpeeding = true;
        this.justStartedSpeeding = false; //when true, the speedingMod will decrease to miniumum, to simulate a burst of speed
        this.justLeftOrbit = false; //when true, the speedingMod will decrease to miniumum, to simulate a burst of speed
        this.maxSpeedingMod = 2.1;
        this.minSpeedingMod = 1.0;
        this.currSpeedingMod = 2;
        this.currSpeedingDeacceleration = 0.01; //per frame
        this.canLoseSatellite = true;

        this.isSmoothOrbiting = false;

        this.totalScaleGained = 0;

        this.scene.backgroundStarSpdX = this.x_velocity/500;
        this.scene.backgroundStarSpdY = this.y_velocity/500;
        this.rotation = 1.5*Math.PI + 0.01;
        this.lastCamWasZoomedIn = true;
        this.flickerCounter = 1;
        this.totalFlicks = 0;

        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "StarOrbital"
        );
        this.orbital.anims.play(this.scene.a_starPC_orbital);

        // this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 150;
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale;

        this.orbital.setImmovable(true);
        this.orbital.setDepth(5);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(this.orbitalRadius-20, 20, 20);
        this.orbital.setScale(this.Scale*1.2);
        // this.orbital.body.setScale(this.Scale);

        this.pointerLineLength = 1100;
        this.pointerLineWidth = 100;
        this.pointerLine = this.scene.physics.add.sprite(this.x, this.y, 'pointerLine').setOrigin(0.5, 0);
        this.pointerLine.scale = this.Scale;
        this.pointerLine.setDepth(4);
        this.pointerLine.alpha = 0;
        

        this.fadeInOrbital = false;
        this.fadeOutOrbital = false;
        this.fadeRate = 0.1;

        this.zoomTimerThresh = 75;

        this.camDirFromSatX = 0;
        this.camDirFromSatY = 0;
        this.camDirFromSatXDropoff = 0;
        this.camDirFromSatYDropoff = 0;
        this.camDirOffsetCounter = 1;
        this.camDirOffsetThresh = 60;

        // this.scene.saveStrandedStar();
    }

    update() {

        //error checking, make this better later
        if (!this.isSmoothOrbiting)
        {
            if (this.x_velocity == 0) this.x_velocity = 0.1;
            if (this.y_velocity == 0) this.y_velocity = 1;

            this.x_velocity += this.x_acceleration;
            this.y_velocity += this.y_acceleration;

            this.normalizeVelocity();

            if (this.isSpeeding) 
            {
                if (this.currSpeedingMod > this.minSpeedingMod) {
                    this.currSpeedingMod -= this.currSpeedingDeacceleration;
                } 
                else {
                    this.isSpeeding = false;
                    this.justStartedSpeeding = false;
                    // this.anims.play(this.scene.a_starPC_wink);
                }

                this.x_velocity *= this.speedMod * this.currSpeedingMod;
                this.y_velocity *= this.speedMod * this.currSpeedingMod;
            } 
            else 
            {
                this.x_velocity *= this.speedMod;
                this.y_velocity *= this.speedMod; 
            }

            this.scene.backgroundStarSpdX = this.x_velocity/500;
            this.scene.backgroundStarSpdY = this.y_velocity/500;

            this.setVelocity(this.x_velocity, this.y_velocity);
            this.orbital.setVelocity(this.x_velocity, this.y_velocity);


            this.findTrajectory();
            this.rotation += this.trajectory - this.lastTrajectory;
            
            this.resetAcceleration();

        }
        else
        {

            // this.setVelocity(0,0); //this is on for x,  y
            this.x_velocity += this.x_acceleration;
            this.y_velocity += this.y_acceleration; 

            this.normalizeVelocity();

            this.x_velocity *= this.speedMod;
            this.y_velocity *= this.speedMod;

            this.findTrajectory();
            this.rotation += this.trajectory - this.lastTrajectory;


            this.resetAcceleration();

            this.scene.backgroundStarSpdX = 0;
            this.scene.backgroundStarSpdY = 0;

            this.orbital.x = this.x;
            this.orbital.y = this.y;
        }

        if (this.cameraSetBool) this.setCameraToStar();
                // this.orbital.x = this.x;
        // this.orbital.y = this.y;


        this.pointerLine.setVelocity(this.x_velocity, this.y_velocity);

        this.updatePointerLine();

        this.handleOrbitalFadeEffect();

        this.flickerSize();

        this.activateStartFollowing();

    }

    handleOrbitalFadeEffect() {
        if (this.fadeInOrbital) {

            if (this.orbital.alpha <= 0.94){
                this.orbital.alpha += this.fadeRate; 
                this.pointerLine.alpha -= this.fadeRate;
            }
            else
            {
                this.pointerLine.alpha = 0;
                this.orbital.alpha = 1;
                this.fadeInOrbital = false;
            }
        }
        else if (this.fadeOutOrbital) {
            if (this.orbital.alpha >= 0.06){
                this.orbital.alpha -= this.fadeRate; 
                this.pointerLine.alpha += this.fadeRate;
            }
            else
            {
                this.pointerLine.alpha = 1;
                this.orbital.alpha = 0.00;
                this.fadeOutOrbital = false;
            }

        }
    }

    flickerSize() {

            // if(this.isFlickering && this.totalFlicks <= 5) {
                
            //     console.log(this.flickerCounter % 10);

            //     if (this.flickerCounter % 100 == 0)
            //     {
            //         if (this.isNormalSize) 
            //         {
            //             this.setScale(this.Scale * 1.4);
            //             this.isNormalSize = false;
            //             this.flickerCounter = 1;
            //             this.totalFlicks++;

            //         }
            //         else
            //             this.setNormalSize();
            //             this.flickerCounter = 1;
            //             this.totalFlicks++;

            //     }
                
            //     this.flickerCounter++;
                
            // }
            // else
            // {
            //     this.totalFlicks = 0;
            //     this.isFlickering = false;
            // }
    }

    setNormalSize() {
        this.setScale(this.Scale);
        this.isNormalSize = true;
    }

    chooseBaseAnim() {
        let picker = Math.random();
        if (picker > 0.66)
            this.anims.chain(this.scene.a_starPC_normal);
        else if (picker > 0.33)
            this.anims.chain(this.scene.a_starPC_happy);
        else 
            this.anims.chain(this.scene.a_starPC_wink);
    }

    updateBackgroundScroll() {
        this.scene.backgroundScrollX = this.x_velocity / 500;
        this.scene.backgroundScrollY = this.y_velocity / 500;
    }

    updatePointerLine() 
    {
        this.pointerLine.rotation = this.trajectory + Math.PI/2;
        
    }

    updatePointerLineSize() 
    {
        // this.pointerLine.scale = 1/Math.abs(0.2/(this.postGrowthScale * 1.5));
    }

    startSpeeding() {
        this.isSpeeding = true;
        this.justStartedSpeeding = true;
        this.currSpeedingMod = this.maxSpeedingMod;
    }

    changeVelocity(x, y) {
        this.x_velocity = x;
        this.y_velocity = y;
    }

    addAcceleration(x, y) {
        this.x_acceleration += x;
        this.y_acceleration += y;
    }

    resetAcceleration() {
        this.x_acceleration = 0;
        this.y_acceleration = 0;
    }

    normalizeVelocity() {
        if (this.x_velocity * this.y_velocity != 0) 
        {  
            let velVectorLength = Math.sqrt(
                (this.x_velocity * this.x_velocity)
                +
                (this.y_velocity * this.y_velocity)
            );  

            this.x_velocity /= velVectorLength;
            this.y_velocity /= velVectorLength;
        }
    }

    findTrajectory() {
        this.lastTrajectory = this.trajectory;
        this.trajectory = Math.atan(
            (this.y_velocity)
            /
            (this.x_velocity)
        );
        if (this.x_velocity >= 0) this.trajectory += Math.PI;

        // console.log((this.trajectory * 180 / Math.PI));
    }

    //if original satellite isnt referenced, try pushing into stack in satellite.js
    growUpdate(satellite, satelliteScale) {
        this.scene.star.canLoseSatellite = true;
        this.satellitesCollected++;
        this.satelliteStack.push(satellite);

        let scaleToAdd;
        if (satelliteScale > 6.6) scaleToAdd = satelliteScale/4;
            else scaleToAdd = satelliteScale/2;

        this.satelliteScaleStack.push(scaleToAdd);
        // this.postGrowthScale = this.Scale + satelliteScale;
        this.totalScaleGained += scaleToAdd;

        this.scene.updateUniversalScalar();

        // if (!this.orbitalEntered) this.setCameraToStar(this.Scale);//(this.Scale + satelliteScale);

        // this.updateSpeed();
        while (this.Scale >= this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex] * this.scene.universalScalar 
            && this.scene.satelliteArrayIndex < this.scene.satelliteScaleArray.length - 5) 
        {
            // console.log("growing to "+this.scene.satelliteArrayIndex);
            this.scene.satelliteArrayIndex++;
            
        }
        this.isFlickering = true;
        this.anims.play(this.scene.a_starPC_powerUp_2);
        this.scene.sound.play('s_grow', {volume: 1});
        this.scene.star.chooseBaseAnim();
        this.scene.updateScreenValues();
        // this.updateSpeed();
        this.scene.updateSatellites(this.Scale, 1); //is it + satelliteScale
    }

    shrinkUpdate(satX, satY) {
        
        if (this.satellitesCollected > 0) this.satellitesCollected--;
        this.bounce(satX, satY);
        if(this.canLoseSatellite && this.satelliteStack.length > 0)
        {
            let lostSatellite = this.satelliteStack.pop();
            lostSatellite.preScatter();
            lostSatellite.isOrbitingStar = false;
            // this.Scale -= this.satelliteScaleStack.pop();
            // if (this.Scale < this.defaultScale) this.Scale = this.defaultScale;
            // this.postGrowthScale = this.Scale;
            this.updateSize();
            // this.scene.universalScalar /= this.satelliteScaleStack.pop();
            this.totalScaleGained -= this.satelliteScaleStack.pop();
            
            this.scene.updateUniversalScalar();

            //this while loop was outside of this if before, if it crashes put i tback
            while (this.Scale < this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex] * this.scene.universalScalar 
                && this.scene.satelliteArrayIndex > 3) 
            {  
                this.scene.satelliteArrayIndex--;
                //  console.log("shrinking index to "+this.scene.satelliteArrayIndex);
    
                
                this.updateSpeed();
                //do anim here and delay kill                

                this.scene.time.delayedCall(500, () => { 

                    this.orbitalEntered = false;
                    //  this.scene.cameras.main.flash(3000);
                    this.orbitalAccelMod = this.orbitalAccelModDefault;
                    this.setCameraToStar(this.scene.star.Scale);
                    this.updateBackgroundScroll();
                    this.cameraSetBool = true;
                });
            }
            this.scene.updateScreenValues();

            this.scene.updateSatellites(this.Scale, 0);
        }
        this.anims.play(this.scene.a_starPC_hit);
        this.anims.chain(this.scene.a_starPC_hit);
        this.scene.star.chooseBaseAnim();
        this.canLoseSatellite = false;
        this.scene.killAllSatellites();
        this.orbitalEntered = false;
        this.isBouncing = false;
        this.setCameraToStar(this.Scale);
        this.startSpeeding();
        this.scene.s_subtleOrbit.stop();
        this.scene.sound.play('s_hit', {volume: 1});
        this.scene.sound.play('s_blowup', {volume: 1});
        this.zoomTimer = 75;
        this.orbital.alpha = 1;
        this.pointerLine.alpha = 0;


        // console.log("index is now " + this.scene.satelliteArrayIndex);
        
        //if scale goes lower than the current object scale at index, drop index by 1 and check again
        // this.updatePointerLineSize();
        
    }

    bounce(satX, satY) {
        let reflectingLineX = satX - this.x;
        let reflectingLineY = satY - this.y;
        let vdotn = this.x_velocity * reflectingLineX +
            this.y_velocity * reflectingLineY;
        let ndotn = reflectingLineX * reflectingLineX +
            reflectingLineY * reflectingLineY;
        let projX = (vdotn / ndotn) * reflectingLineX;
        let projY = (vdotn / ndotn) * reflectingLineY;

        let reflectionX = this.x_velocity - 2 * (projX);
        let reflectionY = this.y_velocity - 2 * (projY);

        this.x_velocity = reflectionX;
        this.y_velocity = reflectionY;

        this.isBouncing = true;
        this.scene.strandedEventTime = 120;

    }

    updateOrbital() {
        this.orbital.setScale(this.orbitalScale);
    }

    updateSpeed() {
        this.speedMod = 170 * Math.pow(1+this.postGrowthScale,1.4);
    }

    updateSize() {
        this.radiusWeighted = this.radius * this.Scale;
        this.setScale(this.Scale);
    }

    setCameraToStar(postScale) {
        //do this every frame, when camerasetbool is true
        
        if ((keySPACE.isDown && !this.lastCamWasZoomedIn) || (this.justLeftOrbit && keySPACE.isDown)) {

            this.scene.isFadingFont = true;
            this.scene.cameras.main.panEffect.reset(); //this doesn't work apparently
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
            //this.scene.cameras.main.startFollow(this, true, 1, 1); 
    
            this.cameraSetBool = true;
    
            this.scene.cameras.main.zoomEffect.reset();
            this.scene.zoomValue = Math.abs(0.2/(0.4*0.9));
            this.scene.cameras.main.zoomTo(Math.abs(0.2/(0.4*0.9)), 1000, 'Sine.easeInOut');


            this.lastCamWasZoomedIn = true;
            this.zoomTimer = 0;
            this.justLeftOrbit = false;
        }
        else if ((!keySPACE.isDown && this.lastCamWasZoomedIn || (this.justLeftOrbit && !keySPACE.isDown )) ){
                
            this.zoomTimer ++;
            // this.justLeftOrbit = false;

            if (this.zoomTimer > this.zoomTimerThresh && this.lastCamWasZoomedIn)  {
                this.scene.cameras.main.panEffect.reset(); //this doesn't work apparently
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
                //instead turn on a bool that turns on an update() func that does startfollow w the offset
                //this.scene.cameras.main.startFollow(this, true, 1, 1); //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/
         
                this.cameraSetBool = true;
                
                this.scene.cameras.main.zoomEffect.reset();
                this.scene.zoomValue = Math.abs(0.2/(0.15*0.9));
                this.scene.cameras.main.zoomTo(Math.abs(0.2/(0.15*0.9)), 1500, 'Sine.easeInOut');

                this.lastCamWasZoomedIn = false;
            }

        //.pan(x, y, duration, ease)
        // this.scene.cameras.main.pan(this.x, this.y, 1000, 'Power2');
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //ACCESSING SPECIFIC MEMBERS/METHODS FROM A PHASER CLASS, 
        //https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html#shakeEffect__anchor
        }
    }

    activateStartFollowing() {
        //needa reset camdirFormsatX when entering another satellite
        if (this.cameraSetBool) {
            if (this.camDirOffsetCounter <= this.camDirOffsetThresh){
                this.camDirFromSatX -= this.camDirFromSatXDropoff;
                this.camDirFromSatY -= this.camDirFromSatYDropoff;
                this.camDirOffsetCounter++;
            }
            this.scene.cameras.main.startFollow(this, true, 1, 1, this.camDirFromSatX, this.camDirFromSatY); //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/
        }
    }
}