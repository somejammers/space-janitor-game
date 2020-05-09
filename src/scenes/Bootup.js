class Bootup extends Phaser.Scene {
    constructor() {
        super("bootupScene");
    }

    preload() {

        //Sprites
        this.load.image("Star", "./assets/sprites/Star.png");
        this.load.image("Satellite", "./assets/sprites/Satellite.png");
        this.load.image("Orbital", "./assets/sprites/Orbital.png");
    }

    create() {

        this.scene.start("titleScene");

    }
}