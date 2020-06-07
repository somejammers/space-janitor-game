class Bootup extends Phaser.Scene {
    constructor() {
        super("bootupScene");
    }

    preload() {

        this.load.image("bg", "./assets/sprites/bg.png");

        /////SPRITES/////////////
        this.load.image("Star", "./assets/sprites/Star.png");
        this.load.spritesheet("starPC_orbital", "./assets/sprites/pulse2-Sheet.png", {frameWidth: 300, frameHeight: 300});
        this.load.image("Satellite", "./assets/sprites/Satellite.png");
        this.load.image("Orbital", "./assets/sprites/Orbital.png");
        this.load.image("BackgroundStar", "./assets/sprites/BackgroundStar.png");

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
        this.load.image("debris_ring.png", "./assets/sprites/debris_ring.png");
        this.load.image("debris_pillbottle.png", "./assets/sprites/debris_pillbottle.png");
        this.load.image("debris_basketball.png", "./assets/sprites/debris_basketball.png");
        this.load.image("debris_donut.png", "./assets/sprites/debris_donut.png");
        this.load.image("debris_tp.png", "./assets/sprites/debris_tp.png");
        this.load.image("debris_yarnball.png", "./assets/sprites/debris_yarnball.png");
        this.load.image("debris_rubberduck.png", "./assets/sprites/debris_rubberduck.png");
        this.load.image("debris_hotdog.png", "./assets/sprites/debris_hotdog.png");
        this.load.image("debris_hat.png", "./assets/sprites/debris_hat.png");
        this.load.image("debris_meat.png", "./assets/sprites/debris_meat.png");
        this.load.image("debris_balloon.png", "./assets/sprites/debris_balloon.png");
        this.load.image("debris_beachball.png", "./assets/sprites/debris_beachball.png");
        this.load.image("debris_fishbowl.png", "./assets/sprites/debris_fishbowl.png");
        this.load.image("debris_umbrella.png", "./assets/sprites/debris_umbrella.png");
        this.load.image("debris_couch.png", "./assets/sprites/debris_couch.png");


        this.load.image("pointerLine", "./assets/sprites/pointer_line.png");

        //FONT
        // this.load.text('font', 'assets/test.txt');

        this.load.spritesheet('starPC_twirl', './assets/sprites/starPC_twirl.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_hit', './assets/sprites/starPC_hit.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_wink', './assets/sprites/starPC_wink.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_normal', './assets/sprites/starPC_normal.png', {frameWidth: 150, frameHeight: 150});
        // this.load.spritesheet('starPC_powerUp', './assets/sprites/starPC_powerUp.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_happy', './assets/sprites/starPC_happy.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_orbit', './assets/sprites/starPC_orbit.png', {frameWidth: 150, frameHeight: 150});
        this.load.spritesheet('starPC_powerUp_1', './assets/sprites/starPC_powerup_3.png', {frameWidth: 180, frameHeight: 180});
        this.load.spritesheet('starPC_powerUp_2', './assets/sprites/starPC_powerup_3.png', {frameWidth: 180, frameHeight: 180});


        //////SFX/////////




        //////MENU////////
        this.load.spritesheet('menuBG', './assets/sprites/menuScreenBG.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('playButton', './assets/sprites/playButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('rulesButton', './assets/sprites/rulesButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('creditsButton', './assets/sprites/creditsButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});

        this.load.spritesheet('creditsP', './assets/sprites/menuScreenCredits.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('rulesP', './assets/sprites/menuScreenRules.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});


        this.load.audio('s_grow', './assets/sfx/ES_PREL_Hit_Twinkle_2_SFX_Producer.wav');
        // this.load.audio('s_shrink', './assets/sfx/ES_PREL_Special_FX_Des_77_SFX_Producer.wav');
        this.load.audio('s_speeding', './assets/sfx/ES_PREL_Whoosh_Twinkle_SFX_Producer.wav');
        this.load.audio('s_hit', './assets/sfx/ES_PREL_Special_FX_Des_41_SFX_Producer.wav');
        this.load.audio('s_blowup', './assets/sfx/ES_Sci_Fi_Magical_10_SFX_Producer.wav');
        // this.load.audio('s_', './assets/sfx/ES_PREL_Whoosh_Small_SFX_Producer.wav');
        this.load.audio('s_subtleOrbit', './assets/sfx/ES_Twinkling_Stars_SFX_Producer.wav');




        //////////////////
    }

    create() {

        this.scene.start("titleScene");

    }
}