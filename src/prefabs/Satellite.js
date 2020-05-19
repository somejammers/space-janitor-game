//check the strata values again , compare them with the orbital rotation.
class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        //update this on star hitting satellite in scene
        this.setDepth(6);

        this.satelliteBody = this.body;

        this.setScale(scale);

        this.Scale = scale;
        this.radius = 75;
        this.radiusWeighted = 75 * this.Scale;
        this.setCircle(this.radius, 0, 0);
        //Orbital
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "Orbital"
        );
        
        this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 150;
        //update this in the checkLocationValidity()
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale * 1.2;


        this.orbital.setImmovable(true);
        this.orbital.setDepth(2);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(
            this.orbitalRadius - this.scene.star.radius/6, 
            this.scene.star.radius/6, this.scene.star.radius/6);
        this.orbital.setScale(scale * 1.2);


        this.orbitalAccelModDefault = 0.065;
        this.orbitalAccelModScaling = 1 + 0.0005 * this.scene.star.speedMod;
        this.orbitalAccelMod = this.orbitalAccelModDefault;
        this.orbitalEntered = false;
        this.canStopOrbiting = false;
        this.distToStar;
        this.lastDistToStar; //need to have this reset on orbit leave
        this.clockRotation = 1;
        this.isOrbitingSmoothly = false;
        this.canReEnterOrbit = false;
        this.isPreOrbiting = false;
        this.currRotationDuration = 0;
        this.isPreOrbitingStar = false;
        this.isOrbitingStar = false;
        this.isCollidable = true;
        this.angleToStar;
        this.speedMod;
        this.isAttachedToStar = false;
        this.hasAttachedToStar = false;
        
        this.x_velocity = 0;
        this.y_velocity = 0;

        this.rotation = Math.random() * 2 * Math.PI - Math.PI;

        this.trajectory = 0;
        this.lastTrajectory = 0;

        this.isLargerThanStar = this.scene.star.postGrowthScale < this.Scale - 0.01 ? true : false;

        
        this.scatterAngle = Math.random() * 2 * Math.PI;
        this.maxScatterDist = 200; //change this based on star scale, set in prescatter
        this.isScattering = false;
        this.timeSpentScattering = 1;

        this.cameraSetBool = false;

        //mimic starSizeChanged()
        if (!this.isLargerThanStar) 
        {
            this.orbitalBody.setEnable(false);
            this.orbital.setVisible(false);
        }
        else 
        {
            this.orbitalBody.setEnable(true);
            this.orbital.setVisible(true);
        }

        this.scene.physics.add.overlap(this.scene.star, this.orbital, this.orbitalEntry, null, this);
        this.scene.physics.add.overlap(this.scene.star, this, this.handleStarCollision, null, this);

        // this.pan = this.scene.cameras.add(this.x, this.y, 4000, 'Power2');
        // this.panFX = new PanFX(this.scene.cameras.main);
    }

    update() {

        //Properties

        this.orbitalRotation();

        this.stickToStar();

        this.scatter();

        if (!this.scene.star.cameraSetBool && this.currRotationDuration > 90) this.setCameraToSatellite();
    }

    preScatter() {
        console.log("scattering");
        this.isAttachedToStar = false;
        //perform this after star.bounce()
        let angleOffset = 0.523599*2; //30 degrees * 2
        this.scatterAngle = Math.random() * (2 * Math.PI - 2 * angleOffset) + this.scene.star.trajectory + angleOffset;

        this.scatterTargetX = this.x + this.maxScatterDist * Math.cos(this.scatterAngle);
        this.scatterTargetY = this.y + this.maxScatterDist * Math.sin(this.scatterAngle);
        
        this.x_velocity = (this.scatterTargetX - this.x);
        this.y_velocity = (this.scatterTargetY - this.y);

        this.speedMod = this.scene.star.speedMod;
        this.normalize(this.x_velocity, this.y_velocity, this.speedMod);

        this.timeSpentScattering = 0;
        this.isScattering = true;

    }

    scatter() {
        if (this.isScattering)
        {
            this.setVelocity(this.x_velocity, this.y_velocity);

            if (this.timeSpentScattering < 150) {
                this.x_velocity -= this.x_velocity / 60;
                this.y_velocity -= this.y_velocity / 60;
                this.timeSpentScattering++;
            }
            else
            {
                    this.setVelocity(0,0);
                    this.isScattering = false;
                    this.isCollidable = true;
                    this.isAttachedToStar = false;
                    this.scene.star.cameraSetBool = false;
                    this.updateOrbital();
            }
        }   
    }

    handleStarCollision() {
        if (this.isCollidable) 
        {
            if (this.isLargerThanStar) 
            {
                //turn this back on when bounce has completed
                this.isCollidable = false;
                this.scene.star.shrinkUpdate(this.x, this.y);
            }
            else 
            {
                //this will be the strata that the satellite rotates on
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );

                this.angleToStar = Math.atan(
                    (this.scene.star.y - this.y)
                    /
                    (this.scene.star.x - this.x)
                );
                if (this.scene.star.x - this.x >= 0) this.angleToStar += Math.PI;

                this.isCollidable = false;
                this.scene.star.growUpdate(this, this.Scale);
                this.isAttachedToStar = true;
                this.hasAttachedToStar = true;


            }
        }
    }

    stickToStar() {
        //constantly update placement based on angle
        if (this.isAttachedToStar) 
        {
            if(this.scene.star.trajectory != this.scene.star.lastTrajectory) 
             {
                let angleChange = this.scene.star.trajectory - this.scene.star.lastTrajectory;
                this.angleToStar += angleChange;
                this.rotation += angleChange;

                let moveToThisX = this.scene.star.x + this.distToStar * Math.cos(this.angleToStar);
                let moveToThisY = this.scene.star.y + this.distToStar * Math.sin(this.angleToStar);

                this.x = moveToThisX;
                this.y = moveToThisY;
            }   
            this.setVelocity(this.scene.star.x_velocity, this.scene.star.y_velocity);
        }
    }
    

    findTrajectory() {
        if (this.x_velocity != 0)
        {
            this.lastTrajectory = this.trajectory;
            this.trajectory = Math.atan(
                (this.y_velocity)
                /
                (this.x_velocity)
            );
            if (this.x_velocity >= 0) this.trajectory += Math.PI;
        }

        // console.log((this.trajectory * 180 / Math.PI));
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
    
    //called from level.js when star changes 
    updateOrbital(starScale)
    {
        this.isLargerThanStar = starScale < this.Scale - 0.01 ? true : false;

        if (this.isLargerThanStar) 
        {
            this.orbitalBody.setEnable(true);
            this.orbital.setVisible(true);
        }
        else 
        {
            this.orbitalBody.setEnable(false);
            this.orbital.setVisible(false);
        }
    }

    orbitalEntry() {
        // to make sure this runs once
        if (this.isLargerThanStar && !this.orbitalEntered && !this.scene.star.orbitalEntered) 
        {
            //this was in update(), as well as the one in orbitalrotation. if it breaks, undo it
            this.distToStar = Math.sqrt(
                (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                +
                (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
            );

            console.log("entered");
            this.findClockRotation();
            this.isPreOrbiting = true;
            this.orbitalBody.setEnable(false);
            this.orbitalEntered = true;
            this.lastDistToStar = this.distToStar;
            this.canReEnterOrbit = true;
            this.scene.star.orbitalEntered = true;
        }
    }

    orbitalRotation() {

        if(!this.scene.star.isBouncing && !this.isAttachedToStar)
        {   
            if //distance btwn star and satellite < orbital_radius
            ( this.canReEnterOrbit && keySPACE.isDown && this.distToStar - this.scene.star.radiusWeighted <= this.orbitalRadiusWeighted) 
            { 
                console.log("rotating");
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );
                //The currRotationDuration check is required for smooth orbitting, since the acceleration to
                //  lastDistStar makes going backwards really jumpy
                this.lastDistToStar = 
                    this.lastDistToStar <= this.distToStar && this.currRotationDuration > 90 ? 
                    this.lastDistToStar : this.distToStar;

                this.currRotationDuration ++;
                //accelerate towards next point on parametric equation on circumference
                // next point is taken every frame, based on the current distToStar as radius
                //https://en.wikipedia.org/wiki/Circle#Equations
                //parametric form: x = origin.x + radius * cos(0~2pi)
                // positive angleOffset for counter clockwise
                let angleOffset = this.clockRotation * (5 ) * Math.PI / 180; //tweak this for difficulty scaling
                let angle = Math.atan(
                    (this.y - this.scene.star.y)
                    /
                    (this.x - this.scene.star.x)
                );
                if (this.x - this.scene.star.x >= 0) angle += Math.PI;
                
                let accelTowardsThisX = this.x + this.lastDistToStar * Math.cos(angle + angleOffset);
                let accelTowardsThisY = this.y + this.lastDistToStar * Math.sin(angle + angleOffset);

                let addAccelX = this.orbitalAccelMod * (accelTowardsThisX - this.scene.star.x);
                let addAccelY = this.orbitalAccelMod * (accelTowardsThisY - this.scene.star.y);
                
                this.orbitalAccelMod *= this.orbitalAccelModScaling;
                this.scene.star.addAcceleration(addAccelX, addAccelY);

                this.canStopOrbiting = true;
                this.isPreOrbiting = false;
                this.scene.star.cameraSetBool = false; //maybe needa disable it somewhere

            } 
            else if (this.isPreOrbiting)
            {
                this.lastDistToStar = this.distToStar;
            }
            //star leaving orbital
            else if (this.canStopOrbiting) 
            {
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );
                //balance this later
                // this.orbitalAccelMod = this.orbitalAccelModDefault * 10; //not a full reset of accel but a bit better
                this.currRotationDuration = 0;
                if (this.distToStar - this.scene.star.radiusWeighted > this.orbitalRadiusWeighted) {
                    // this.canReEnterOrbit = false;       
                    this.orbitalAccelMod = this.orbitalAccelModDefault;
                    this.orbitalEntered = false;
                    this.orbitalBody.setEnable(true);
                    this.canStopOrbiting = false;
                    this.currRotationDuration = 0;
                    this.scene.star.orbitalEntered = false;
                    this.scene.star.setCameraToStar(this.scene.star.Scale);
                }
            }
        } 
        else if (this.orbitalEntered)
        {
            this.scene.star.setCameraToStar(this.scene.star.Scale);
            
            this.distToStar = Math.sqrt(
                (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                +
                (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
            );
            this.currRotationDuration = 0;

            if (this.distToStar - this.scene.star.radiusWeighted > this.orbitalRadiusWeighted) {
                // console.log("leaving!!!!!!!!!!!!!");

                // this.canReEnterOrbit = false;       
                this.orbitalAccelMod = this.orbitalAccelModDefault;
                this.orbitalEntered = false;
                this.orbitalBody.setEnable(true);
                this.canStopOrbiting = false;
                this.currRotationDuration = 0;
                this.scene.star.orbitalEntered = false;
                this.scene.star.isBouncing = false;
                this.scene.star.setCameraToStar(this.scene.star.Scale);
            }
        }
    }

    findClockRotation() {
        //uses velocity vector & distanceToStar vector

        let distVecX = this.x - this.scene.star.x;
        let distVecY = this.y - this.scene.star.y;
        let crossZ = (this.scene.star.x_velocity * distVecY)
                     -
                     (this.scene.star.y_velocity * distVecX);

        if (crossZ >= 0) this.clockRotation = 1;
        else this.clockRotation = -1;
    }

    setCameraToSatellite() {
        //use this after star safely in orbit

        this.scene.cameras.main.zoomTo( this.scene.farthestZoomValue, 1000, 'Sine.easeInOut');

        let transitionLength = 4000;
        //issue: this pan continues even after bounce()

        this.scene.cameras.main.pan(this.x, this.y, transitionLength, 'Power2');
        this.scene.time.delayedCall(transitionLength, () => { 
            if (!this.scene.star.isBouncing && this.orbitalEntered) {
                this.scene.cameras.main.startFollow(this, false, 0.1, 0.1); }
            }
        );
        this.scene.star.cameraSetBool = false;

    }

    getDistFromOrbitalTo(x, y) {
        return Math.sqrt(
            (this.x - x) * (this.x - x)
            +
            (this.y - y) * (this.y - y)
        ) - this.orbitalRadiusWeighted;
    }

    getDistFromSatelliteTo(x, y) {
        return Math.sqrt(
            (this.x - x) * (this.x - x)
            +
            (this.y - y) * (this.y - y)
        );
    }
}