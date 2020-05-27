class Player {

    constructor (

        parent=document.body,
        videoW, videoH, FPS=24,
        mediaFolder='media', totalImgs, totalRolls=1, imgsByRoll,
        loop=true, loopR=false,

    ) {
       
        // Parameters
        this.videoW = videoW;
        this.videoH = videoH;
        this.FPS = FPS;
        this.mediaFolder = mediaFolder;
        this.totalImgs = totalImgs;
        this.totalRolls = totalRolls;
        this.imgsByRoll = imgsByRoll;
        this.loop = loop;
        this.loopR = loopR;

        // Internal
        this.intervalID;
        this.direction = 1;
        this.currentFrame = 1;
        this.currentRoll = 1;
        this.rolls = this.listRolls();
        this.burn = false;
        this.imagesFiles = [];

        // DOM
        this.player = this.buildDOM();
        parent.appendChild(this.player);

    }

    /**
     * Generate list of file names.
     * @returns list
     */
    listRolls() {
        let rolls = [];
        for (let i = 0; i < this.totalRolls; i++) {
            rolls.push(`strip_0${i < 10 ? 0 : ''}${i + 1}.png`);
        }
        console.log(`rolls: ${rolls}`);
        return rolls;
    }

    preloadImages() {

        let imagesURL = [];

        function loadImage(url) {
            console.log(`Loading ${url}`);
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        }

        for (let index = 0; index < this.rolls.length; index++) {
            imagesURL[index] = `${this.mediaFolder}/${this.rolls[index]}`;
            console.log(`imagesURL: ${imagesURL}`);
        }

        const registerImages = (images) => {
            this.imagesFiles = [...images];
            console.log(`hello!\n${this.imagesFiles}`);
            this.warmUp();
            // this.play();
        }

        async function loadAllImages() {

            let images = [];

            for (let index = 0; index < imagesURL.length; index++) {
                images[index] = await loadImage(imagesURL[index]);
                // let imgX = await loadImage('https://picsum.photos/1920/1080');
                // let imgY = await loadImage('https://picsum.photos/1920/2160');
                // let imgZ = await loadImage('https://picsum.photos/2160/1080');
            }
            // console.log(`async done`);
            return registerImages(images);
        }

        loadAllImages();
    }


    buildDOM() {
        this.player = document.createElement('div');
        this.player.id = "player";
        // console.log('DOM built');
        return this.player;
    }

    bgSetup() {
        let background = [];
        this.imagesFiles.forEach( (image) => {
            background.push(`url(${image.src}) no-repeat`);
        });
        background.push('red');
        return background;
    }

    bgPosition() {

        let bgPositions = `0 ${-this.videoH * (this.currentFrame - (this.imgsByRoll * (this.currentRoll - 1) ) - 1)}px`;
        return bgPositions;
    }

    changeFrame() {

        // console.log(`this.currentFrame: ${this.currentFrame}`);
        // console.log(`this.currentRoll: ${this.currentRoll}`);

        this.currentFrame += this.direction;

        if (this.currentFrame > this.imgsByRoll * this.currentRoll) {
            this.burn = true;
        }

        if (this.loop) {

            if (this.currentFrame > this.totalImgs) {
                this.currentFrame = 1;
                this.currentRoll = 1;
                this.burn = false;
                this.play();
            }
            
            // this.player.style.backgroundPosition = this.bgPosition();

        } else if (this.loopR) {

            if (this.currentFrame == this.totalImgs || this.currentFrame == 1) {

                this.direction = -this.direction;
            }

            // this.player.style.backgroundPosition = this.bgPosition();

        } else if (this.currentFrame == this.totalImgs) {
            // this.currentFrame -= this.direction;
            // this.player.style.backgroundPosition = this.bgPosition();
            console.log(`changeFrame | this.intervalID= ${this.intervalID}`);
            clearInterval(this.intervalID);
            // setTimeout( () => {
            //     this.goToFrame();
            // }, 500);
            
        }

        if (this.burn && this.currentFrame != this.totalImgs + 1) {
            // console.log(`BURN at ${this.currentFrame}`);
            this.changeRoll();
            this.play();
            this.burn = false;
        }

        
        this.player.style.backgroundPosition = this.bgPosition();
        

    }

    goToFrame() {
        this.currentFrame = 96;
        this.player.style.backgroundPosition = this.bgPosition();
    }


    changeRoll() {
        // console.log(`changeRoll ${this.currentRoll}`);
        this.currentRoll += 1;
        
        if (this.currentRoll > this.totalRolls) {
            this.currentRoll = 1;
        }
    }


    play() {
        // console.log(`Play!`);
        this.player.style.background = `url(${this.imagesFiles[this.currentRoll - 1].src}) no-repeat`;
        clearInterval(this.intervalID);
        // clearInterval(this.intervalID + 1);
        // clearInterval(this.intervalID - 1);
        this.intervalID = window.setInterval(this.changeFrame.bind(this), 1000 / this.FPS);
        console.log(`play | this.intervalID= ${this.intervalID}`);
    }

    warmUp() {
        this.player.style.opacity = 0;

        let index = 0;

        const rollBG = () => {
            this.player.style.background = `url(${this.imagesFiles[index].src}) no-repeat`;
            if (index == this.totalRolls - 1) {
                clearInterval(warmUpInterval);
                this.player.style.opacity = 1;
                this.play();
            } else {
                index++;
            }
        }

        let warmUpInterval = window.setInterval(rollBG.bind(this), 10 );
    }
 
}

const myPlayer = new Player(
    parent=document.getElementById('container'),
    videoW=720, videoH=480, FPS=30,
    mediaFolder='media/stripX4',
    totalImgs=96,
    totalRolls=4, imgsByRoll=24,
    loop=false, loopR=false,
);

myPlayer.preloadImages();
