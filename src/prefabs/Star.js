class Star extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        //update this on growth/hit
        
        this.setDepth(5); //behind bigger satellites, ahead of smaller
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

        this.speedMod = 160 * Math.pow(1+this.postGrowthScale,1.4);

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

        // this.pointerLineLength = 1100;
        // this.pointerLineWidth = 100;
        // this.pointerLine = this.scene.physics.add.sprite(this.x - this.pointerlineWidth, this.y + this.pointerlineLength, 'pointerLine').setOrigin(0.5, 0);
        // this.pointerLine.scale = 1/Math.abs(0.2/(this.postGrowthScale * 1.5));
        // this.pointerLine.setDepth(4);
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

        }

        if (this.cameraSetBool) this.setCameraToStar();

        // this.updatePointerLine();


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
        // this.pointerLine.rotation = this.trajectory + Math.PI/2;
        // this.pointerLine.x = this.x;
        // this.pointerLine.y = this.y;
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
        this.satelliteScaleStack.push(satelliteScale);
        this.postGrowthScale = this.Scale + satelliteScale;
        this.totalScaleGained += satelliteScale;
        this.scene.updateUniversalScalar();

        if (!this.orbitalEntered) this.setCameraToStar(this.Scale);//(this.Scale + satelliteScale);

        this.updateSpeed();
        while (this.Scale+satelliteScale >= this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex] 
            && this.scene.satelliteArrayIndex < this.scene.satelliteScaleArray.length - 5) 
        {
            this.scene.satelliteArrayIndex++;
            this.scene.farthestZoomValue =
                Math.abs(0.5+(0.05/
                    this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex + 3]
                    )
                );
        }
        this.anims.play(this.scene.a_starPC_powerUp);
        this.scene.updateScreenValues();
        this.updateSpeed();
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
            this.postGrowthScale = this.Scale;
            this.updateSize();
            // this.scene.universalScalar /= this.satelliteScaleStack.pop();
            this.totalScaleGained -= this.satelliteScaleStack.pop();
            
            this.scene.updateUniversalScalar();

            //this while loop was outside of this if before, if it crashes put i tback
            while (this.Scale < this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex] 
                && this.scene.satelliteArrayIndex > 2) 
            {  
             this.scene.satelliteArrayIndex--;
             console.log("shrinking index to "+this.scene.satelliteArrayIndex);
 
             this.scene.farthestZoomValue =
                 Math.abs(0.5+(0.05/
                     this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex + 3]
                     )
                 );
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
        this.scene.star.chooseBaseAnim();
        this.canLoseSatellite = false;
        this.scene.killAllSatellites();
        this.orbitalEntered = false;
        this.isBouncing = false;
        this.setCameraToStar(this.Scale);
        this.startSpeeding();

        console.log("index is now " + this.scene.satelliteArrayIndex);
        
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

        // this.findTrajectory();

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
        
        if ((keySPACE.isDown && !this.lastCamWasZoomedIn) || this.justLeftOrbit) {

            this.scene.cameras.main.panEffect.reset(); //this doesn't work apparently
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
            this.scene.cameras.main.startFollow(this, true, 1, 1); 
    
            this.cameraSetBool = true;
    
            this.scene.cameras.main.zoomEffect.reset();
            this.scene.cameras.main.zoomTo(Math.abs(0.2/(0.4*0.9-(this.scene.satelliteArrayIndex * 0.01))), 1000, 'Sine.easeInOut');


            this.lastCamWasZoomedIn = true;
            this.zoomTimer = 0;
            this.justLeftOrbit = false;
        }
        else if (!keySPACE.isDown && this.lastCamWasZoomedIn ) {
                
            this.zoomTimer ++;
            // this.justLeftOrbit = false;

            if (this.zoomTimer > 60 && this.lastCamWasZoomedIn)  {
                this.scene.cameras.main.panEffect.reset(); //this doesn't work apparently
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
                this.scene.cameras.main.startFollow(this, true, 1, 1); //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/
        
                this.cameraSetBool = true;
                
                this.scene.cameras.main.zoomEffect.reset();
                this.scene.cameras.main.zoomTo(Math.abs(0.2/(0.15*0.9-(this.scene.satelliteArrayIndex * 0.01))), 1500, 'Sine.easeInOut');

                this.lastCamWasZoomedIn = false;
            }

        //.pan(x, y, duration, ease)
        // this.scene.cameras.main.pan(this.x, this.y, 1000, 'Power2');
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //ACCESSING SPECIFIC MEMBERS/METHODS FROM A PHASER CLASS, 
        //https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html#shakeEffect__anchor
        }
    }
}