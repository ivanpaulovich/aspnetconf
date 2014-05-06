//canvas
var Width = 800;
var Height = 450;
var canvas = document.getElementById("game");
canvas.width = Width;
canvas.height = Height;
canvas.setAttribute('tabindex', 1);

var ctx = canvas.getContext("2d");
var FPS = 1000 / 60;
var keys = [];

var BG = {
	Color: '#333',
	Paint: function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(0, 0, Width, Height);
	}
};

var Ball = {
	Radius: 10,
	Color: 'red',
	X: 0,
	Y: 0,
	ServerX: 0,
    ServerY: 0,
	
	Paint: function(){
		ctx.beginPath();
		ctx.fillStyle = this.Color;
		ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
		ctx.fill();
	},

	Interpolate: function(deltaTime){
	    this.X = this.ServerX; //(this.ServerX - this.X) * deltaTime * elapsedSeconds;
	    this.Y = this.ServerY; //(this.ServerY - this.Y) * deltaTime * elapsedSeconds;
	}
};

function Paddle(position){
	this.Width = 10;
	this.Height = 100;
	this.X = 0;
	this.Y = 0;
	
	if (position == 'left')
	{
	    this.Color = 'white';
	    this.X = 0;
	}
	else
	{
	    this.Color = 'orange';
	    this.X = Width - this.Width;
	}

	this.Paint = function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(this.X, this.Y, this.Width, this.Height);
		ctx.fillStyle = this.Color;
	};
};

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function (callback) { return window.setTimeout(callback, FPS); };
}
)();

window.cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame
			|| window.webkitCancelRequestAnimationFrame
			|| window.mozCancelRequestAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| clearTimeout
}
)();

//game
var PlayerOne = new Paddle('left');
var PlayerTwo = new Paddle();

var elapsedSeconds;

function Paint(){
	ctx.beginPath();
	BG.Paint();
	PlayerOne.Paint();
	PlayerTwo.Paint();
	Ball.Paint();
}

var last = new Date();

function Loop() {
    init = requestAnimFrame(Loop);

    PlayerMove();

    Ball.Interpolate();

    Paint();
};

function NewGame() {

    Loop();

    var pongGame = $.connection.pongGameHub;

    pongGame.client.updatePositions = function (x, y, playerOneY, playerTwoY) {

        var now = new Date();
        elapsedSeconds = (now - last) / 1000;
        last = now;

        Ball.ServerX = x;
        Ball.ServerY = y;
        PlayerOne.Y = playerOneY;
        PlayerTwo.Y = playerTwoY;
    };

    $.connection.hub.start();
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});