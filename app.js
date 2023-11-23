var chicken = document.getElementById('chicken');
var obstacle = document.getElementById('obstacle');
var counter = 0;

function jump(){
if(chicken.classList != 'animate'){
    chicken.classList.add('animate');
}
setTimeout(function(){
    chicken.classList.remove('animate');
    counter++;
    },500);
}

var lose = setInterval(function(){
    var chickenTop = parseInt(window.getComputedStyle(chicken).getPropertyValue('top'));
    var blockLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue('left'));

    if (blockLeft < 20 && blockLeft > 0 && chickenTop >= 130) {
        obstacle.style.animation = "none";
        obstacle.style.display = "none";
        alert("SCORE: " + counter);  // Concatenate "SCORE:" with the counter
        counter = 0;
    }
},10);

var fallingObstacle = document.getElementById('fallingObstacle');
var isFalling = false; // Flag to check if the falling obstacle is active

// Periodically show the falling obstacle every 15 seconds
setInterval(() => {
    fallingObstacle.style.display = "block"; // Show the falling obstacle
    fallingObstacle.style.top = "150px"; // Set initial position at the bottom of the screen
    fallingObstacle.style.left = "-50px"; // Set initial position to the left outside the screen
    isFalling = true; // Set the falling flag
}, 15000);

function moveFallingObstacle() {
    if (isFalling) {
        let fallingObstacleLeft = parseInt(window.getComputedStyle(fallingObstacle).getPropertyValue("left"));
        let fallingObstacleTop = parseInt(window.getComputedStyle(fallingObstacle).getPropertyValue("top"));

        fallingObstacle.style.left = fallingObstacleLeft + 5 + "px"; // Move the falling obstacle to the right by 5 pixels (adjust as needed)

        if (fallingObstacleLeft > 325) {
            // If the falling obstacle reaches the middle of the ground, stop moving
            isFalling = false;

            // Calculate a random position for the falling obstacle at the bottom
            let randomPosition = Math.floor(Math.random() * (window.innerWidth - 50)); // Adjust as needed
            fallingObstacle.style.left = randomPosition + "px";
            fallingObstacle.style.top = window.innerHeight - 50 + "px";
        }
    }
}

setInterval(moveFallingObstacle, 10);



