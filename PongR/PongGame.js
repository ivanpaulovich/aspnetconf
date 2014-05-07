var debug = false;
var Width = 800;
var Height = 450;
var canvas = document.getElementById("game");
canvas.width = Width;
canvas.height = Height;
canvas.setAttribute('tabindex', 1);

var ctx = canvas.getContext("2d");
var FPS = 1000 / 60; // FPS desejado em caso de usar o setInterval
var keys = [];

//game
var Paddle1 = new Paddle('left');
var Paddle2 = new Paddle();
var lastRenderTime = new Date();
var elapsedUpdateTime;
var lastTime = new Date();
var delayTime = 0.0;
var FPS = 0;
var countFPS = 0;

var Table = {
    Color: 'white',

	Paint: function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(0, 0, Width, Height);

		ctx.fillStyle = 'red';
		ctx.fillRect((Width / 2) - 1, 0, 4, Height);

		ctx.beginPath();
		ctx.fillStyle = 'red';
		ctx.arc(Width / 2, Height / 2, 50, 0, Math.PI * 2, false);
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'red';
		ctx.stroke();
	}
};

var Disk = {
	Radius: 20,
	Color: 'red',
	X: 0,
	Y: 0,
	ServerX: 0,
	ServerY: 0,
	DistY: 0,
    DistY: 0,
	
	Paint: function(){
	    ctx.beginPath();

		ctx.fillStyle = this.Color;
		ctx.arc(this.X, this.Y, this.Radius, 0, Math.PI * 2, false);
		ctx.fill();

		if (debug) {
		    ctx.fillStyle = 'black';
		    ctx.textAlign = "left";
		    ctx.fillText("Y: " + this.Y, Width / 2, 10);
		    ctx.fillText("ServerY: " + this.ServerY, Width / 2, 25);
		    ctx.fillText("VelY: " + this.VelY, Width / 2, 40);
		}
	},

	Update: function (delta) {
	    var distX = this.ServerX - this.X;

	    if (Math.abs(distX) < 1) {
	        this.DistX = 0;
	        this.X = this.ServerX;
	    }
	    else
	        this.X += this.DistX / (delta != 0 ? delta : 1);

	    var distY = this.ServerY - this.Y;

	    if (Math.abs(distY) < 1)
	    {
	        this.DistY = 0;
	        this.Y = this.ServerY;
	    }
	    else
	        this.Y += this.DistY / (delta != 0 ? delta : 1);
	},

	Move: function (serverX, serverY) {
	    this.ServerX = serverX;
	    var distX = this.ServerX - this.X;
	    this.DistX = distX;

	    this.ServerY = serverY;
	    var distY = this.ServerY - this.Y;
	    this.DistY = distY;
	}
};

function Paddle(position){
	this.Width = 20;
	this.Height = 100;
	this.X = 0;
	this.Y = 0;
	this.DistY = 0;
	this.ServerY = 0;

	if (position == 'left')
	{
	    this.Color = 'blue';
	    this.X = 5;
	}
	else
	{
	    this.Color = 'green';
	    this.X = Width - this.Width - 5;
	}

	this.Paint = function(){
		ctx.fillStyle = this.Color;
		ctx.fillRect(this.X, this.Y, this.Width, this.Height);
		ctx.fillStyle = this.Color;

		if (debug) {
		    ctx.fillStyle = 'black';
		    ctx.font = "normal 10pt Calibri";

		    if (position == 'left') {
		        ctx.textAlign = "left";
		        ctx.fillText("Y: " + this.Y, this.X, 10);
		        ctx.fillText("VelY: " + this.VelY, this.X, 25);
		    }
		    else {
		        ctx.textAlign = "right";
		        ctx.fillText("Y: " + this.Y, this.X + this.Width, 10);
		        ctx.fillText("VelY: " + this.DistY, this.X + this.Width, 25);
		    }
		}
	};

	this.Update = function (delta) {
	    var distY = this.ServerY - this.Y;

	    if (Math.abs(distY) < 1)
	    {
	        this.DistY = 0;
	        this.Y = this.ServerY;
	    }
	    else
	        this.Y += this.DistY / (delta != 0 ? delta : 1);
	};

	this.Move = function (serverY) {
	    this.ServerY = serverY;
	    var distY = this.ServerY - this.Y;
	    this.DistY = distY;
	};
};

function Paint(){
	ctx.beginPath();
	Table.Paint();
	Paddle1.Paint();
	Paddle2.Paint();
	Disk.Paint();
}

function Loop() {
    init = requestAnimFrame(Loop);

    countFPS++;

    CaptureInput();

    Disk.Update(FPS);
    Paddle1.Update(FPS);
    Paddle2.Update(FPS);

    Paint();

    if (debug) {
        ctx.fillStyle = 'black';
        ctx.textAlign = "left";
        ctx.fillText("FPS: " + FPS, 5, Height - 30);
        ctx.fillText("Delay " + delayTime, 5, Height - 15);
    }
};

function NewGame() {

    //
    // Define que o servidor pode chamar as operações "updatePositions" e "reset"
    //
    var pongGame = $.connection.pongGameHub;

    pongGame.client.updatePositions = function (diskX, diskY, paddle1Y, paddle2Y, table, paddle, reset) {

        //
        // Cálculo de tempo gasto para trocar mensagens com o servidor
        //
        var currentTime = new Date();
        delayTime = currentTime - lastTime;
        lastTime = currentTime;

        FPS = countFPS;
        countFPS = 0;

        Disk.Move(diskX, diskY);
        Paddle1.Move(paddle1Y);
        Paddle2.Move(paddle2Y);

        if (table)
            document.getElementById('tableMP3').play();

        if (paddle)
            document.getElementById('paddleMP3').play();

        if (reset)
            document.getElementById('resetMP3').play();
    };

    pongGame.client.reset = function (diskX, diskY) {
        Disk.X = diskX;
        Disk.Y = diskY;

        Loop();
    };

    //
    // Inicia a comunicação
    //
    $.connection.hub.start();
}

//
// Captura todas as teclas 
//

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

//
// Captura a função do navegador que é chamada todas as vezes que 
// algo pode ser desenhado na tela
//
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