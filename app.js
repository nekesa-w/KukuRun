//Sound Effects
var sfx = {
  Jump: new Howl({
     src: [
        'https://assets.codepen.io/21542/howler-push.mp3',
     ]
  }),

}

//Background Music
var music = {
  overworld: new Howl({
     src: [
        "https://assets.codepen.io/21542/howler-demo-bg-music.mp3"
     ]
  })
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Background Variables/Constants
const sky = new Image();
sky.src = 'images/parallax/sky.png';
const tallground = new Image();
tallground.src = 'images/parallax/tallground.png';
const midground = new Image();
midground.src = 'images/parallax/midground.png';
const house = new Image();
house.src = 'images/parallax/house.png';
const shortground = new Image();
shortground.src = 'images/parallax/shortground.png';
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.png';

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let gameTitle;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let groundImage;
let gameOver = false;

// Event Listeners
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

// Classes
class Layer{
  constructor(image, speedModifier){
    this.x = 0;
    this.y = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.x2 = this.width;
    this.image = image;
    this.speedModifier = speedModifier;
    this.speed = gameSpeed * this.speedModifier;
  }

  update(){
    this.speed = gameSpeed * this.speedModifier;
    if(this.x <= -this.width){
      this.x = this.width + this.x2 - this.speed;
    }

    if(this.x2 <= -this.width){
      this.x2 = this.width + this.x - this.speed;
    }

    this.x = Math.floor(this.x - this.speed);
    this.x2 = Math.floor(this.x2 - this.speed);
  }

  draw(){
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
  }
}

class Player {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dy = 0;
    this.jumpForce = 15;
    this.originalHeight = h;
    this.grounded = false;
    this.jumpTimer = 0;

    // Add image properties
    this.imageStationary = new Image();
    this.imageStationary.src = 'images/chicken-stationary.png';

    this.imageRun0 = new Image();
    this.imageRun0.src = 'images/chicken-run-0.png';

    this.imageRun1 = new Image();
    this.imageRun1.src = 'images/chicken-run-1.png';

    this.imageDuck = new Image();
    this.imageDuck.src = 'images/chicken-duck.png';

    // Set initial image
    this.currentImage = this.imageStationary;
  }

  Animate() {
    // Jump
    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS']) {
      this.h = this.originalHeight/1.3;
      this.currentImage = this.imageDuck;
    } else {
      this.h = this.originalHeight;

      // Choose running animation based on the frame count
      this.currentImage = (Math.floor(Date.now() / 100) % 2 === 0) ? this.imageRun0 : this.imageRun1;
    }

    this.y += this.dy;

    // Gravity
    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jump() {
    if (this.grounded && this.jumpTimer === 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } 
    else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      sfx.Jump.play();
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw() {
    if (!gameOver) {
      ctx.drawImage(this.currentImage, this.x, this.y, this.w, this.h);
    }
  }
}

class Obstacle {
  constructor(x, y, w, h, type) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;

    this.dx = -gameSpeed;
    this.rotation = 0;

    if (this.type === 0) {
      // Ground obstacle
      this.image = new Image();
      this.image.src = 'images/obstacle.png';
    } else {
      // Floating obstacle (butcher knife)
      this.image = new Image();
      this.image.src = 'images/butcher-knife.png';
    }
  }

  Update() {
    this.x += this.dx;

    // Rotate only floating obstacles
    if (this.type !== 0) {
      this.rotation -= 0.1;
    }

    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    if (!gameOver) {
      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

      // Rotate only floating obstacles
      if (this.type !== 0) {
        ctx.rotate(this.rotation);
      }

      ctx.drawImage(this.image, -this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }
}

class Text {
  constructor (t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + 'px Audiowide';
    ctx.shadowColor = '#964c05';
    ctx.shadowOffsetX = -3;
    ctx.shadowOffsetY = 3;
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle() {
  let size;
  let type = RandomIntInRange(0, 1);

  if (type === 0) {
    // Ground obstacle
    size = RandomIntInRange(40, 100);
  } else {
    // Floating obstacle
    size = 70;
  }

  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, type);

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }

  obstacles.push(obstacle);
}

// Random Integer
function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const skyLayer = new Layer(sky,0.1);
const tallgroundLayer = new Layer(tallground,0.2);
const midgroundLayer = new Layer(midground,0.3);
const shortgroundLayer = new Layer(shortground,1);
const gameObjects = [skyLayer, tallgroundLayer, midgroundLayer, shortgroundLayer];

// Game Start
function Start () {
 
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = 'Audiowide';

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;

  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(150, 0, 100, 100, '#FF5858');
  scoreText = new Text("Score: " + score, canvas.width*0.05, 100, "left", "#d6a735", "40");
  gameTitle = new Text("KUKU RUN", canvas.width / 2, 100, "center", "#fff", "60");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - canvas.width*0.05, 100, "right", "#d6a735", "40");

  requestAnimationFrame(Update);

//Play Background Music when Start Music Button is pressed
  document.querySelector(".play-music").addEventListener("click", () => {
    if (!music.overworld.playing()) {
       music.overworld.play();
    }
 })
 document.querySelector(".stop-music").addEventListener("click", () => {
     music.overworld.pause();
 })
 
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update() {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    gameObjects.forEach(object=>{
      object.update();
      object.draw();
    });

    spawnTimer--;
    if (spawnTimer <= 0) {
      SpawnObstacle();
      console.log(obstacles);
      spawnTimer = initialSpawnTimer - gameSpeed * 8;

      if (spawnTimer < 60) {
        spawnTimer = 60;
      }
    }

    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
      let o = obstacles[i];

      if (o.x + o.w < 0) {
        obstacles.splice(i, 1);
      }

      if (
        player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y
      ) {
        // Set the game over state
        gameOver = true;
        break;
      }

      o.Update();
    }

    player.Animate();

    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();

    gameTitle.Draw();

    if (score > highscore) {
      highscore = score;
      highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();

    gameSpeed += 0.003;
  } else {
    // Set background
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    var rectWidth = 500;
    var rectHeight = 300;
    var rectX = (canvas.width - rectWidth) / 2; // Center the rectangle horizontally
    var rectY = (canvas.height - rectHeight) / 2; // Center the rectangle vertically

    // Set rounded rectangle properties
    var cornerRadius = 20; // Adjust the corner radius for rounding

    // Draw rounded background rectangle behind the text
    ctx.fillStyle = '#c0c4c9'; // Adjust the background color
    ctx.beginPath();
    ctx.moveTo(rectX + cornerRadius, rectY);
    ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight, cornerRadius);
    ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight, cornerRadius);
    ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, cornerRadius);
    ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Display game over message
    ctx.fillStyle = '#c03831';
    ctx.font = '60px Audiowide';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#822521';
    ctx.shadowOffsetX = -3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Display reload button
    ctx.fillStyle = '#34a234';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Audiowide';
    ctx.textAlign = 'center';
    ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 85);

    canvas.addEventListener('click', function () {
      // Reload the page when the button is clicked
      if (gameOver) {
        window.location.reload();
      }
    });
  }
}

function ResetGame() {
  // Reset variables and flags
  gameOver = false;
  obstacles = [];
  score = 0;
  gameSpeed = 3;

  // Call Start to initialize the game again
  Start();
}

Start();