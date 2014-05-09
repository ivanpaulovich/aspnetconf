//
// The Pong Game is based on the tutorial available at http://yamiko.org/Blog/Lets-Build-a-HTML5-Game-Pong
// 
// We added multiplayer support through ASP.NET SignalR and we changed some graphics details
//

var debug = false;
var Width = 800;
var Height = 450;
var canvas = document.getElementById("game");
canvas.width = Width;
canvas.height = Height;
canvas.setAttribute('tabindex', 1);

var ctx = canvas.getContext("2d");
var keys = [];

//
// Game
//
var Paddle1 = new Paddle('left');
var Paddle2 = new Paddle();

//
// Interpolation tecnique
//
var lastTime = new Date();
var latency = 0.0;
var latencyFPS = 0;
var latencyFPSCounter = 0;

//
// Quadra
//
var Table = {
    FloorColor: 'white',
    LineColor: 'red',
    CenterSize: 50,

    //
    // Desenha o campo e as linhas no centro
    //
    Paint: function () {
        ctx.fillStyle = this.FloorColor;
        ctx.fillRect(0, 0, Width, Height);

        ctx.fillStyle = this.LineColor;
        ctx.strokeStyle = this.LineColor;

        ctx.fillRect((Width / 2) - 1, 0, 4, Height);

        ctx.beginPath();
        ctx.arc(Width / 2, Height / 2, this.CenterSize, 0, Math.PI * 2, false);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
};

//
// Disco
//
var Disk = {
    Radius: 20,
    Color: 'red',
    X: 0,
    Y: 0,
    ServerX: 0,
    ServerY: 0,
    DistY: 0,
    DistY: 0,

    //
    // Desenha o disco
    //
    Paint: function () {
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

    //
    // Devido a latencia entre o cliente e o servidor
    // é necessário interpolar a mudança de posição do objeto
    // durante o tempo que o cliente não tem conhecimento da posição 
    // correta calculada pelo servidor
    //
    Update: function (delta) {

        //
        // IMPORTANTE
        //
        // * Como exemplo:
        // Considere que a última latencia calculada é de 20ms
        // Considere que durante 20ms a tela é redesenhada 5x.
        //
        // Se no servidor o objeto tiver sido movido 10px durante esse tempo
        // Temos que interpolar essa distância de 10px ao longo de 5 passos
        //

        if (Math.abs(this.DistX) < 1) {
            this.DistX = 0;
            this.X = this.ServerX;
        }
        else
            this.X += this.DistX * delta;

        if (Math.abs(this.DistY) < 1) {
            this.DistY = 0;
            this.Y = this.ServerY;
        }
        else
            this.Y += this.DistY * delta;
    },

    //
    // Move o disco para a nova posição
    //
    Move: function (serverX, serverY) {
        this.ServerX = serverX;
        this.DistX = this.ServerX - this.X;

        this.ServerY = serverY;
        this.DistY = this.ServerY - this.Y;
    }
};

//
// Pá
//
function Paddle(position) {
    this.Width = 20;
    this.Height = 100;
    this.X = 0;
    this.Y = 0;
    this.DistY = 0;
    this.ServerY = 0;

    if (position == 'left') {
        this.Color = 'blue';
        this.X = 5;
    }
    else {
        this.Color = 'green';
        this.X = Width - this.Width - 5;
    }

    //
    // Desenha a pá
    //
    this.Paint = function () {
        ctx.fillStyle = this.Color;
        ctx.fillRect(this.X, this.Y, this.Width, this.Height);

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

    //
    // Devido a latencia entre o cliente e o servidor
    // é necessário interpolar a mudança de posição do objeto
    // durante o tempo que o cliente não tem conhecimento da posição 
    // correta calculada pelo servidor
    //
    this.Update = function (delta) {
        if (Math.abs(this.DistY) < 1) {
            this.DistY = 0;
            this.Y = this.ServerY;
        }
        else
            this.Y += this.DistY * delta;
    };

    //
    // Move o objeto para a nova posição
    //
    this.Move = function (serverY) {
        this.ServerY = serverY;
        this.DistY = this.ServerY - this.Y;
    };
};

//
// Chama as funções de renderização
//
function Paint() {
    ctx.beginPath();
    Table.Paint();
    Paddle1.Paint();
    Paddle2.Paint();
    Disk.Paint();
}

//
// Essa função é chamada sempre que navegador pode renderizar novos objetos
// A frequência com que essa função é chamada muito maior 
// a frequência com que nos comunicamos com o servidor
//
function Loop() {
    init = requestAnimFrame(Loop);

    CaptureInput();

    //
    // Tratamento para evitar divisão por zero
    //
    if (latencyFPS == 0)
        latencyFPS = 1;

    Disk.Update(1 / latencyFPS);
    Paddle1.Update(1 / latencyFPS);
    Paddle2.Update(1 / latencyFPS);

    Paint();

    if (debug) {
        ctx.fillStyle = 'black';
        ctx.textAlign = "left";
        ctx.fillText("Latency FPS: " + latencyFPS, 5, Height - 30);
        ctx.fillText("Latency " + latency, 5, Height - 15);
    }

    latencyFPSCounter++;
};

//
// Inicia um novo jogo
// 
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
        latency = currentTime - lastTime;
        lastTime = currentTime;

        latencyFPS = latencyFPSCounter;
        latencyFPSCounter = 0;

        //
        // Movimenta o jogador
        //
        Disk.Move(diskX, diskY);
        Paddle1.Move(paddle1Y);
        Paddle2.Move(paddle2Y);

        //
        // Se necessário executa os sons
        //
        if (table)
            $('#tableMP3')[0].play();

        if (paddle)
            $('#paddleMP3')[0].play();

        if (reset)
            $('#resetMP3')[0].play();
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
// Retorna uma função que será chamada todas as vezes que a tela for renderizada
//
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function (callback) { return window.setTimeout(callback, 1000 / 60); };
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