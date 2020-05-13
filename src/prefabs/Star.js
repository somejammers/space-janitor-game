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

        this.pastSatellitesDist = 0;

        this.speedMod = 100;

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
        this.orbitalScale += satelliteScale;
        this.pastSatellitesDist += satellite.radius * satelliteScale;
        this.orbitalRadiusWeighted = this.orbitalRadius * this.orbitalScale;
        this.updateOrbital();
    }

    shrinkUpdate() {
        this.satellitesCollected--;
        this.satelliteStack.pop().isOrbitingStar = false;
        this.orbitalScale -= this.satelliteScaleStack.pop();
    }

    updateOrbital() {
        this.orbital.setScale(this.orbitalScale);
    }

}