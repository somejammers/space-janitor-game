class BackgroundStar extends Phaser.GameObjects.Sprite {
    constructor(
        scene, x_pos, y_pos, texture, scale, frame
        ) {
            super(scene, x_pos, y_pos, texture, frame);

            scene.add.existing(this);               // add to existing scene, displayList, updateList

            this.Scale = scale;
            this.origScale = scale;
            this.setScale(this.Scale);

            this.targetSize = 0;
            this.sizeRate = 0;
            this.isDecreasingSize = 0;
            this.isIncreasingSize = 0;

            this.lengthWeighted = 75 * scale;
        }

        update() {
            // console.log("hi");
            this.changeSizeGradually();

            this.x += this.scene.backgroundStarSpdX;
            this.y += this.scene.backgroundStarSpdY;

            if (this.getDistFromBGStarTo(this.scene.star.x, this.scene.star.y) > this.scene.killDist) this.boom();
        }

        boom() {
            this.scene.backgroundStarGroup.remove(this, true);
            this.isIncreasingSize = 0;
            this.setVisible(false);
            this.isDecreasingSize = 0;
            this.destroy();
        }

        preChangeSizeGradually(sizeDir) {
            // //run this fater you update the universalScalar
            // this.targetSize = this.scene.universalScalar * this.origScale;
            // // sizeDir 1 means star increasing, 0 is decreasing
            // if (sizeDir == 1) 
            // {
            //     this.isDecreasingSize = 1;
            //     this.isIncreasingSize = 0;
            // }
            // else 
            // {
            //     this.isIncreasingSize = 1;
            //     this.isDecreasingSize = 0;
            // }
    
            // this.dirToStarX = this.scene.star.x - this.x;
            // this.dirToStarY = this.scene.star.y - this.y;

            // this.sizeRate = Math.abs(this.targetSize - this.Scale) / 50;

            // this.perspectiveMovementRate = this.sizeRate * this.lengthWeighted * 5;

            // this.dirToStarVec = this.normalize(this.dirToStarX, this.dirToStarY, this.perspectiveMovementRate);
    
        }
    
        changeSizeGradually() {
            // if (this.isIncreasingSize == 1) {
            //     //star is "decreasing" size
            //     if (this.targetSize >= this.Scale) {
            //         this.Scale += this.sizeRate;
                    
            //         // this.setScale(this.Scale);

            //     }
            //     else 
            //     {
            //         this.isIncreasingSize = 0;
            //     }
            // }
            // if (this.isDecreasingSize == 1) {

            //     this.dirToStarX = this.scene.star.x - this.x;
            //     this.dirToStarY = this.scene.star.y - this.y;
            //     this.dirToStarVec = this.normalize(this.dirToStarX, this.dirToStarY, this.perspectiveMovementRate);

            //     if (this.targetSize <= this.Scale) {
            //         this.Scale -= this.sizeRate;
            //         this.setScale(this.Scale);

            //         this.x += this.dirToStarVec[0];
            //         this.y += this.dirToStarVec[1];
            //     }
            //     else
            //     {
            //         this.isDecreasingSize = 0;
            //     }
            // }
            
        }

        getDistFromBGStarTo(x, y) {
            return Math.sqrt(
                (this.x - x) * (this.x - x)
                +
                (this.y - y) * (this.y - y)
            );
        }

        normalize(x, y, mod) {
            if (x * y != 0) 
            {  
                let length = Math.sqrt(
                    (x * x)
                    +
                    (y * y)
                );  
    
                let normX = x / length;
                let normY = y / length;
    
                let results = [normX * mod, normY * mod];
                return results;
            }
            return [0, 0];
        }

        updateSize()
        {
            this.setScale(this.Scale);
        }

    }
