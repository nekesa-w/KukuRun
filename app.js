const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
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
      this.h = this.originalHeight /1.3;
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
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
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
    this.type = type; // Keep track of the obstacle type

    this.dx = -gameSpeed;
    this.rotation = 0; // Initial rotation angle

    if (this.type === 0) {
      // Ground obstacle
      this.image = new Image();
      this.image.src = 'images/obstacle.png';
    } else {
      // Floating obstacle (butcher knife)
      this.image = new Image();
      this.image.src = 'images/butcher-knife.png'; // Replace 'butcher-knife.png' with your actual image filename
    }
  }

  Update() {
    this.x += this.dx;

    // Rotate only floating obstacles
    if (this.type !== 0) {
      this.rotation -= 0.1; // Adjust the rotation speed as needed
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
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle() {
  let size;
  let type = RandomIntInRange(0, 1);

  if (type === 0) {
    // Ground obstacle
    size = RandomIntInRange(30, 80);
  } else {
    // Floating obstacle
    size = 40; // Set a fixed size for floating obstacles
  }

  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, type);

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }

  obstacles.push(obstacle);
}

function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Start () {
  
  const ground = document.getElementById('ground');
  groundImage = new Image(); // Initialize groundImage here
  groundImage.src = 'images/ground.png';

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ground.style.height = '20px'; // Set the ground div height
  ground.style.backgroundImage = `url('${groundImage.src}')`;

  ctx.font = '20px sans-serif';

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(25, 0, 50, 50, '#FF5858');

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;
function Update() {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
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

    if (score > highscore) {
      highscore = score;
      highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();

    gameSpeed += 0.003;
  } else {
    // Display game over message
    ctx.fillStyle = '#212121';
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    // Display reload button
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Reload', canvas.width / 2, canvas.height / 2 + 85);

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