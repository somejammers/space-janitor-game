class PanFX extends Phaser.Cameras.Scene2D.Effects.Pan {
    constructor(
        scene, camera) {
        super(camera);

        scene.add.existing(this); 
        
        // this.start(0,0, 2000, 'Power2');
    }
}