class Star extends Phaser.Physics.Arcade.Sprite {
    constructor(
        scene, x_pos, y_pos, scale, texture, frame
        ) {
        super(scene, x_pos, y_pos, texture, frame);

        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);

        this.radius;

        this.setCircle(100, 10, 10);
        this.setScale(scale);
        this.setDepth(5); //behind bigger satellites, ahead of smaller
    

        this.radius = 100 * scale;
        this.x_velocity = 0;
        this.y_velocity = 0;
        this.x_acceleration = 0;
        this.y_acceleration = 0;
        this.trajectory = 0;
        this.lastTrajectory = 0;

        this.speedMod = 100;

        //STATES
        this.isEnteringOrbit = false;
        this.isLeavingOrbit = false; 
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
}