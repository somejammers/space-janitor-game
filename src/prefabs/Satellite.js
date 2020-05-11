class Satellite extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        //update this later? once when star grows per obstacle
        if (scale > this.scene.p_scale) this.setDepth(6);
        else this.setDepth(4);
        this.setScale(scale);

        this.radius = 75 * scale;
        this.setCircle(this.radius, 0, 0);

        //Orbital
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "Orbital"
        );
        this.orbital.setScale(scale);
        
        this.orbitalBody = this.orbital.body;
        this.orbitalRadius = 150 * scale;

        this.orbital.setImmovable(true);
        this.orbital.setDepth(3);
        //we offset the radius by star.radius in order to not let the star ride
        //the outer edge of the orbital
        this.orbital.setCircle(
            this.orbitalRadius - this.scene.star.radius/2, 
            this.scene.star.radius/2, this.scene.star.radius/2);

        this.orbitalAccelModDefault = 0.03;
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

        this.scene.physics.add.overlap(this.scene.star, this.orbital, this.orbitalEntry, null, this);
    }

    update() {

        //Properties
        this.distToStar = Math.sqrt(
            (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
            +
            (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
        );

        this.orbitalRotation();

    }

    orbitalEntry() {
        // to make sure this runs once
        if (!this.orbitalEntered) {
            console.log("has entered orbit");

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
        ( this.canReEnterOrbit && keySPACE.isDown ) 
        { //&& key is down
                        //This prevents star from spiraling out of orbit, and instead
            //closes in on origin

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
        
            //helps the asynchonicity, but might make it lag. 
            this.scene.star.update();

            this.canStopOrbiting = true;
            this.isPreOrbiting = false;

        } else if (this.isPreOrbiting) {
            console.log("can orbit now");
            this.lastDistToStar = this.distToStar;
        }
        //star leaving orbital
        else if (this.canStopOrbiting) {
            console.log("let go of key");
            this.orbitalAccelMod = this.orbitalAccelModDefault;
            this.canReEnterOrbit = false;
            // actually leaves orbital
            if (this.distToStar - 1.5 * this.scene.star.radius > this.orbitalRadius) {
                this.orbitalEntered = false;
                this.orbitalBody.setEnable(true);
                this.canStopOrbiting = false;
                this.currRotationDuration = 0;
                console.log("has left orbit");

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