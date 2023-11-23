let board;
let boardWidth = 1000;
let boardHeight = 400;
let context;

let chickenWidth = 100;
let chickenHeight = 100;
let chickenX = 50;
let chickenY = boardHeight - chickenHeight;
let chickenImg;

let groundImg;

let chicken = {
    x : chickenX,
    y : chickenY,
    width : chickenWidth,
    height : chickenHeight
}

window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext('2d')

    chickenImg = new Image();
    chickenImg.src = "images/chicken.png";
    chickenImg.onload = function() {
        context.drawImage(chickenImg, chicken.x, chicken.y, chicken.width, chicken.height);
    }

    groundImg = new Image();
    groundImg.src = "images/ground.png";
    groundImg.onload = function() {
        groundImg.drawImage(groundImg, chicken.x, chicken.y, chicken.width, chicken.height);
    }
   
}