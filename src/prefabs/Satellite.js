 //check the strata values again , compare them with the orbital rotation.
class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, satelliteIndex, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);


        //update this on star hitting satellite in scene
        this.setDepth(6);

        this.satelliteBody = this.body;


        this.origScale = scale;
        this.Scale = this.scene.universalScalar * this.origScale;

        this.setScale(this.Scale);

        this.radius = 75;
        this.radiusWeighted = 75 * this.Scale;
        this.setCircle(this.radius, 0, 0);
        //Orbital
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "Orbital"
        );
        
        this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 300;
        //update this in the checkLocationValidity()
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale * 2.0 * 0.5;


        this.orbital.setImmovable(true);
        this.orbital.setDepth(2);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(
            this.orbitalRadius - this.scene.star.radius/8, 
            this.scene.star.radius/8, this.scene.star.radius/8);
        this.orbital.setScale(this.Scale * 2.0 * 0.5); //note: the * 2 is because the orbital sprite is 4 times the size of the satellite sprite


        this.satelliteIndex = satelliteIndex;
        // CHANGE BOTH BASED ON STAR INDEX
         //update this every growth
        if (this.satelliteIndex > this.scene.satelliteArrayIndex){
            this.orbitalAccelModDefault =  1 - (0.8/4 * ( this.satelliteIndex - this.scene.satelliteArrayIndex)); //0.1 when largest possible, 0.2, 
            // console.log(this.satelliteIndex - this.scene.satelliteArrayIndex);
        }
        else    
            this.orbitalAccelModDefault = 7;

        // this.orbitalAccelMod *= 170 * Math.pow(1+this.postGrowthScale,1.4);
        
            //i wanna make this higher but lower scaling. started at 0.065. this should start higher w smaller satellites
        this.orbitalAccelModScaling = 1.25 - 0.03 * (this.satelliteIndex - this.scene.satelliteArrayIndex); //increase this asa a whole, reduce with incresaing scale diff
        this.orbitalAccelMod = this.orbitalAccelModDefault;
        this.orbitalEntered = false;
        this.canStopOrbiting = false;
        this.distToStar;
        this.lastDistToStar; //need to have this reset on orbit leave
        this.clockRotation = 1;
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
        this.distByVelocity = 0;
        this.okayToKill = true;
        
        this.x_velocity = 0;
        this.y_velocity = 0;

        this.rotation = Math.random() * 2 * Math.PI - Math.PI;

        this.trajectory = 0;
        this.lastTrajectory = 0;

        this.isLargerThanStar = this.scene.star.Scale < this.Scale ? true : false;

        
        this.scatterAngle = Math.random() * 2 * Math.PI;
        this.maxScatterDist = 200; //change this based on star scale, set in prescatter
        this.isScattering = false;
        this.timeSpentScattering = 1;
        this.okayToKill = true;
        this.strata;
        this.isAlive = true;

        this.targetSize = this.Scale;
        this.isDecreasingSize = 0;
        this.isIncreasingSize = 0;

        this.cameraSetBool = false;
        this.orbitalLeft = true;

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

        this.backgroundStarSpdX = 0;
        this.backgroundStarSpdY = 0;

        this.scene.physics.add.overlap(this.scene.star, this.orbital, this.orbitalEntry, null, this);
        this.scene.physics.add.overlap(this.scene.star, this, this.handleStarCollision, null, this);

        // this.pan = this.scene.cameras.add(this.x, this.y, 4000, 'Power2');
        // this.panFX = new PanFX(this.scene.cameras.main);
    }

    update() {

        //Properties

        this.orbitalRotation();

        this.stickToStar();

        //this.scatter();

        if (!this.scene.star.cameraSetBool && this.currRotationDuration > 90) this.setCameraToSatellite();

        if  (!this.scene.killingSatellites)
            this.changeSizeGradually(); 
        else  if(!this.isAttachedToStar)//I got rid of isokaytokill check
            this.boom();


    }

    boom() {

        //if (this.scene.killingSatellites && this.okayToKill)// {
            this.orbitalBody.setEnable(false);
            this.isAlive = false;
            this.orbitalBody.destroy();
            this.orbital.destroy();
            this.destroy();
        //}
    }

    preChangeSizeGradually(sizeDir) {
        //run this fater you update the universalScalar
        this.targetSize = this.scene.universalScalar * this.origScale;
        // sizeDir 1 means star increasing, 0 is decreasing
        if (sizeDir == 1) 
        {
            this.isDecreasingSize = 1;
            this.isIncreasingSize = 0;
        }
        else 
        {
            this.isIncreasingSize = 1;
            this.isDecreasingSize = 0;
        }

        //get direction to star
        this.dirToStarX = this.scene.star.x - this.x;
        this.dirToStarY = this.scene.star.y - this.y;

        this.sizeRate = Math.abs(this.targetSize - this.Scale) / 50;
        //DIST NOW
        this.distToStarX = this.x - this.scene.star.x;
        this.distToStarY = this.y - this.scene.star.y;
        let changeInScale = this.scene.lastUniversalScalar - this.scene.universalScalar;
        // console.log(changeInScale);
        // this.distToStarVecMultipliedToChangeInScale = this.normalize(this.distToStarX, this.distToStarY, changeInScale1 );
        // this.targetX = this.distToStarVecMultipliedToChangeInScale[0];
        // this.targetY = this.distToStarVecMultipliedToChangeInScale[1];
        this.targetX = this.distToStarX * changeInScale;
        this.targetY = this.distToStarY * changeInScale;
        // console.log(this.targetY);

        // this.perspectiveMovementRate = this.sizeRate * this.scene.collectedSatelliteRadius;
        // console.log(this.scene.lowestOrbitalRadius);

        // this.dirToStarVec = this.normalize(this.dirToStarX, this.dirToStarY, this.perspectiveMovementRate);

        this.targetXRate = this.targetX / 50;
        this.targetYRate = this.targetY / 50;

    }

    changeSizeGradually() {
        if (this.isIncreasingSize == 1) {
            //star is "decreasing" size
            if (this.targetSize >= this.Scale) {
                this.Scale += this.sizeRate;
                this.updateSize();
                // this.x += this.dirToStarVec[0];
                // this.y += this.dirToStarVec[1];
                // this.orbital.x += this.dirToStarVec[0];
                // this.orbital.y += this.dirToStarVec[1];
            }
            else 
            {
                this.isIncreasingSize = 0;
            }
        }
        if (this.isDecreasingSize == 1) {
            this.dirToStarX = this.scene.star.x - this.x;
            this.dirToStarY = this.scene.star.y - this.y;
            this.dirToStarVec = this.normalize(this.dirToStarX, this.dirToStarY, this.perspectiveMovementRate);

            if (this.targetSize <= this.Scale) {
                this.Scale -= this.sizeRate;
                this.updateSize();
                // this.x += this.dirToStarVec[0];
                // this.y += this.dirToStarVec[1];
                this.x -= this.targetXRate;
                this.y -= this.targetYRate;
                // this.orbital.x += this.dirToStarVec[0];
                // this.orbital.y += this.dirToStarVec[1];
                this.orbital.x -=  this.targetXRate;
                this.orbital.y -=  this.targetYRate;
            }
            else
            {
                //can disable a satellite disabler here
                this.isDecreasingSize = 0;
            }
        }
        
    }

    preScatter() {
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
                    this.scene.star.cameraSetBool = true;
                    // this.updateSize();
            }
        }   
    }

    handleStarCollision() {
        if (this.isCollidable) 
        {
            if (this.isLargerThanStar) 
            {
                console.log("is larger");
                //turn this back on when bounce has completed
                this.scene.star.orbitalEntered = false;
                this.isCollidable = false;
                this.scene.flashBox.setVisible(true);
                this.scene.triggerFlash();
                this.scene.cameras.main.shake(700, 0.01, 0.01, 0, false); 
                this.scene.star.shrinkUpdate(this.x, this.y);
                this.scene.star.anims.play(this.scene.a_starPC_hit);
                this.currRotationDuration = 0;

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
                    this.orbitalLeft = true;
                    this.scene.updateBackground = true;
                    this.scene.star.updateBackgroundScroll();
                    this.scene.star.cameraSetBool = true;
                    // this.scene.star.anims.play(this.scene.a_starPC_twirl);
                    this.scene.star.lastCamWasZoomedIn = true;
                    this.scene.star.zoomTimer = 0;
                    this.scene.star.justLeftOrbit = true;
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
                this.scene.collectedSatelliteRadius = this.orbitalRadiusWeighted;
                this.scene.star.growUpdate(this, this.origScale); //was this.Scale/2

                this.preStick();
                
            }
        }
        this.scene.isStrandedTicking = true;
    }

    preStick() {
        this.setVisible(false);

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
    updateSize()
    {
        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale * 2.0 * 0.5;
        this.setScale(this.Scale);
        this.orbital.setScale(this.Scale * 2.0 * 0.5);

        this.isLargerThanStar = this.scene.star.Scale < this.Scale ? true : false;

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
            this.scene.resetTimer = 0;
            this.orbitalLeft = false;
            this.scene.star.cameraSetBool = true;
            this.scene.star.isSpeeding = false;
            this.scene.s_subtleOrbit.play();
            this.currRotationDuration = 0;
        }
    }

    orbitalRotation() {
        // console.log(this.scene.star.speedMod);

        if(!this.scene.star.isBouncing && !this.isAttachedToStar && this.isLargerThanStar && !this.orbitalLeft)
        {   
            if //distance btwn star and satellite < orbital_radius
            ( this.canReEnterOrbit && keySPACE.isDown && this.distToStar - this.scene.star.radiusWeighted <= this.orbitalRadiusWeighted) 
            { 
                this.scene.star.isSpeeding = false; //CHANGE THIS LATER
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

                //accelerate towards next point on parametric equation on circumference
                // next point is taken every frame, based on the current distToStar as radius
                //https://en.wikipedia.org/wiki/Circle#Equations
                //parametric form: x = origin.x + radius * cos(0~2pi)
                // positive angleOffset for counter clockwise
                this.scene.star.anims.play(this.scene.a_starPC_orbit);
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

                    // let distTravelledByVelX = this.scene.star.body.deltaX();
                    // let distTravelledByVelY = this.scene.star.body.deltaY();
                    this.distByVelocity = Math.sqrt(
                        (this.scene.star.x_velocity * this.scene.star.x_velocity) +
                        (this.scene.star.y_velocity * this.scene.star.y_velocity)
                    );
                    
                    this.currRotationDuration ++;

                }
                else
                {
                    //maybe next angle isn't far enough
                    this.scene.star.isSmoothOrbiting = true;

                    let nextAngle = angle + this.angleDiff;
                    let diffX = this.x + this.lastDistToStar * Math.cos(nextAngle);
                    let diffY = this.y + this.lastDistToStar * Math.sin(nextAngle);
                    let distVecX = diffX - this.scene.star.x;
                    let distVecY = diffY - this.scene.star.y;
                    let distVecNormalized = this.normalize(distVecX, distVecY, 1);
                    this.scene.star.x_velocity = distVecNormalized[0] * this.distByVelocity;
                    this.scene.star.y_velocity = distVecNormalized[1] * this.distByVelocity;
                    
                    
                
                    // console.log("diffX is "+ diffX + " " + (diffX == this.scene.star.x ? true : false));
                    // console.log("diffY is "+ diffY + " " + (diffY == this.scene.star.y ? true : false));

                    // console.log("distVec is "+distVecX+" & "+distVecY);

                    // console.log("setting to "+ distVecNormalized[0] * this.distByVelocity +" and "+
                    // distVecNormalized[1] * this.distByVelocity);


                    this.scene.star.setVelocity(distVecNormalized[0] * this.distByVelocity,
                                                distVecNormalized[1] * this.distByVelocity);
                    
                    // this.scene.star.x = diffX;
                    // this.scene.star.y = diffY;
                    this.scene.star.addAcceleration(addAccelX, addAccelY);
                    this.scene.updateBackground = false;

                }

                this.canStopOrbiting = true;
                this.isPreOrbiting = false;
                this.scene.star.cameraSetBool = false; //maybe needa disable it somewhere
                this.scene.strandedTimer = 0;
                this.scene.resetTimer = 0;
                

            } 
            else if (this.isPreOrbiting)
            {
                this.currRotationDuration = 0;
                this.distToStar = Math.sqrt(
                    (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
                    +
                    (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
                );
                this.lastDistToStar = this.distToStar;
                if (this.distToStar - this.scene.star.radiusWeighted > this.orbitalRadiusWeighted) {
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
                    this.orbitalLeft = true;
                    this.scene.updateBackground = true;
                    this.scene.star.updateBackgroundScroll();
                    this.scene.star.cameraSetBool = true;
                    // this.scene.star.anims.play(this.scene.a_starPC_twirl);
                    this.scene.star.lastCamWasZoomedIn = true;
                    this.scene.star.zoomTimer = 0;
                    this.scene.star.justLeftOrbit = true;
                    // this.scene.sound.play('s_speeding', {volume: 1});
                    this.scene.s_subtleOrbit.stop();


                }
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
                    this.orbitalLeft = true;
                    this.scene.updateBackground = true;
                    this.scene.star.updateBackgroundScroll();
                    this.scene.star.cameraSetBool = true;
                    this.scene.star.anims.play(this.scene.a_starPC_twirl);
                    this.scene.star.chooseBaseAnim();
                    this.scene.star.lastCamWasZoomedIn = true;
                    this.scene.star.zoomTimer = 0;
                    this.scene.star.justLeftOrbit = true;
                    this.scene.sound.play('s_speeding', {volume: 1});
                    this.scene.s_subtleOrbit.stop();


                    console.log("leaving");
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

            if (this.distToStar - this.scene.star.radiusWeighted*1.1 > this.orbitalRadiusWeighted) {
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
                this.orbitalLeft = true;
                this.scene.updateBackground = true;
                this.scene.star.updateBackgroundScroll();
                this.isCollidable = true;
                this.scene.star.cameraSetBool = true;
                this.scene.star.anims.play(this.scene.a_starPC_twirl);
                this.scene.star.chooseBaseAnim();
                this.scene.star.lastCamWasZoomedIn = false;
                this.scene.star.zoomTimer = 60;
                this.scene.star.justLeftOrbit = true;
                this.scene.sound.play('s_speeding', {volume: 1});
                this.scene.s_subtleOrbit.stop();

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
        this.scene.star.cameraSetBool = false;

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