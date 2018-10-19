/*------------------------------------------------ PROGRAM INFORMATION ------------------------------------*/

// AUTHORS : 
// 			- JOSUÉ DAVID ARCE GONZÁLEZ
//			- DANIEL MONTERO CARVAJAL
//			- LUIS ANDRÉS FERNÁNDEZ CALDERÓN
// START DATE : THURSDAY 18th, 2018
// FINISH DATE : ?

/*---------------------------------------------------------------------------------------------------------*/

/*------------- IMPORTS ----------------*/
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const http = require('http');

const bala = require('./bala');
const bloque = require('./bloque');
const bloqueBarrera = require('./bloqueBarrera');
const objetivos = require('./objetivos');
const Tank = require('./Tank');
const tankEnemy1 = require('./tankEnemy1');
const tankEnemy2 = require('./tankEnemy2');
const tankEnemy3 = require('./tankEnemy3');
const tankHeroe = require('./tankHeroe');
const espacioLibre = require('./espacioLibre');
const User = require('./user');
/*--------------------------------------*/

/*------------- MIDDLEWARE -------------*/

app.use(express.static('Client'));

/*--------------------------------------*/

/*------------ VARIABLES ---------------*/

const _GameRoom = 'GameRoom'; //id of main room where players will be lodged
var _matrixSize = 15; var _logicMatrix = new Array(_matrixSize); //will lodged the matrix received by the server
// Object identifiers
var BORDE = 0; var BLOQUENORMAL = 1; var EMPTYSPACE = 2; var OBJETIVO1 = 3; var OBJETIVO2 = 9;
var HEROE = 4; var ENEMY1 = 5; var BULLET = 6; var ENEMY2 = 7; var ENEMY3 = 8;
var cantidadMaxBloques = 50; var totalObjetivos = 2; var totalEnemigos = 3;  var cantidadEnemigosVivos = 0;

//Orientation
var ARRIBA = 0; var ABAJO = 1; var IZQUIERDA = 2; var DERECHA = 3;

// Threats
var intervalo; var hiloEnemy1, hiloEnemy2y3, hiloBalasEnemy1; 
var EnemyList2y3 = [], EnemyList1 = [], bulletList = []; var disparoEnemigo; 
var refreshPantalla;

var heroe;//INSTANCIA DEL HEROE GLOBAL -- test
var tankesEnemigos = [];//Lodge enemy instances
var playersOnline = []; //Lodged instances of players online
const max_players_allowed = 4;

// Game state
var finJuego = false; var GameChanged = false;

/*--------------------------------------*/

/*----------- ROUTES -------------------*/

// GAME ROUTE FOR NEW USERS
app.get('/Client',function(error,response) {
	response.sendFile(path.resolve(__dirname + '/../Client/index.html'));
});

/*--------------------------------------*/

/*-------------- FUNCTIONS -------------*/

// First method to be execute
function StartGame()
{
	CreateMatrix();
}

// Creates the default matrix
function CreateMatrix()
{
	for(let x = 0; x < _matrixSize; x++){
        _logicMatrix[x] = new Array(_matrixSize);//Works to create a bidemensional array -> [][] <-
        for(let y = 0; y < _matrixSize; y++){
            if(x === _matrixSize -1 || y === _matrixSize - 1 || x === 0 || y === 0)
                setObject(x,y, new bloqueBarrera(this,BORDE)); // ELEMENTO BARRERA
            else
                setObject(x,y,new espacioLibre(this,EMPTYSPACE));//ALL THE OTHERS ARE EMPTY SPACES
        }
    }

    /*PERMITE CREAR LOS BLOQUES DESTRUCTIBLES*/
    while(cantidadMaxBloques > 0){
        posX = generarPosicionAleatoria();
        posY = generarPosicionAleatoria();//SE GENERAN POSICIONES AL AZAR ENTRE 0 Y 10(TAMAÑO MATRIZ)
        if(getObject(posX,posY).espacioLibre()){
           setObject(posX,posY,new bloque(posX,posY,this,BLOQUENORMAL)); //SE AGREGA EL OBJETO BLOQUE
            cantidadMaxBloques--;
        }
    }

    /*CREAR OBJETIVOS*/
    let objetivo1Usado = false; let objetivo2Usado = false;
    while(totalObjetivos>0){
        posX = generarPosicionAleatoria();
        posY = generarPosicionAleatoria();
        if(getObject(posX,posY).espacioLibre()){
            if(!objetivo1Usado){
                setObject(posX,posY,new objetivos(posX,posY,this,OBJETIVO1,1));
                objetivo1Usado=true;
                totalObjetivos--;
            }
            else if(!objetivo2Usado){
                setObject(posX,posY,new objetivos(posX,posY,this,OBJETIVO2,2));
                objetivo2Usado=true;
                totalObjetivos--;
            }
        }
    }
    totalObjetivos = 2;
    //document.getElementById("txtObjetivos").textContent = totalObjetivos;

    /*CREAR ENEMIGOS LA PRIMERA VEZ*/
    let usoEnemy1 = false; let usoEnemy2 = false; let usoEnemy3 = false;
    while(totalEnemigos > 0){
        posX = generarPosicionAleatoria();
        posY = generarPosicionAleatoria();
        if(getObject(posX,posY).espacioLibre()){
            if(!usoEnemy1){
                setObject(posX,posY,new tankEnemy1(posX,posY,1,this,ENEMY1));
                EnemyList1.push(getObject(posX,posY));
                usoEnemy1=true;
            }
            else if(!usoEnemy2){
                setObject(posX,posY,new tankEnemy2(posX,posY,3,this,ENEMY2));
                EnemyList2y3.push(getObject(posX,posY));
                usoEnemy2=true;
            }
            else if(!usoEnemy3){
                setObject(posX,posY,new tankEnemy3(posX,posY,this,ENEMY3,2));
                EnemyList2y3.push(getObject(posX,posY));
                usoEnemy3=true;
            }
            totalEnemigos--;
        }
    }
    totalEnemigos=3;
    //document.getElementById("txtTanksEnemy").textContent = totalEnemigos;
    return _logicMatrix;
}

// Returns current matrix
function getCurrentMatrix()
{
	return _logicMatrix;
}

// Set an specific object in an specific cell
function setObject(posX,posY,objetoNuevo){
    _logicMatrix[posX][posY] = objetoNuevo;
}

// Returns an specific cell of the _logicMatrix
function getObject(posX,posY) {
    return _logicMatrix[posX][posY];
}

// Generates random numbers between 0 and 15
function generarPosicionAleatoria(){
    return Math.floor((Math.random() * 14) + 1);
}

// Method to make a pause between moves
function sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

//Gets an specific heroe
function getUserHeroe(userId) {
	for(var index = 0; index < playersOnline.length;index++)
	{
		if(playersOnline[index].getID == userId)
			return playersOnline[index];
	}
}

// Distribuite the positions depending of the object
function TransformArrayToJSONAux(objectID)
{
	var tempArray = [];
	for(var posX = 0; posX < _matrixSize; posX++)
	{
		for(var posY = 0; posY < _matrixSize;posY++)
		{
			switch(true)
			{
				case objectID === getObject(posX,posY).getID && objectID === BORDE:
					tempArray.push({x:posX,y:posY})
					break;
				case objectID === getObject(posX,posY).getID && objectID === BLOQUENORMAL:
					tempArray.push({x:posX,y:posY})
					break;
				case objectID === getObject(posX,posY).getID && objectID === EMPTYSPACE:
					tempArray.push({x:posX,y:posY})
					break;
				case objectID === getObject(posX,posY).getID && objectID === BULLET:
					tempArray.push({x:posX,y:posY})
					break;
				case objectID === getObject(posX,posY).getID && objectID === HEROE:
					tempArray.push({x:posX,y:posY, Orientacion : getObject(posX,posY).getOrientacion})
					break;
				case objectID === getObject(posX,posY).getID && objectID === ENEMY1:
					tempArray.push({x:posX,y:posY, Orientacion : getObject(posX,posY).getOrientacion})
					break;
				case objectID === getObject(posX,posY).getID && objectID === ENEMY2:
					tempArray.push({x:posX,y:posY, Orientacion : getObject(posX,posY).getOrientacion})
					break;
				case objectID === getObject(posX,posY).getID && objectID === ENEMY3:
					tempArray.push({x:posX,y:posY, Orientacion : getObject(posX,posY).getOrientacion})
					break;
				case objectID === getObject(posX,posY).getID && objectID === OBJETIVO1:
					tempArray.push({x:posX,y:posY})
					break;
				case objectID === getObject(posX,posY).getID && objectID === OBJETIVO2:
					tempArray.push({x:posX,y:posY})
					break;
			}
		}
	}
	return tempArray;
}

// Calls the TransformArrayToJSONAux 
function TransformArrayToJSON()
{
	var tempArray = [];

	tempArray.push({ID:BLOQUENORMAL, Positions : TransformArrayToJSONAux(BLOQUENORMAL)});
	tempArray.push({ID:BORDE, Positions : TransformArrayToJSONAux(BORDE)});
	tempArray.push({ID:EMPTYSPACE, Positions : TransformArrayToJSONAux(EMPTYSPACE)});
	tempArray.push({ID:BULLET, Positions : TransformArrayToJSONAux(BULLET)});
	tempArray.push({ID:ENEMY1, Positions : TransformArrayToJSONAux(ENEMY1)});
	tempArray.push({ID:ENEMY2, Positions : TransformArrayToJSONAux(ENEMY2)});
	tempArray.push({ID:ENEMY3, Positions : TransformArrayToJSONAux(ENEMY3)});
	tempArray.push({ID:HEROE, Positions : TransformArrayToJSONAux(HEROE)});
	tempArray.push({ID:OBJETIVO1, Positions : TransformArrayToJSONAux(OBJETIVO1)});
	tempArray.push({ID:OBJETIVO2, Positions : TransformArrayToJSONAux(OBJETIVO2)});

	return tempArray;
}

// Finds a position in the matrix to place the new user
function PlaceUserInMap()
{
	while(true){
        posX = generarPosicionAleatoria();
        posY = generarPosicionAleatoria();//SE GENERAN POSICIONES AL AZAR ENTRE 0 Y 10(TAMAÑO MATRIZ)
        if(getObject(posX,posY).espacioLibre()){
           setObject(posX,posY,new tankHeroe(posX,posY,this,HEROE)); //SE AGREGA EL NUEVO TANKE
           GameChanged = true;
           return {x:posX, y: posY}
        }
    }
}

// Moves the players tank
function MovedPlayer(player)
{
	heroe = getUserHeroe(player.playerID).getTank;

    //VA AGREGAR UN ESPACIO VACIO EN DONDE SE ENCONTRABA EL HEROE, O SEA SE VA EMPEZAR A MOVER
    setObject(heroe.getPosX,heroe.getPosY,new espacioLibre(this));

    if(player.moveProperties.orientacion === ARRIBA){
        heroe.setOrientacion = ARRIBA;
        if(getObject(heroe.getPosX,heroe.getPosY-1).espacioLibre()){
            heroe.setPosY = heroe.getPosY-1;
        }
    }
    if(player.moveProperties.orientacion === ABAJO){
        heroe.setOrientacion = ABAJO;
        if(getObject(heroe.getPosX,heroe.getPosY+1).espacioLibre()){
            heroe.setPosY = heroe.getPosY+1;
        }
    }
    if(player.moveProperties.orientacion === IZQUIERDA){
        heroe.setOrientacion = IZQUIERDA;
        if(getObject(heroe.getPosX-1,heroe.getPosY).espacioLibre()){
            heroe.setPosX = heroe.getPosX-1;
        }
    }
    if(player.moveProperties.orientacion === DERECHA){
        heroe.setOrientacion = DERECHA;
        if(getObject(heroe.getPosX+1,heroe.getPosY).espacioLibre()){
            heroe.setPosX  = heroe.getPosX+1;
        }
    }
    //ACTUALIZA LA POSICIÓN DEL HEROE
    setObject(heroe.getPosX,heroe.getPosY,this);
    GameChanged = true;
}

// Runs the list of players online checking if they still alive 
// In case that any user lost his live it'll be remove from the list
// And will be notified about it
function CheckPlayersState()
{
	for(var index = 0;index < playersOnline.length;index++)
	{
		if(!playersOnline[index].getState)
		{
			io.sockets.socket(playersOnline[index].getID).emit('PlayerDied', {"PosX":playersOnline[index].getTank.getPosX,"PosY":playersOnline[index].getTank.getPosY});
			playersOnline.splice(index,1);
		}
	}
}

function DetectChanges()
{
	if(GameChanged)
	{
		io.sockets.emit('GameChange', {CURRENT_MATRIX:TransformArrayToJSON()});
		GameChanged = false;
	}
}

setInterval(function(){
	DetectChanges();
	CheckPlayersState();
},800);

/*--------------------------------------*/

/*-------- SOCKET FUNCTIONS ------------*/

io.on('connection', function(socket){
	if(playersOnline.length <4)
	{

		var newPosUser = PlaceUserInMap();

		playersOnline.push(new User(socket.id,newPosUser.x,newPosUser.y,getObject(newPosUser.x,newPosUser.y)));

		socket.emit('FirstConnection', { PLAYER_ID : socket.id, CURRENT_MATRIX : TransformArrayToJSON()});

		console.log(socket.id + ' has connected!' + " #: "+playersOnline.length);
	}

	socket.on('PlayerMoved',function(data){
		MovedPlayer(data);
	});

	socket.on('disconnect',function(){
		for(var index = 0;index < playersOnline.length;index++)
		{
			if(playersOnline[index].getID === socket.id)
			{
				socket.broadcast.emit('DisconnectUser', {"PosX":playersOnline[index].getPosX,"PosY":playersOnline[index].getPosY});
				playersOnline.splice(index,1);
			}
		}
		console.log(socket.id + ' disconnected!' + " #: "+playersOnline.length);
	});
});

/*--------------------------------------*/

/*--------------------------------------*/

server.listen(5000,function(){
	console.log('Servidor corriendo en http://localhost:5000');
	StartGame();
});
/*--------------------------------------*/