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

var BALAHEROE = 0;  var BALAENEMIGO = 1;//BALAS PARA CADA TIPO DE TANKE

//Orientation
var ARRIBA = 0; var ABAJO = 1; var IZQUIERDA = 2; var DERECHA = 3;

// Threats
var intervalo; var hiloEnemy1, hiloEnemy2y3, hiloBalasEnemy1;  var mainThread;
var EnemyList2y3 = [], EnemyList1 = [], bulletList = []; var disparoEnemigo; var current_enemies=0;
var intervaloCreateEnemy;

var heroe;//INSTANCIA DEL HEROE GLOBAL -- test
var tankesEnemigos = [];//Lodge enemy instances
var playersOnline = []; //Lodged instances of players online
const max_players_allowed = 4;

// Game state
var finJuego = false; var GameChanged = false;

var J1 = false, J2 = false, J3 = false, J4 = false;

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

// Decrease the ammount of objectives
function RestarObjetivos() {
    totalObjetivos--;
}

function stopGame()
{
    clearInterval(intervaloCreateEnemy);
    clearInterval(mainThread);
    clearInterval(hiloEnemy1);
    clearInterval(hiloEnemy2y3);
}

// Check if the game is over
// This means if the total of objetives reach 0 or all the players were killed
function CheckGameState() {
   if( playersOnline.length === 0) 
   {
        stopGame(); 
        emitSound("game_over");
        return 1;
   }  
   else if(totalEnemigos === 0 || totalObjetivos === 0) {stopGame(); return 2;}
   return 0;
}

// Delete enemy's tank from the matrix
function borrarEnemigo(tanke,estado) {
    if(estado === 1){
        for(item in EnemyList2y3){
            if(tanke === EnemyList2y3[item]){
                EnemyList2y3.splice(item,1);
            }
        }
    }
    else{
        for(item in EnemyList1){
            if(tanke === EnemyList1[item]){
                EnemyList1.splice(item,1);
            }
        }
    }
    totalEnemigos--;
    GameChanged = true;
}

// Create a new enemy tank and add it to the matrix
function addNewEnemy(){
    let posX = generarPosicionAleatoria();
    let posY = generarPosicionAleatoria();
    let tankType = Math.floor((Math.random() * 3) + 1); // numero random (1, 2, 3)
    if(totalEnemigos < 6)
    {
        if(getObject(posX,posY).espacioLibre())
        {//BARRERA
            if(tankType === 1)
            {
                setObject(posX,posY, new tankEnemy1(posX,posY,1,this,ENEMY1));// listo
                EnemyList1.push(getObject(posX,posY));
            }
            else if(tankType === 2){
                setObject(posX,posY, new tankEnemy2(posX,posY,3,this, ENEMY2));
                EnemyList2y3.push(getObject(posX,posY));
            }
            else{
                setObject(posX,posY, new tankEnemy3(posX,posY, this,ENEMY3,2));
                EnemyList2y3.push(getObject(posX,posY));
            }
            totalEnemigos++;
            //document.getElementById("txtTanksEnemy").textContent = totalEnemigos;
        }
        else{
            addNewEnemy();
        }
    }
}

// Takes out bullet linked to an user from the matrix
function RemoveBulletsMatrix(tanke) {
    var state = true;
    var temp = setTimeout(function(){
        for(let x = 0; x < _matrixSize; x++){
            for(let y = 0; y < _matrixSize; y++){
                if(getObject(x,y).getID === tanke){
                    setObject(x,y,new espacioLibre(this,EMPTYSPACE));
                    //sleep(10000);
                    GameChanged = true;
                }
            }
        }
        clearTimeout(temp);
    },50);
}

// Enemies search for users around the matrix
function SearchUsers(orientacion,posX,posY) {
    let result = false;
    if(orientacion === ARRIBA){
        for(let x = 0;x <_matrixSize;x++){
            for(let y =0;y<_matrixSize;y++){
                posY--;
                if(posY > 0 && getObject(posX,posY)._ID === HEROE){
                    result = true;
                }
            }
        }
    }
    else if(orientacion === ABAJO){
        for(let x = 0;x <_matrixSize;x++){
            for(let y =0;y<_matrixSize;y++){
                posY++;
                if(posY < _matrixSize-1 && getObject(posX,posY)._ID === HEROE){
                    result = true;
                }
            }
        }
    }
    else if(orientacion === IZQUIERDA){
        for(let x = 0;x <_matrixSize;x++){
            for(let y =0;y<_matrixSize;y++){
                posX--;
                if(posX > 0 && getObject(posX,posY)._ID === HEROE){
                    result = true;
                }
            }
        }
    }
    else if(orientacion === DERECHA){
        for(let x = 0;x <_matrixSize;x++){
            for(let y =0;y<_matrixSize;y++){
                posX++;
                if(posX < _matrixSize-1 &&  getObject(posX,posY)._ID === HEROE){
                    result = true;
                }
            }
        }
    }
    return result;
}

//Gets an specific heroe
function getUserHeroeTank(userid) {

	for(var index = 0; index < playersOnline.length;index++)
	{
		if(playersOnline[index].getID == userid)
			return playersOnline[index].getTank;
	}
}

//Gets an specific ID
function getUserHeroe(userid) {

    for(var index = 0; index < playersOnline.length;index++)
    {
        if(playersOnline[index].getID == userid)
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
					tempArray.push({x:posX,y:posY, Orientacion : getObject(posX,posY).getOrientacion, number:getObject(posX,posY).getNumOfPlayer})
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

function getPlayersID()
{
    var temp = [];
    for(let i = 0;i<playersOnline.length;i++)
    {
        temp.push({ID:playersOnline[i].getID});
    }
    return temp;
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
function PlaceUserInMap(userid,numOfPlayer)
{
	while(true){
        posX = generarPosicionAleatoria();
        posY = generarPosicionAleatoria();//SE GENERAN POSICIONES AL AZAR ENTRE 0 Y 10(TAMAÑO MATRIZ)
        if(getObject(posX,posY).espacioLibre()){
           setObject(posX,posY,new tankHeroe(posX,posY,this,HEROE,userid,numOfPlayer)); //SE AGREGA EL NUEVO TANKE
           GameChanged = true;
           return {x:posX, y: posY}
        }
    }
}

// Moves the players tank
function MovedPlayer(player)
{
	heroe = getUserHeroeTank(player.playerID);

    //VA AGREGAR UN ESPACIO VACIO EN DONDE SE ENCONTRABA EL HEROE, O SEA SE VA EMPEZAR A MOVER
    setObject(heroe.getPosX,heroe.getPosY,new espacioLibre(this,EMPTYSPACE));

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
    setObject(heroe.getPosX,heroe.getPosY,heroe);
    GameChanged = true;
}

// Remove the tank linked to an specific user
// Then the matrix is render in all the users
function DeleteTank(userID)
{
    for(var index = 0;index < playersOnline.length;index++)
    {
       if(playersOnline[index].getID === userID)
       {
            setObject(playersOnline[index].getTank.getPosX,playersOnline[index].getTank.getPosY, new espacioLibre(this,EMPTYSPACE));
            playersOnline.splice(index,1);
            GameChanged = true;
       }
    }
}

function getRandomUser() {
    if(playersOnline.length === 0) return playersOnline[0].getID;
    else return playersOnline[Math.floor(Math.random() * (playersOnline.length-1 + 1))].getID;
}

// Allows the user to shoot
function dispararHeroe(posX,posY,pertenece,orientacion) {
    emitSound("disparoAHeroe");
    if (orientacion === ARRIBA) {
        if (getObject(posX,posY-1)._ID === EMPTYSPACE) {
            setObject(posX, posY - 1, new bala(posX, posY - 1, orientacion, pertenece, this, BULLET));
            getObject(posX,posY-1).run();
        }
        else if (getObject(posX,posY-1)._ID === BLOQUENORMAL) {
            setObject(posX, posY - 1, new espacioLibre(this,EMPTYSPACE));
            //destruir.play();
            emitSound('destruir');
        }
        else if(
            getObject(posX,posY-1)._ID === ENEMY1 ||
            getObject(posX,posY-1)._ID === ENEMY2 ||
            getObject(posX,posY-1)._ID === ENEMY3 ||
            getObject(posX,posY-1)._ID === OBJETIVO1 ||
            getObject(posX,posY-1)._ID === OBJETIVO2)
        {
            getObject(posX,posY-1).eliminar();
        }
        else{
            //balaPared.play();
            emitSound('balaPared');
        }
    }
    else if (orientacion === ABAJO) {
        if (getObject(posX,posY+1)._ID === EMPTYSPACE) {
            setObject(posX, posY + 1, new bala(posX, posY + 1, orientacion, pertenece, this,BULLET));
            getObject(posX,posY+1).run();
        }
        else if (getObject(posX,posY+1)._ID === BLOQUENORMAL) {
            setObject(posX, posY + 1, new espacioLibre(this,EMPTYSPACE));
            //destruir.play();
            emitSound('destruir');
        }
        else if(
            getObject(posX,posY+1)._ID === ENEMY1 ||
            getObject(posX,posY+1)._ID === ENEMY2 ||
            getObject(posX,posY+1)._ID === ENEMY3 ||
            getObject(posX,posY+1)._ID === OBJETIVO1 ||
            getObject(posX,posY+1)._ID === OBJETIVO2)
        {
            getObject(posX,posY+1).eliminar();
        }
        else{
            //balaPared.play();
            emitSound('balaPared');
        }
    }
    else if (orientacion === IZQUIERDA) {
        if (getObject(posX-1,posY)._ID === EMPTYSPACE) {
            setObject(posX - 1, posY, new bala(posX - 1, posY, orientacion, pertenece, this,BULLET));
            getObject(posX-1,posY).run();
        }
        else if (getObject(posX-1,posY)._ID === BLOQUENORMAL) {
            setObject(posX - 1, posY, new espacioLibre(this,EMPTYSPACE));
            //destruir.play();
            emitSound('destruir');
        }
        else if(
            getObject(posX-1,posY)._ID === ENEMY1 ||
            getObject(posX-1,posY)._ID === ENEMY2 ||
            getObject(posX-1,posY)._ID === ENEMY3 ||
            getObject(posX-1,posY)._ID === OBJETIVO1 ||
            getObject(posX-1,posY)._ID === OBJETIVO2)
        {
            getObject(posX-1,posY).eliminar();
        }
        else{
            //balaPared.play();
            emitSound('balaPared');
        }
    }
    else if (orientacion === DERECHA) {
        if (getObject(posX+1,posY)._ID === EMPTYSPACE) {
            setObject(posX + 1, posY, new bala(posX + 1, posY, orientacion, pertenece, this,BULLET));
            getObject(posX+1,posY).run();
        }
        else if (getObject(posX+1,posY)._ID === BLOQUENORMAL) {
            setObject(posX + 1, posY, new espacioLibre(this,EMPTYSPACE));
            //destruir.play();
            emitSound('destruir');
        }
        else if(
            getObject(posX+1,posY)._ID === ENEMY1 ||
            getObject(posX+1,posY)._ID === ENEMY2 ||
            getObject(posX+1,posY)._ID === ENEMY3 ||
            getObject(posX+1,posY)._ID === OBJETIVO1 ||
            getObject(posX+1,posY)._ID === OBJETIVO2)
        {
            getObject(posX+1,posY).eliminar();
        }
        else{
            //balaPared.play();
            emitSound('balaPared');
        }
    }

    //GameChange = true;
}

// Allows the enemy to shoot
function dispararEnemigo(posX,posY,pertenece,orientacion) {
    if(orientacion === ARRIBA){
        posY--;
    }
    else if(orientacion === ABAJO){
        posY++;
    }
    else if(orientacion === DERECHA){
        posX++;
    }
    else if(orientacion === IZQUIERDA){
        posX--;
    }
    if(getObject(posX,posY)._ID !== BLOQUENORMAL && getObject(posX,posY)._ID !== BORDE &&
       getObject(posX,posY)._ID !== OBJETIVO1 && getObject(posX,posY)._ID !== OBJETIVO2 &&
       getObject(posX,posY)._ID !== ENEMY1 && getObject(posX,posY)._ID !== ENEMY2 && getObject(posX,posY)._ID !== ENEMY3
       && getObject(posX,posY)._ID !== EMPTYSPACE){
        getObject(posX,posY).eliminar();
    }
}

function emitSound(sound)
{
    io.sockets.emit("PlaySound",{sound:sound});
}

function UserDied(userid)
{
    console.log(userid);
    RemoveNumberPlayer(getUserHeroeTank(userid).getNumOfPlayer);
    DeleteTank(userid);
    GameChanged = true;
    io.to(userid).emit('GameOver', { result : true});
    emitSound("muerteHeroe");
}

function DefineNumberPlayer()
{
    if(!J1) {J1=true; return 1;}
    else if(!J2) {J2= true; return 2;}
    else if(!J3) {J3=true; return 3;}
    else if(!J4) {J4=true; return 4;}
}

function RemoveNumberPlayer(num)
{
    if(num===1) J1 = false; 
    else if(num===2) J2 = false;
    else if(num===3) J3 = false;
    else if(num===4) J4 = false;;
}

function bajarVidaTank(userid,vidas)
{
    io.to(userid).emit('UpdateLifes', { lifes : vidas});
}


/*--------------THREADS-----------------*/
mainThread = setInterval(() => {
	if(GameChanged)
    {
        io.sockets.emit('GameChange', {CURRENT_MATRIX:TransformArrayToJSON()});
        GameChanged = false;
    }
    if(CheckGameState() === 1)
    {
        io.sockets.emit('GameOver',{result:true});
    }
    else if(CheckGameState() === 2) io.sockets.emit('GameOver',{result:false});
},500);

hiloEnemy1 = setInterval(() => {
    for(let i = 0; i < EnemyList1.length;i++){
        EnemyList1[i].run(); 
        if(playersOnline.length > 0)           
            EnemyList1[i].dispararEnemy(playersOnline);
        GameChanged = true;
    }
},1000); // los enemigos se mueven y disparan cada 0.3 segundos

hiloEnemy2y3 = setInterval(() => {
    for(let i = 0; i < EnemyList2y3.length;i++){
        EnemyList2y3[i].run();  
        if(playersOnline.length > 0)           
            EnemyList2y3[i].dispararEnemy(playersOnline);
        GameChanged = true;
    }
},1500); 

intervaloCreateEnemy = setInterval(addNewEnemy, 15000); // actualiza enemigos cada 15 segundos
/****************************************/

/*--------------------------------------*/

/*-------- SOCKET FUNCTIONS ------------*/

io.on('connection', function(socket){
	if(playersOnline.length <4)
	{
        var tankNum = DefineNumberPlayer();

		var newPosUser = PlaceUserInMap(socket.id,tankNum);

		playersOnline.push(new User(socket.id,newPosUser.x,newPosUser.y,getObject(newPosUser.x,newPosUser.y)));

		io.to(socket.id).emit('FirstConnection', { PLAYER_ID : socket.id,tankNum : tankNum});


		console.log(socket.id + ' has connected!' + " #: "+playersOnline.length);

        GameChanged = true;
	}

	socket.on('PlayerMoved',function(data){
		MovedPlayer(data);
	});

    socket.on('PlayerShooted',function(data){
        var instance = getUserHeroeTank(data.playerID);
        dispararHeroe(instance.getPosX,instance.getPosY,BALAHEROE,instance.getOrientacion);
    });

	socket.on('disconnect',function(){
        if(getUserHeroeTank(socket.id) != undefined)
        {
            RemoveNumberPlayer(getUserHeroeTank(socket.id).getNumOfPlayer);DeleteTank(socket.id);
        }        	
		console.log(socket.id + ' disconnected!' + " #: "+playersOnline.length);
        //socket.emit('UserDisconnected', {msg:null});
	});
});

/*--------------------------------------*/

/*--------------------------------------*/

server.listen(5000,function(){
	console.log('Servidor corriendo en http://localhost:5000');
	StartGame();
});

/*---------------EXPORTING PACKAGES--------------------------------------*/
module.exports.getObject = getObject; module.exports.setObject = setObject; module.exports.getUserHeroe = getUserHeroeTank;
module.exports.SearchUsers = SearchUsers; module.exports.dispararEnemigo = dispararEnemigo;
module.exports.directions = [ARRIBA,ABAJO,IZQUIERDA,DERECHA,EMPTYSPACE,BORDE,BLOQUENORMAL];
module.exports.tankIDS = [ENEMY1,ENEMY2,ENEMY3,BALAHEROE,BALAENEMIGO,HEROE];
module.exports.emitSound = emitSound; module.exports.GameChanged = GameChanged;
module.exports.RemoveBulletsMatrix = RemoveBulletsMatrix; module.exports.borrarEnemigo = borrarEnemigo;
module.exports.RestarObjetivos = RestarObjetivos; module.exports.UserDied = UserDied;
module.exports.SearchUsers = SearchUsers; module.exports.dispararHeroe = dispararHeroe;
module.exports.bajarVidaTank = bajarVidaTank;
/*--------------------------------------*/