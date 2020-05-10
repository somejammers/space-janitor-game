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

        this.setVisible(false);

        //Orbital
        this.orbital = this.scene.physics.add.sprite(
            this.x, this.y, "Orbital"
        );
        
        this.orbitalBody = this.orbital.body;
        this.orbital.setImmovable(true);
        this.orbital.setDepth(3);

        this.orbitalRadius = 200 * scale;
        this.orbitalAccelModDefault = 0.03;
        this.orbitalAccelModScaling = 1 + 0.0005 * this.scene.star.speedMod;
        this.orbitalAccelMod = this.orbitalAccelModDefault;
        this.orbitalEntered = false;
        this.canLeaveOrbit = false;
        this.distToStar;
        this.lastDistToStar = 301; //need to have this reset on orbit leave
        this.clockRotation = 1;
        this.isOrbitingSmoothly = false;

        this.scene.physics.add.overlap(this.scene.star, this.orbital, this.orbitalEntry, null, this);
            this.barrierTouched = true;
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
        this.findClockRotation();
        //so it runs once
        this.orbitalBody.setEnable(false);
        this.orbitalEntered = true;
        this.starIsOrbiting = true;
    }

    orbitalRotation() {
        if //distance btwn star and satellite < orbital_radius
        ( this.starIsOrbiting && keyDOWN.isDown ) { //&& key is down
            
            //This prevents star from spiraling out of orbit, and instead
            //closes in on origin
            this.lastDistToStar = 
                this.lastDistToStar <= this.distToStar ? 
                this.lastDistToStar : this.distToStar;
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

            this.orbitalAccelMod *= this.orbitalAccelModScaling;
            this.scene.star.addAcceleration(addAccelX, addAccelY);
        
            //helps the asynchonicity, but might make it lag. 
            this.scene.star.update();

            this.canLeaveOrbit = true;

        }
        //star leaving orbital
        else if (this.canLeaveOrbit || this.distToStar - 2 * this.scene.star.radius > this.orbitalRadius) {
            console.log("leaving orbit");
            this.starIsOrbiting = false;
            this.orbitalEntered = false;
            this.orbitalAccelMod = this.orbitalAccelModDefault;
            if (this.distToStar - 2 * this.scene.star.radius > this.orbitalRadius)
                this.orbitalBody.setEnable(true);
                this.canLeaveOrbit = false;
        }
    }

    findClockRotation() {
        //if star enters 
        
    }
}