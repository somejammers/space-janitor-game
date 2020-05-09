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
    
        this.x_velocity = 0;
        this.y_velocity = 0;
        this.x_acceleration = 0;
        this.y_acceleration = 0;



        this.speedMod = 50;
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
        
        this.resetAcceleration();
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
}