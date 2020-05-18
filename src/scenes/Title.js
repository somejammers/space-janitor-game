class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload() {
        
        this.load.spritesheet('menuBG', './assets/sprites/menuScreenBG.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('playButton', './assets/sprites/playButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('rulesButton', './assets/sprites/rulesButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});
        this.load.spritesheet('creditsButton', './assets/sprites/creditsButton.png', {frameWidth: 275, frameHeight: 85, startFrame: 0, endFrame: 1});

        this.load.spritesheet('creditsP', './assets/sprites/menuScreenCredits.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});
        this.load.spritesheet('rulesP', './assets/sprites/menuScreenRules.png', {frameWidth: 720, frameHeight: 720, startFrame: 0, endFrame: 9});


        this.load.audio('button_click', './assets/sfx/ES_Click.wav');
        this.load.audio('menu_bgm', './assets/sfx/The-8-bit-Princess.wav');


    }

    create() {

        var music = this.sound.add('menu_bgm');
        music.setLoop(true);
        music.play();
        

        this.anims.create({
            key: 'menuBack',
            frames: this.anims.generateFrameNumbers('menuBG', {start: 0, end: 9, first: 0}), 
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'creditsPlay',
            frames: this.anims.generateFrameNumbers('creditsP', {start: 0, end: 9, first: 0}), 
            frameRate: 10,
            repeat: -1
            
        });

        this.anims.create({
            key: 'rulesPlay',
            frames: this.anims.generateFrameNumbers('rulesP', {start: 0, end: 15, first: 0}), 
            frameRate: 10,
            repeat: -1
            
        });

        let boom = this.add.sprite(0, 0, 'menuBG').setOrigin(0,0);
        boom.anims.play('menuBack');

        let buttonOne = this.add.sprite(440, 240, 'playButton').setOrigin(0,0).setInteractive();;
        let buttonTwo = this.add.sprite(440, 330, 'rulesButton').setOrigin(0,0).setInteractive();;
        let buttonThree = this.add.sprite(440, 420, 'creditsButton').setOrigin(0,0).setInteractive();;

        // Play Button
        //hover effect on Play Button
        buttonOne.on('pointerover',function(pointer){
            buttonOne.setFrame(1);
        }) 
        buttonOne.on('pointerout',function(pointer){
            buttonOne.setFrame(0);
        })
        // click on Play Button
        buttonOne.on('pointerdown', function(event){
            this.sound.play('button_click');

            this.scene.stop("titleScene");
            this.scene.start("level1Scene");

        }, this);   

        // Rules Button
        // hover effect on Rules Button
        buttonTwo.on('pointerover',function(pointer){
            buttonTwo.setFrame(1);
        })

        buttonTwo.on('pointerout',function(pointer){
            buttonTwo.setFrame(0);
        })
        // click on Rules Button
        buttonTwo.on('pointerdown', function(event){
            this.sound.play('button_click');

            let rulesPlay = this.add.sprite(0, 0, 'rulesP').setOrigin(0,0);

            rulesPlay.anims.play('rulesPlay');

            var depth = rulesPlay.depth;

            rulesPlay.setInteractive();

            rulesPlay.on('pointerdown', function(event){
                this.sound.play('button_click');
            
                rulesPlay.depth = -1;

            }, this);

        }, this);   


        // Credits Button
        // hover effect on Credits Button
        buttonThree.on('pointerover',function(pointer){
            buttonThree.setFrame(1);
        })

        buttonThree.on('pointerout',function(pointer){
            buttonThree.setFrame(0);
        })
        // click on Credits Button
        buttonThree.on('pointerdown', function(event){
            this.sound.play('button_click');

            let creditsPlay = this.add.sprite(0, 0, 'creditsP').setOrigin(0,0);

            creditsPlay.anims.play('creditsPlay');

            var depth = creditsPlay.depth;

            creditsPlay.setInteractive();

            creditsPlay.on('pointerdown', function(event){
                this.sound.play('button_click');
            
                creditsPlay.depth = -1;

            }, this);

        }, this);   
        //this.scene.start("level1Scene");
    }
}