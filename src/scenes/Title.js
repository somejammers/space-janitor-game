class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload() {
        
        

    }

    create() {

        this.scene.start("level1Scene");
    }
}