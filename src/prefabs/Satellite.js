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

        //Orbital
        this.orbital = this.scene.add.sprite(
            this.x, this.y, "Orbital"
        );
        this.orbital.setDepth(3);

        this.orbitalRadius = 150 * scale;
        this.orbitalAccelMod = 0.2;
        this.distToStar;
        this.lastDistToStar = 301; //need to have this reset on orbit leave

    }

    update() {

        //Properties
        this.distToStar = Math.sqrt(
            (this.x - this.scene.star.x) * (this.x - this.scene.star.x)
            +
            (this.y - this.scene.star.y) * (this.y - this.scene.star.y)
        );

        if //distance btwn star and satellite < orbital_radius
        ( this.orbitalRadius > this.distToStar ) {

            console.log("in orbit");
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
            let angleOffset = 1 * Math.PI / 180; //convert 10 deg to rad
            let angle = Math.atan(
                (this.y - this.scene.star.y)
                /
                (this.x - this.scene.star.x)
            );

            if (this.x - this.scene.star.x >= 0) angle += Math.PI;
            
            let accelTowardsThisX = this.x + this.lastDistToStar * Math.cos(angle + angleOffset);
            let accelTowardsThisY = this.y + this.lastDistToStar * Math.sin(angle + angleOffset);

            this.scene.star.addAcceleration(
                this.orbitalAccelMod * (accelTowardsThisX - this.scene.star.x),
                this.orbitalAccelMod * (accelTowardsThisY - this.scene.star.y)
            )
        }
    }
}