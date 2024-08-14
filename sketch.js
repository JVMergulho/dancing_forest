let song;
let sliderLen;
let fft;
let bgColor = [135, 180, 30]
let musicPlaying = false;
let songs = [];
const playlist = ['music/00.mp3', 'music/01.mp3', 'music/02.mp3', 'music/03.mp3', 'music/04.mp3', 'music/05.mp3', 'music/06.mp3', 'music/07.mp3', 'music/08.mp3', 'music/09.mp3'];

const energyRanges = {
  bass: [20, 140],
  lowMid: [140, 400],
  mid: [400, 2600],
  highMid: [2600, 5200],
  treble: [5200, 14000],
};

function preload() {
  // load all songs in the playlist
  for (let path of playlist) {
    songs.push(loadSound(path));
  }
}

function setup() {
  angleMode(DEGREES)
  colorMode(HSB)
  createCanvas(windowWidth, windowHeight)

  fft = new p5.FFT();
}

function draw() {
  background(bgColor[0], bgColor[1], bgColor[2])

  if (!musicPlaying) {
    onBoarding()
  } else {
    drawForest()
  }
}

function drawForest() {
  fft.analyze()

  let energyNames = Object.keys(energyRanges);

  let energyLevels = [];
  let widthUsed = 0
  let max = 0
  let maxId = 0

  // get energy levels for each frequency range
  for (let [i, eName] of energyNames.entries()) {
    const [low, high] = energyRanges[eName];
    const energy = fft.getEnergy(low, high);
    energyLevels.push(energy);
    
    if(energy > max){
      max = energy
      maxId = i
    }
  }

  sumEnergy = energyLevels.reduce((a, b) => a + b, 0);
  bgColor = [maxId * 30, map(energyLevels[maxId], 0, 255, 10, 40), 80]
  
  let i = 0
  for (energy of energyLevels) {
    // map all parameters to build the tree
    const angle = map(energy, 0, 255, 1, 50);
    // calculate tree width based on energy level -> proportion of total energy
    const treeWidth =  (energy / sumEnergy) * width
    const posX = widthUsed + (treeWidth / 2)
    widthUsed += treeWidth

    const len = map(energy, 0, 255, 50, 180);
    const weight = map(energy, 0, 255, 2, 5);
    const posY = height - map(energy, 0, 255, 0, height*0.6);

    push();
    stroke(i * 51, energy, energy)
    tree(posX, posY, angle, len, weight);
    pop();
    
    i += 1
  }
}

function tree(posX, posY, angle, len, w){
  // draw trunk
  translate(posX, posY);
  strokeWeight(w);
  line(0, 0, 0, height);
  
  branch(angle, len * 0.7, w * 0.8);
}

function branch(angle, len, w) {
  strokeWeight(w);
  if (len > 4) {
    // left branch
    push();
      rotate(angle);
      line(0, 0, 0, -len);
      translate(0, -len);
      branch(angle, len * 0.7, w * 0.8);
    pop();

    // right branch
    push();
      rotate(-angle);
      line(0, 0, 0, -len);
      translate(0, -len);
      branch(angle, len * 0.7, w * 0.8);
    pop();
  }
}

function onBoarding(){
  strokeWeight(0)
  textSize(32)
  textAlign(CENTER);
  fill(255)
  text('🌳 Bem vindo à Floresta dançante 🌳', width/2, height/2 - 200)
  textSize(24)
  text('Pressione as teclas 0-9 para selecionar uma música', width/2, height/2 - 100)

  stroke(255)
  for(let i = 0; i < 5; i++){
    push()
    tree(width/10 + i*width/5, height - 100, 15, 100, 3);
    pop()
  }
}

function playSong(id){
  if (song){
    song.stop()
  }
  song = songs[id]
  song.loop(); 
}

function keyReleased() {
  const keyId = int(key); 
  if (keyId >= 0 && keyId <= 9) { 
    musicPlaying = true
    playSong(keyId)
  }
}
