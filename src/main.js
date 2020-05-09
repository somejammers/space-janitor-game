//to do: adjusting browser resolution
// physics library
// eloquent js

let canvas_height = 720;
let canvas_width = 720;

let physicsConfig = {
    default: 'arcade',
    arcade: {
        debug: true, //true if u wanna show bounding boxes
        fps: 60
    }
}

let config = {
    type: Phaser.CANVAS,
    width: canvas_width,
    height: canvas_height,
    physics: physicsConfig,
    transparent: true, //removes black background at start
    scale: {
        mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [ Bootup, Title, Level1, Level2] , //array, order matters
};

let game = new Phaser.Game(config);
