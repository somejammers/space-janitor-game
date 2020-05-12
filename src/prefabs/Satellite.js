class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        //update this on star hitting satellite in scene
        if (scale > this.scene.star.Scale) this.setDepth(6);
        else this.setDepth(4);

        this.satelliteBody = this.body;

        this.setScale(scale);

        this.Scale = scale;
        this.radius = 75;
        this.setCircle(this.radius, 0, 0);

        this.orbitalRadiusWeighted = this.radius * this.Scale;

        //Orbital
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "Orbital"
        );
        
        this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 150;

        this.orbital.setImmovable(true);
        this.orbital.setDepth(2);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(
            this.orbitalRadius - this.scene.star.radius/6, 
            this.scene.star.radius/6, this.scene.star.radius/6);
        this.orbital.setScale(scale);

        this.orbitalRadiusWeighted = this.orbitalRadius * this.Scale;

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

        this.x_velocity = 0;
        this.y_velocity = 0;


        this.isLargerThanStar = this.scene.star.Scale <= this.Scale ? true : false;

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
        this.scene.physics.add.collider(this.scene.star.orbital, this, this.handleStarCollision, null, this);

    }

    update() {

        //Properties
        this.distToStar = Math.sqrt(
            (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
            +
            (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
        );

        this.orbitalRotation();

        this.orbitAroundStar();

    }

    handleStarCollision() {
        if (this.isCollidable) 
        {
                console.log("collided");
            if (this.isLargerThanStar) 
            {
                this.scene.star.shrinkUpdate();
            }
            else 
            {
                this.isCollidable = false;
                this.isOrbitingStar = true;
                this.scene.star.growUpdate(this, this.Scale);
                let strataInOrbital = this.scene.star.Scale; //
                this.findStrataInStarOrbital(strataInOrbital); //do this in update
            }
            //notify other satellites
            this.scene.updateSatellites();
        }
    }

    orbitAroundStar() {
        if (this.isOrbitingStar) 
        {
            //do orbit
        } 
        else if (this.isPreOrbitingStar)
        {
            this.findStrataInStarOrbital();
        }

    }

    findStrataInStarOrbital() {
    //calculate angle from star to this
        let distToStarOrbitalStrataX = this.scene.star.x + (this.scene.star.orbitalRadius * this.scene.star.orbitalScale) + (150 * this.Scale) - this.x ;
        let distToStarOrbitalStrataY = this.scene.star.y + (this.scene.star.orbitalRadius * this.scene.star.orbitalScale) + (150 * this.Scale) - this.y;
        let distToStarOrbitalStrata = Math.sqrt(
            distToStarOrbitalStrataX * distToStarOrbitalStrataX
            +
            distToStarOrbitalStrataY * distToStarOrbitalStrataY
        );
        
        if (distToStarOrbitalStrata > 10)
        {
            let angle = Math.atan(
                (this.scene.star.y - this.y)
                /
                (this.scene.star.x - this.x)
            );
            if (this.x - this.scene.star.x >= 0) angle += Math.PI;

            //accelerate to strata on orbital, accounting for satellite size
            let accelTowardsThisX = this.scene.star.x + distToStarOrbitalStrata * Math.cos(angle);
            let accelTowardsThisY = this.scene.star.y + distToStarOrbitalStrata * Math.sin(angle);

            let addAccelX = this.scene.star.speedMod * 1.5 * (accelTowardsThisX - this.x);
            let addAccelY = this.scene.star.speedMod * 1.5 * (accelTowardsThisY - this.y);

            this.setVelocity(10, 10);
        }
        else 
        {
            this.setVelocity(this.scene.star.x_velocity, this.scene.star.y_velocity);
            this.isPreOrbitingStar = false;
            this.isOrbitingStar = true;
        }
    }


    //called from level.js when star changes 
    updateOrbital()
    {
        this.isLargerThanStar = this.scene.star.Scale <= this.Scale ? true : false;

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
        if (this.isLargerThanStar && !this.orbitalEntered) 
        {
            console.log("orbitalentry");
            this.findClockRotation();
            this.isPreOrbiting = true;
            this.orbitalBody.setEnable(false);
            this.orbitalEntered = true;
            this.lastDistToStar = this.distToStar;
            this.canReEnterOrbit = true;
        }
    }

    orbitalRotation() {
        if //distance btwn star and satellite < orbital_radius
        ( this.canReEnterOrbit && keySPACE.isDown && this.distToStar - 0.5*this.scene.star.radiusWeighted <= this.orbitalRadiusWeighted) 
        { 
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
            let angleOffset = this.clockRotation * (this.scene.star.speedMod / 40) * Math.PI / 180; //tweak this for difficulty scaling
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

            // let distCorrection = Math.sqrt(
            //     (accelTowardsThisX - this.scene.star.x) * (accelTowardsThisX - this.scene.star.x)
            //     +
            //     (accelTowardsThisY - this.scene.star.y) * (accelTowardsThisY - this.scene.star.y)
            // ) / 2;
            
            this.orbitalAccelMod *= this.orbitalAccelModScaling;
            this.scene.star.addAcceleration(addAccelX, addAccelY);

            this.canStopOrbiting = true;
            this.isPreOrbiting = false;

        } else if (this.isPreOrbiting) {
            this.lastDistToStar = this.distToStar;
        }
        //star leaving orbital
        else if (this.canStopOrbiting) {
            this.lastDistToStar = this.distToStar;
            //balance this later
            this.orbitalAccelMod = this.orbitalAccelModDefault * 10; //not a full reset of accel but a bit better
            this.currRotationDuration = 0;
            if (this.distToStar - 0.5*this.scene.star.radiusWeighted > this.orbitalRadiusWeighted) {
                this.canReEnterOrbit = false;       
                this.orbitalAccelMod = this.orbitalAccelModDefault;
                this.orbitalEntered = false;
                this.orbitalBody.setEnable(true);
                this.canStopOrbiting = false;
                this.currRotationDuration = 0;

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

        if(crossZ >= 0) this.clockRotation = 1;
        else this.clockRotation = -1;
        
    }

    

    
}