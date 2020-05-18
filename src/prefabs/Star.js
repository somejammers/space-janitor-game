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
        this.orbitalScale = this.Scale;
        this.radius = 75;

        this.setCircle(this.radius, 0, 0);
        this.setScale(scale); //Scales hitbox and sprite

        this.radiusWeighted = this.radius * this.Scale;
        this.ScaleScaling = 0.05;
        
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "StarOrbital"
        );

        this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 75;
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale;

        this.orbital.setImmovable(true);
        this.orbital.setDepth(2);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(this.orbitalRadius, 0, 0);
        this.orbital.setScale(scale);

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

        this.speedMod = 30;

        this.satellitesCollected = 0;

        this.satelliteStack = [];
        this.satelliteScaleStack = [];   

    }

    update() {
        
        //error checking, make this better later
        if (this.x_velocity == 0) this.x_velocity = 0.1;
        if (this.y_velocity == 0) this.y_velocity = 1;

        this.x_velocity += this.x_acceleration;
        this.y_velocity += this.y_acceleration;

        this.normalizeVelocity();

        this.x_velocity *= this.speedMod;
        this.y_velocity *= this.speedMod; 

        this.setVelocity(this.x_velocity, this.y_velocity);

        this.orbital.setVelocity(this.x_velocity, this.y_velocity);


        this.findTrajectory();
        this.rotation += this.trajectory - this.lastTrajectory;
        
        this.resetAcceleration();

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
        this.satellitesCollected++;
        this.satelliteStack.push(satellite);
        this.satelliteScaleStack.push(satelliteScale);

        if (!this.orbitalEntered) this.setCameraToStar(this.Scale + satelliteScale);

        while (this.Scale >= this.scene.satelliteScaleArray[this.scene.satelliteArrayIndex] 
            && this.scene.satelliteArrayIndex < this.scene.satelliteScaleArray.length - 1) 
        {
         this.scene.satelliteArrayIndex ++;

        }

        this.scene.updateSatellites(this.Scale + satelliteScale);
        this.Scale += satelliteScale/3;
        this.updateSize();

        this.scene.time.delayedCall(333, () => {
            this.Scale += satelliteScale/3;
            this.updateSize();
        });
        this.scene.time.delayedCall(666, () => { 
            this.Scale += satelliteScale/3;
            this.updateSize();
        });

        this.scene.updateScaleTier(1);

    }

    shrinkUpdate(satX, satY) {
        console.log("boom");
        this.satellitesCollected--;
        this.bounce(satX, satY);
        if(this.satelliteStack.length > 0)
        {
            let lostSatellite = this.satelliteStack.pop();
            lostSatellite.preScatter();
            lostSatellite.isOrbitingStar = false;
            this.Scale -= this.satelliteScaleStack.pop();
            this.updateSize();
            this.setCameraToStar(this.Scale);
        }

        while (this.Scale < this.scene.satelliteScaleArray[this.satelliteArrayIndex] 
               && this.satelliteArrayIndex > 1) 
        {
            this.satelliteArrayIndex --;

        }
        //if scale goes lower than the current object scale at index, drop index by 1 and check again

        this.scene.updateScaleTier(-1);
        this.scene.updateSatellites(this.Scale);

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

        this.findTrajectory();

    }

    updateOrbital() {
        this.orbital.setScale(this.orbitalScale);
    }

    updateSize() {
        this.radiusWeighted = this.radius * this.Scale;
        this.setScale(this.Scale);
    }

    setCameraToStar(postScale) {
        
        //.pan(x, y, duration, ease)
        // this.scene.cameras.main.pan(this.x, this.y, 1000, 'Power2');
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //ACCESSING SPECIFIC MEMBERS/METHODS FROM A PHASER CLASS, 
        //https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html#shakeEffect__anchor
        this.scene.cameras.main.panEffect.reset();
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (!this.cameraSetBool) {
            this.scene.cameras.main.startFollow(this, true, 0.1, 0.1);
            this.cameraSetBool = true;
        }

        this.scene.cameras.main.zoomTo(Math.abs(1+(0.2/postScale)), 1000, 'Sine.easeInOut');

    }

}