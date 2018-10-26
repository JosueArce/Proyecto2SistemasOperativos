/*------------------------------------------------ PROGRAM INFORMATION ------------------------------------*/

// AUTHORS : 
// 			- JOSUÉ DAVID ARCE GONZÁLEZ
//			- DANIEL MONTERO CARVAJAL
//			- LUIS ANDRÉS FERNÁNDEZ CALDERÓN
// START DATE : THURSDAY 18th, 2018
// FINISH DATE : ?

/*---------------------------------------------------------------------------------------------------------*/

/*---------------------- AUDIOS --------------------------*/

var destruir = new Audio(reprMusica(1));
destruir.loop = false;

var disparo = new Audio(reprMusica(2));
disparo.loop = false;

var game_over = new Audio(reprMusica(3));
game_over.loop = false;

var juegoNormal = new Audio(reprMusica(4));
juegoNormal.loop = true;

var muerteEnemy = new Audio(reprMusica(5));
muerteEnemy.loop = false;

var muerteHeroe = new Audio(reprMusica(6));
muerteHeroe.loop = false;

var muerteObjeto = new Audio(reprMusica(7));
muerteObjeto.loop = false;

var pasoNivel = new Audio(reprMusica(8));
pasoNivel.loop = false;

var inicio = new Audio(reprMusica(9));
inicio.loop = false;

var disparoAHeroe = new Audio(reprMusica(10));
disparoAHeroe.loop = false;

var balaPared = new Audio(reprMusica(11));
balaPared.loop = false;

/*--------------------------------------------------------*/

/*---------------------- VARIABLES -----------------------*/

const socket = io.connect('http://localhost:5000', { 'forceNew': true });//connects to the server


var _matrixSize = 15;
var _logicMatrix = new Array(_matrixSize); //will lodged the matrix received by the server
var ARRIBA = 0; var ABAJO = 1; var IZQUIERDA = 2; var DERECHA = 3;//DIRECCIONES POSIBLES PARA MOVERSE

// Object identifiers
var BORDE = 0; var BLOQUENORMAL = 1; var EMPTYSPACE = 2; var OBJETIVO1 = 3; var OBJETIVO2 = 9;
var HEROE = 4; var ENEMY1 = 5; var BULLET = 6;
var ENEMY2 = 7; var ENEMY3 = 8;

var _PLAYER_ID = "";// Will be setted by the server after client connects

/*--------------------------------------------------------*/


/*---------------------- FUNCTIONS -----------------------*/

// Plays an audio in a determine moment
function reprMusica(opcion) {
    let audio;
    switch (opcion){
        case 1:
            audio = "sounds/destruirBloque.ogg";
            break;
        case 2:
            audio = "sounds/disparo.wav";
            break;
        case 3:
            audio = "sounds/game_over.ogg";
            break;
        case 4:
            audio = "sounds/juegoNormal.wav";
            break;
        case 5:
            audio = "sounds/muerteEnemy.wav";
            break;
        case 6:
            audio = "sounds/muerteHeroe.wav";
            break;
        case 7:
            audio = "sounds/muerteObjetivo.wav";
            break;
        case 8:
            audio = "sounds/pasoNivel.wav";
            break;
        case 9:
            audio = "sounds/stage_start.ogg";
            break;
        case 10:
            audio = "sounds/disparoAHeroe.wav";
            break;
        case 11:
            audio = "sounds/choquePared.wav";
            break;
    }
    return audio;
}

// Add an specific sprite to an specific cell of the matrix 
// Depending of the received matrix, each cell has an object with an ID to know which image set in it
function PaintMatrix(_ServerMatrix)
{
	let canvas = document.getElementById('scene');
    let context = canvas.getContext('2d');
    let H1 = false;H2 = false, H3 = false, H4 = false;

	for(var posX = 0; posX < _ServerMatrix.length; posX++)
	{
		for(var posY = 0; posY < _ServerMatrix[posX].Positions.length; posY++)
		{
			if(_ServerMatrix[posX].ID ===  EMPTYSPACE){
                context.drawImage(document.getElementById('empty'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === BORDE){
                context.drawImage(document.getElementById('borde'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === BLOQUENORMAL){
                context.drawImage(document.getElementById('bloque'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === OBJETIVO1 ){
                context.drawImage(document.getElementById('Objetivo1'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === OBJETIVO2){
                context.drawImage(document.getElementById('Objetivo2'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === HEROE){
                if(_ServerMatrix[posX].Positions[posY].number===1)
                {
                    switch (_ServerMatrix[posX].Positions[posY].Orientacion)
                    {
                        case 2://IZQUIERDA
                            context.drawImage(document.getElementById('heroeLeft'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 0://ARRIBA
                            context.drawImage(document.getElementById('heroeUp'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 1://ABAJO
                            context.drawImage(document.getElementById('heroeDown'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 3://DERECHA
                            context.drawImage(document.getElementById('heroeRight'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                    }
                }
                else if(_ServerMatrix[posX].Positions[posY].number===2)
                {
                    switch (_ServerMatrix[posX].Positions[posY].Orientacion)
                    {
                        case 2://IZQUIERDA
                            context.drawImage(document.getElementById('heroe2Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 0://ARRIBA
                            context.drawImage(document.getElementById('heroe2Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 1://ABAJO
                            context.drawImage(document.getElementById('heroe2Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 3://DERECHA
                            context.drawImage(document.getElementById('heroe2Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                    }
                }
                else if(_ServerMatrix[posX].Positions[posY].number===3)
                {
                    switch (_ServerMatrix[posX].Positions[posY].Orientacion)
                    {
                        case 2://IZQUIERDA
                            context.drawImage(document.getElementById('heroe3Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 0://ARRIBA
                            context.drawImage(document.getElementById('heroe3Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 1://ABAJO
                            context.drawImage(document.getElementById('heroe3Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 3://DERECHA
                            context.drawImage(document.getElementById('heroe3Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                    }
                }
                else if(_ServerMatrix[posX].Positions[posY].number===4)
                {
                    switch (_ServerMatrix[posX].Positions[posY].Orientacion)
                    {
                        case 2://IZQUIERDA
                            context.drawImage(document.getElementById('heroe4Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 0://ARRIBA
                            context.drawImage(document.getElementById('heroe4Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 1://ABAJO
                            context.drawImage(document.getElementById('heroe4Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                        case 3://DERECHA
                            context.drawImage(document.getElementById('heroe4Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                            break;
                    }
                }                
            }
            else if(_ServerMatrix[posX].ID === BULLET){
                context.drawImage(document.getElementById('bala'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
            }
            else if(_ServerMatrix[posX].ID === ENEMY1){
                switch (_ServerMatrix[posX].Positions[posY].Orientacion){
                    case 2://IZQUIERDA
                        context.drawImage(document.getElementById('enemy1Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 0://ARRIBA
                        context.drawImage(document.getElementById('enemy1Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 1://ABAJO
                        context.drawImage(document.getElementById('enemy1Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 3://DERECHA
                        context.drawImage(document.getElementById('enemy1Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                }
            }
            else if(_ServerMatrix[posX].ID === ENEMY2){
                switch (_ServerMatrix[posX].Positions[posY].Orientacion){
                    case 2://IZQUIERDA
                        context.drawImage(document.getElementById('enemy2Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 0://ARRIBA
                        context.drawImage(document.getElementById('enemy2Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 1://ABAJO
                        context.drawImage(document.getElementById('enemy2Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 3://DERECHA
                        context.drawImage(document.getElementById('enemy2Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                }
            }
            else if(_ServerMatrix[posX].ID === ENEMY3){
                switch (_ServerMatrix[posX].Positions[posY].Orientacion){
                    case 2://IZQUIERDA
                        context.drawImage(document.getElementById('enemy3Left'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 0://ARRIBA
                        context.drawImage(document.getElementById('enemy3Up'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 1://ABAJO
                        context.drawImage(document.getElementById('enemy3Down'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                    case 3://DERECHA
                        context.drawImage(document.getElementById('enemy3Right'), _ServerMatrix[posX].Positions[posY].x*47, _ServerMatrix[posX].Positions[posY].y*47);
                        break;
                }
            }
		}
	}
}

// Draw any object desired
function PaintObject(data,sprite)
{
	let canvas = document.getElementById('scene');
    let context = canvas.getContext('2d');
	// Paints the newest user into the matrix
	context.drawImage(document.getElementById(sprite), data.PosX*47, data.PosY*47);
}

/*--------------------------------------------------------*/


/*---------------------- SOCKET FUNCTIONS ----------------*/

// The first connection between client-server
socket.on('FirstConnection',function(data) {
	
	_PLAYER_ID = data.PLAYER_ID;
    document.getElementById('txtTankHeroe').textContent = data.tankNum;
});


// If a user disconnects by some reason this event will be  triggered
socket.on('UserDisconnected',function(data){
	swal(
        'RIP!',
        'Better luck next!',
        'error'
    );
    //juegoNormal.pause();
});

// Runs everytime server detects a new change in the main logic matrix
socket.on('GameChange',function(data){
	PaintMatrix(data.CURRENT_MATRIX);
});

socket.on('GameOver',function(data){
    if(data.result)
    {
        swal(
            'Game is Over!!',
            'Good bye!!',
            'error'
        );
    }
    else{
        swal(
            'You won!!',
            'Congratulations!!',
            'success'
        );
    }
    
    socket.emit('disconnect',null);
    juegoNormal.pause();
});


socket.on('PlaySound',function(data){
    switch(data.sound)
    {
        case "muerteHeroe":
            muerteHeroe.play();
            break;
        case "balaPared":
            balaPared.play();
            break;
        case "destruir":
            destruir.play();
            break;
        case "muerteEnemy":
            muerteEnemy.play();
            break;
        case "muerteObjeto":
            muerteObjeto.play();
            break;
        case "game_over":
            game_over.play();
            break;
        case "inicio":
            inicio.play();
            break;
        case "disparoAHeroe":
            disparoAHeroe.play();
            break;
        case "juegoNormal":
            juegoNormal.play();
            break;
    }
});

document.onkeydown = function (e) {
	var action = {orientacion:-1,shoot:false}
    switch (e.keyCode) {
        case 32://BARRA ESPACIADORA
            action.shoot = true; 
            break;
        case 37://IZQUIERDA
        	 action.orientacion = IZQUIERDA;
            break;
        case 38://ARRIBA
			 action.orientacion = ARRIBA;
            break;
        case 39://DERECHA
				 action.orientacion = DERECHA;
            break;
        case 40://ABAJO
				 action.orientacion = ABAJO;
            break;
    }
    if(action.shoot) socket.emit('PlayerShooted',{playerID:_PLAYER_ID});
    else if(action.orientacion !== -1) socket.emit('PlayerMoved',{moveProperties : action, playerID: _PLAYER_ID});
};

function init()
{
    inicio.play();juegoNormal.play();
}

/*--------------------------------------------------------*/