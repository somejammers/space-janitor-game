class Bootup extends Phaser.Scene {
    constructor() {
        super("bootupScene");
    }

    preload() {

        /////SPRITES/////////////
        this.load.image("Star", "./assets/sprites/Star.png");
        this.load.image("StarOrbital", "./assets/sprites/StarOrbital.png");
        this.load.image("Satellite", "./assets/sprites/Satellite.png");
        this.load.image("Orbital", "./assets/sprites/Orbital.png");

        this.load.image("debris_apple.png", "./assets/sprites/debris_apple.png");
        this.load.image("debris_banana.png", "./assets/sprites/debris_banana.png");
        this.load.image("debris_can.png", "./assets/sprites/debris_can.png");
        this.load.image("debris_computer.png", "./assets/sprites/debris_computer.png");
        this.load.image("debris_couch.png", "./assets/sprites/debris_couch.png");
        this.load.image("debris_dumpster.png", "./assets/sprites/debris_dumpster.png");
        this.load.image("debris_fish.png", "./assets/sprites/debris_fish.png");
        this.load.image("debris_newspaper.png", "./assets/sprites/debris_newspaper.png");
        this.load.image("debris_rocket.png", "./assets/sprites/debris_rocket.png");
        this.load.image("debris_satellite.png", "./assets/sprites/debris_satellite.png");
        this.load.image("debris_shoe.png", "./assets/sprites/debris_shoe.png");
        this.load.image("debris_sodacan.png", "./assets/sprites/debris_sodacan.png");
        this.load.image("debris_toybunny.png", "./assets/sprites/debris_toybunny.png");
        this.load.image("debris_kite.png", "./assets/sprites/debris_kite.png");
        this.load.image("pointerLine", "./assets/sprites/pointer_line.png");


        //////MENU////////
        this.load.spritesheet('menuBG', './assets/sprites/menuScreenBG.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('playButton', './assets/sprites/playButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('rulesButton', './assets/sprites/rulesButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('creditsButton', './assets/sprites/creditsButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});

        this.load.spritesheet('creditsP', './assets/sprites/menuScreenCredits.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('rulesP', './assets/sprites/menuScreenRules.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});

        //////////////////
    }

    create() {

        this.scene.start("titleScene");

    }
}