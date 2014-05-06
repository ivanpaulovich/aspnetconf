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
	Color: 'black',
	Paint: function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(0, 0, Width, Height);
	}
};

var Ball = {
	Radius: 20,
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

	Interpolate: function (deltaTime) {
	    if (this.ServerX - this.X < 1) {
	        this.X = this.ServerX;
	    }
	    else {
	        this.X += (this.ServerX - this.X) * deltaTime;
	    }

	    if (this.ServerY - this.Y < 1) {
	        this.Y = this.ServerY;
	    }
	    else {
	        this.Y += (this.ServerY - this.Y) * deltaTime;
	    }
	}
};

function Paddle(position){
	this.Width = 20;
	this.Height = 100;
	this.X = 0;
	this.Y = 0;
    this.ServerY = 0;

	if (position == 'left')
	{
	    this.Color = 'white';
	    this.X = 5;
	}
	else
	{
	    this.Color = 'orange';
	    this.X = Width - this.Width - 5;
	}

	this.Paint = function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(this.X, this.Y, this.Width, this.Height);
		ctx.fillStyle = this.Color;
	};

	this.Interpolate = function (deltaTime) {
	    if (this.ServerY - this.Y < 1) {
	        this.Y = this.ServerY;
	    }
	    else {
	        this.Y += (this.ServerY - this.Y) * deltaTime;
	    }
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

var elapsed;
var lastTime = new Date();

function Paint(){
	ctx.beginPath();
	BG.Paint();
	PlayerOne.Paint();
	PlayerTwo.Paint();
	Ball.Paint();
}

function Loop() {
    init = requestAnimFrame(Loop);

    PlayerMove();

    Ball.Interpolate(elapsed);
    PlayerOne.Interpolate(elapsed);
    PlayerTwo.Interpolate(elapsed);

    Paint();
};

function NewGame() {

    Loop();

    var pongGame = $.connection.pongGameHub;

    pongGame.client.updatePositions = function (serverX, serverY, playerOneY, playerTwoY) {

        var current = new Date();
        elapsed = (current - lastTime) / 1000;
        lastTime = current;

        Ball.ServerX = serverX;
        Ball.ServerY = serverY;
        PlayerOne.ServerY = playerOneY;
        PlayerTwo.ServerY = playerTwoY;
    };

    pongGame.client.reset = function (serverX, serverY) {
        Ball.X = serverX;
        Ball.Y = serverY;
    };

    $.connection.hub.start();
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});