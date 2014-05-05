//canvas
var Width = 800;
var Height = 450;
var canvas = document.getElementById("game");
canvas.width = Width;
canvas.height = Height;
canvas.setAttribute('tabindex', 1);
var ctx = canvas.getContext("2d");
var FPS = 1000 / 60;

var BG = {
	Color: '#333',
	Paint: function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(0, 0, Width, Height);
	}
};

var Ball = {
	Radius: 5,
	Color: '#999',
	X: 0,
	Y: 0,
	VelX: 0,
	VelY: 0,
	
	Paint: function(){
		ctx.beginPath();
		ctx.fillStyle = this.Color;
		ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
		ctx.fill();
		this.Update();
	},
	
	Update: function(){
		this.X += this.VelX;
		this.Y += this.VelY;
	},
			
	Reset: function(){
		this.X = Width/2;
		this.Y = Height/2;
		this.VelX = (!!Math.round(Math.random() * 1) ? 1.5 : -1.5);
		this.VelY = (!!Math.round(Math.random() * 1) ? 1.5 : -1.5);
	}
};

function Paddle(position){
	this.Color = '#999';
	this.Width = 5;
	this.Height = 100;
	this.X = 0;
	this.Y = Height/2 - this.Height/2;
	this.Score = 0;
	
	if(position == 'left')
		this.X = 0;
	else this.X = Width - this.Width;
	
	this.Paint = function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(this.X, this.Y, this.Width, this.Height);
		ctx.fillStyle = this.Color;
		ctx.font = "normal 10pt Calibri";
		if(position == 'left'){
			ctx.textAlign = "left";
			ctx.fillText("score: " + PlayerOne.Score, 10, 10);
		}else{
			ctx.textAlign = "right";
			ctx.fillText("score: " + PlayerTwo.Score, Width - 10, 10);
		}
	};
	
	this.IsCollision = function () {
		if (Ball.X - Ball.Radius > this.Width + this.X || this.X > Ball.Radius * 2 + Ball.X - Ball.Radius) 
			return false;
		if (Ball.Y - Ball.Radius > this.Height + this.Y || this.Y > Ball.Radius * 2 + Ball.Y - Ball.Radius) 
			return false;
	  return true;
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
var PlayerOne = new Paddle();
var PlayerTwo = new Paddle('left');

//event listener
function MouseMove(e) {
    var pongGame = $.connection.pongGameHub;
    var vPos = e.pageY - PlayerOne.Height / 2;

    pongGame.server.movePlayerOne(vPos)
}

function Paint(){
	ctx.beginPath();
	BG.Paint();
	PlayerOne.Paint();
	PlayerTwo.Paint();
	Ball.Paint();
}

function Loop() {
    init = requestAnimFrame(Loop);
    Paint();
};

function GameOver(win){
	BG.Paint();
	ctx.fillStyle = "#999";
	ctx.font = "bold 40px Calibri";
	ctx.textAlign = "center";
	ctx.fillText((win ? "A WINNER IS YOU" : "GAME OVER"), Width/2, Height/2);
	ctx.font = "normal 16px Calibri";
	ctx.fillText("refresh to reply", Width/2, Height/2 + 20);
}

function NewGame(){
	Ball.Reset();
	PlayerOne.Score = 0;
	PlayerTwo.Score = 0;
	Loop();

    //attache event
	canvas.addEventListener("mousemove", MouseMove, true);
}

$(function () {
    var pongGame = $.connection.pongGameHub;

    pongGame.client.UpdatePositionPlayerOne = function (vPos) {
        debugger;
        PlayerOne.Y = vPos;
    };

    pongGame.client.UpdatePositionPlayerOne = function (vPos) {
        debugger;
        PlayerTwo.Y = vPos;
    };

    NewGame();

    $.connection.hub.start();
});