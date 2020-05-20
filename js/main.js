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
            this.play();
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

        this.currentFrame += this.direction;

        if (this.currentFrame >= this.imgsByRoll * this.currentRoll) {
            this.burn = true;
        }

        if (this.loop) {
            if (this.currentFrame == this.totalImgs) {
                this.currentFrame = 1;
            }
        } else if (this.loopR) {
            if (this.currentFrame == this.totalImgs || this.currentFrame == 1) {
                this.direction = -this.direction;
            }
        } else if (this.currentFrame == this.totalImgs) {
            clearInterval(this.intervalID);
        }

        this.player.style.backgroundPosition = this.bgPosition();

        if (this.burn) {
            // console.log(`BURN at ${this.currentFrame}`);
            this.changeRoll();
            this.play();
            this.burn = false;
        }

    }


    changeRoll() {
        console.log(`changeRoll ${this.currentRoll}`);
        this.currentRoll += 1;
        if (this.currentRoll > this.totalRolls) {
            this.currentRoll = 1;
        }
    }


    play() {
        console.log(`Play!`);
        this.player.style.background = `url(${this.imagesFiles[this.currentRoll - 1].src}) no-repeat`;

        clearInterval(this.intervalID);
        this.intervalID = window.setInterval(this.changeFrame.bind(this), 1000 / this.FPS);
    }
 
}

const myPlayer = new Player(
    parent=document.getElementById('container'),
    videoW=720, videoH=480, FPS=24,
    mediaFolder='media/stripX4',
    totalImgs=96,
    totalRolls=4, imgsByRoll=24,
    loop=true, loopR=false,
);

myPlayer.preloadImages();
