class Shadow_Star extends Phaser.GameObjects.Sprite {
    constructor(
        scene, x_pos, y_pos, texture, scale, rotation, frame
        ) {
            super(scene, x_pos, y_pos, texture, frame);
            scene.add.existing(this);              

            this.rotation = rotation;

            this.alpha = 0.5;

            this.scale = scale;

            this.fadeRate = 0.015;

            this.setDepth(5);

        }

        update() {
            this.alpha -= this.fadeRate;

            if(this.alpha <= 0) this.destroy();
        }
    }
