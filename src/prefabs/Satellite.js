//check the strata values again , compare them with the orbital rotation.
class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, satelliteIndex, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);
        this.scene.satelliteGroup.add(this);


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
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale * 1.8;


        this.orbital.setImmovable(true);
        this.orbital.setDepth(2);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(
            this.orbitalRadius - this.scene.star.radius/8, 
            this.scene.star.radius/8, this.scene.star.radius/8);
        this.orbital.setScale(scale * 1.8);


        this.satelliteIndex = satelliteIndex;
        // CHANGE BOTH BASED ON STAR INDEX
        this.orbitalAccelModDefault = this.satelliteIndex >= this.scene.satelliteArrayIndex ? 0.070 : 0.08 + (0.01 * -(this.scene.satelliteArrayIndex - this.satelliteIndex));//i wanna make this higher but lower scaling. started at 0.065. this should start higher w smaller satellites
        this.orbitalAccelModScaling = 1 + 0.0005 * 100 + 0.005 * this.scene.satelliteArrayIndex; //this needs to scale with. started at 1 + 0.0005 * 125.
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
        this.timeAfterStick = 0;
        this.stickingTime = 30; //seconds that it takes for satellite to migrate to stuck spot
        this.lastAngle = 0;
        
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
        this.okayToKill = true;
        this.strata;
        this.isAlive = true;

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
        this.timeAfterStick = 0;

        if (this.canReEnterOrbit) {
            this.orbitalAccelMod = this.orbitalAccelModDefault;
            this.orbitalEntered = false;
            this.orbitalBody.setEnable(true);
            this.canReEnterOrbit = false;
            this.canStopOrbiting = false;
            this.currRotationDuration = 0;
            this.scene.star.orbitalEntered = false;
            this.scene.star.setCameraToStar(this.scene.star.Scale);
        }

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
                this.scene.star.orbitalEntered = false;
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
                this.scene.star.growUpdate(this, this.Scale/2);

                this.preStick();
            }
        }
        this.scene.isStrandedTicking = true;
    }

    preStick() {
        this.stickingAngle = Math.random() * 2 * Math.PI;
        this.isAttachedToStar = true;
        this.hasAttachedToStar = true;

        this.distToStar = Math.sqrt(
            (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
            +
            (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
        );
        this.strata = this.distToStar - this.orbitalRadiusWeighted / 2;

        this.stickingSpotX = this.scene.star.x + this.strata * Math.cos(this.stickingAngle);
        this.stickingSpotY = this.scene.star.y + this.strata * Math.sin(this.stickingAngle);
        // this.stickingOffsetX = (this.x - this.stickingSpotX) / 120;
        // this.stickingOffsetY = (this.y - this.stickingSpotY) / 120;
        this.stickingOffsetX = (this.x - this.stickingSpotX) / this.stickingTime;
        this.stickingOffsetY = (this.y - this.stickingSpotY) / this.stickingTime;

    }


    stickToStar() {
        //constantly update placement based on angle
        if (this.isAttachedToStar) 
        {
            this.x_velocity = this.scene.star.x_velocity;
            this.y_velocity = this.scene.star.y_velocity;

            if (this.scene.star.trajectory != this.scene.star.lastTrajectory) 
            {
                let angleChange = this.scene.star.trajectory - this.scene.star.lastTrajectory;
                this.angleToStar += angleChange;
                this.rotation += angleChange;
                this.stickingAngle += angleChange;
                // this.stickingSpotX = this.scene.star.x + (this.distToStar - this.orbitalRadius) * Math.cos(this.stickingAngle);
                // this.stickingSpotY = this.scene.star.y + (this.distToStar - this.orbitalRadius) * Math.sin(this.stickingAngle);
                // this.stickingOffsetX = (this.x - this.stickingSpotX) / 120;
                // this.stickingOffsetY = (this.y - this.stickingSpotY) / 120; 

                //rotate object normally
                this.stickingAngle += angleChange;
                this.stickingSpotX = this.scene.star.x + this.strata * Math.cos(this.stickingAngle);
                this.stickingSpotY = this.scene.star.y + this.strata * Math.sin(this.stickingAngle);
                this.stickingOffsetX = (this.x - this.stickingSpotX) / this.stickingTime;
                this.stickingOffsetY = (this.y - this.stickingSpotY) / this.stickingTime;

                if ( !(this.timeAfterStick < this.stickingTime) )
                {
                    this.x = this.stickingSpotX;
                    this.y = this.stickingSpotY;
                }
            }  
            
            if (this.timeAfterStick < this.stickingTime) 
                {
                    //angle
                    this.x -= this.stickingOffsetX;
                    this.y -= this.stickingOffsetY;

                    this.timeAfterStick++;
                } 
            this.setVelocity(this.x_velocity, this.y_velocity);
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
            this.scene.strandedTimer = 0;
            this.scene.isStrandedTicking = false;
            this.findClockRotation();
            this.isPreOrbiting = true;
            this.orbitalBody.setEnable(false);
            this.orbitalEntered = true;
            this.lastDistToStar = this.distToStar;
            this.canReEnterOrbit = true;
            this.scene.star.orbitalEntered = true;
            this.scene.star.isSpeeding = false; //CHANGE THIS LATER
            this.scene.resetTimer = 0;
            
        }
    }

    orbitalRotation() {
        // console.log(this.scene.star.speedMod);

        if(!this.scene.star.isBouncing && !this.isAttachedToStar && this.isLargerThanStar)
        {   
            if //distance btwn star and satellite < orbital_radius
            ( this.canReEnterOrbit && keySPACE.isDown && this.distToStar - this.scene.star.radiusWeighted <= this.orbitalRadiusWeighted) 
            { 
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );
                //The currRotationDuration check is required for smooth orbitting, since the acceleration to
                //  lastDistStar makes going backwards really jumpy
                if (this.currRotationDuration > 90) 
                    this.scene.star.canLoseSatellite = true;
                else
                    this.lastDistToStar = this.distToStar;

                this.currRotationDuration ++;
                //accelerate towards next point on parametric equation on circumference
                // next point is taken every frame, based on the current distToStar as radius
                //https://en.wikipedia.org/wiki/Circle#Equations
                //parametric form: x = origin.x + radius * cos(0~2pi)
                // positive angleOffset for counter clockwise
                let degrees = (Math.pow(125, 1.4) / Math.pow(this.scene.star.speedMod, 1.4)); //start at 3 for 0.25 star scale. if this spirals, increase the base and the exponent. an initial 3/1 basis
                let angleOffset = this.clockRotation * degrees * Math.PI / 180; //tweak this for difficulty scaling
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
                
                if ( !(this.currRotationDuration > 90)) {
                    this.scene.star.isSmoothOrbiting = false;
                    if (Math.abs(angle - this.lastAngle) < 90)
                        this.angleDiff = angle - this.lastAngle;
                    this.lastAngle = angle;
                    this.orbitalAccelMod *= this.orbitalAccelModScaling;
                    this.scene.star.addAcceleration(addAccelX, addAccelY);
                }
                else
                {
                    this.scene.star.isSmoothOrbiting = true;
                    // this.scene.star.speedMod = 0.1;
                    this.scene.star.addAcceleration(addAccelX, addAccelY);
                    let nextAngle = angle + this.angleDiff;
                    // if (nextAngle > Math.PI * 2) nextAngle = 0 + (nextAngle - 360);
                    // if (nextAngle < 0) nextAngle = 360 - (360 + nextAngle);

                    let diffX = this.x + this.lastDistToStar * Math.cos(nextAngle);
                    let diffY = this.y + this.lastDistToStar * Math.sin(nextAngle);
                    this.scene.star.x = diffX;
                    this.scene.star.y = diffY;
                }

                this.canStopOrbiting = true;
                this.isPreOrbiting = false;
                this.scene.star.cameraSetBool = false; //maybe needa disable it somewhere
                this.scene.strandedTimer = 0;
                this.scene.resetTimer = 0;
                

            } 
            else if (this.isPreOrbiting)
            {
                this.lastDistToStar = this.distToStar;
            }
            //star leaving orbital
            else if (this.canStopOrbiting) 
            {
                this.scene.star.isSmoothOrbiting = false;
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );
                //balance this later
                // this.orbitalAccelMod = this.orbitalAccelModDefault * 10; //not a full reset of accel but a bit better
                this.currRotationDuration = 0;
                if (this.distToStar - this.scene.star.radiusWeighted > this.orbitalRadiusWeighted) {
                    console.log("here");
                    // imerhis.canReEnterOrbit = false;       
                    this.orbitalAccelMod = this.orbitalAccelModDefault;
                    this.orbitalEntered = false;
                    this.orbitalBody.setEnable(true);
                    this.canStopOrbiting = false;
                    this.currRotationDuration = 0;
                    this.scene.star.orbitalEntered = false;
                    this.canReEnterOrbit = false;
                    this.scene.star.setCameraToStar(this.scene.star.Scale);
                    this.scene.strandedTimer = 0;
                    this.scene.isStrandedTicking = true;
                    this.scene.star.startSpeeding();

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
                this.scene.star.isSmoothOrbiting = false;
                this.currRotationDuration = 0;
                this.scene.star.orbitalEntered = false;
                this.scene.star.isBouncing = false;
                this.canReEnterOrbit = false;
                this.scene.star.setCameraToStar(this.scene.star.Scale);
                this.scene.strandedTimer = 0;
                this.scene.isStrandedTicking = true;
                this.scene.star.startSpeeding();


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
        this.okayToKill = false;
        this.scene.time.delayedCall(transitionLength, () => { 
            this.okayToKill = true;
            if (this.isAlive && !this.scene.star.isBouncing && this.orbitalEntered) {
                this.scene.cameras.main.startFollow(this, false, 0.1, 0.1);
            }
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

    stopFunctions() {
        //prevent bugs
    }
}