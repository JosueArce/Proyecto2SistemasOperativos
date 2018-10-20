const index = require('./index');
const espacioLibre = require('./espacioLibre');

class Tank{
    constructor(ID,parteLogica,x,y,o) {
        this._ID = ID;
        this._coordinador = parteLogica;
        this._posX = x;
        this._posY = y;
        this._orientacion = o;
        this._estadoVida = true;
    }
    get getEstadoVida(){
        return this._estadoVida;
    }
    set setEstadoVida(e){
        this._estadoVida = e;
    }
    get getID() {
        return this._ID;
    }
    set setID(value) {
        this._ID = value;
    }
    get getCoordinador(){
        return this._coordinador;
    }
    set setCoordinador(c){
        this._coordinador = c;
    }
    get getPosX() {
        return this._posX;
    }
    set setPosX(value) {
        this._posX = value;
    }
    get getPosY() {
        return this._posY;
    }
    set setPosY(value) {
        this._posY = value;
    }
    get getOrientacion() {
        return this._orientacion;
    }
    set setOrientacion(value) {
        this._orientacion = value;
    }

    /*PERMITE GENERAR UN HILO Y MANTENER EL TANK ENEMIGO MOVIENDOSE EN BUSCA DEL TANK HEROE
    * EL HILO SE TERMINA HASTA QUE EL ESTADO DE VIDA DEL TANK SEA FALSE
    * */
    run(){
        let opciones= 0;//CONTADOR QUE DEFINE CUANTAS OPCIONES DISPONIBLES TENGO PARA ESCOGER
        let camDisponibles = [];//TENDRÁ LAS POSIBLES VIAS PARA DONDE SE PODRÁ DESPLAZAR EL TANK
        if(index.getObject(this._posX,this._posY-1).espacioLibre()){ //ARRIBA
            camDisponibles.push(index.directions[0]);
            opciones++;
        }
        if(index.getObject(this._posX,this._posY+1).espacioLibre()){//ABAJO
            camDisponibles.push(index.directions[1]);
            opciones++;
        }
        if(index.getObject(this._posX-1,this._posY).espacioLibre()){//IZQUIERDA
            camDisponibles.push(index.directions[2]);
            opciones++;
        }
        if(index.getObject(this._posX+1,this._posY).espacioLibre()){//DERECHA
            camDisponibles.push(index.directions[3]);
            opciones++;
        }
        if(opciones !== 0){
            let numRandom = this.generarRandom(opciones);
            this.moverTank(camDisponibles[numRandom]);
        }
    }

    moverTank(orientacion){
        index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
        if(orientacion === index.directions[0]){
            this._orientacion = index.directions[0];
            this._posY = this._posY-1;
        }
        else if(orientacion === index.directions[1]){
            this._orientacion = index.directions[1];
            this._posY = this._posY+1;
        }
        else if(orientacion === index.directions[2]){
            this._orientacion = index.directions[2];
            this._posX = this._posX-1;
        }
        else if(orientacion === index.directions[3]){
            this._orientacion = index.directions[3];
            this._posX = this._posX+1;
        }
        index.setObject(this._posX,this._posY,this);
    }
    dispararEnemy(){
        if(this._posY === index.getUserHeroe().getPosY || this._posX === index.getUserHeroe().getPosX){
            if(index.SearchUsers(this._orientacion,this._posX,this._posY)){
                index.dispararEnemigo(this._posX,this._posY,this._ID,this._orientacion);
            }
        }
    }
    generarRandom(limite){
        return Math.floor((Math.random() * limite) + 1) - 1;
    }
}

module.exports = Tank;