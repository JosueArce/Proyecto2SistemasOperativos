
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
        if(getObject(this._posX,this._posY-1).espacioLibre()){ //ARRIBA
            camDisponibles.push(ARRIBA);
            opciones++;
        }
        if(getObject(this._posX,this._posY+1).espacioLibre()){//ABAJO
            camDisponibles.push(ABAJO);
            opciones++;
        }
        if(getObject(this._posX-1,this._posY).espacioLibre()){//IZQUIERDA
            camDisponibles.push(IZQUIERDA);
            opciones++;
        }
        if(getObject(this._posX+1,this._posY).espacioLibre()){//DERECHA
            camDisponibles.push(DERECHA);
            opciones++;
        }
        if(opciones !== 0){
            let numRandom = this.generarRandom(opciones);
            this.moverTank(camDisponibles[numRandom]);
        }
    }

    moverTank(orientacion){
        setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
        if(orientacion === ARRIBA){
            this._orientacion = ARRIBA;
            this._posY = this._posY-1;
        }
        else if(orientacion === ABAJO){
            this._orientacion = ABAJO;
            this._posY = this._posY+1;
        }
        else if(orientacion === IZQUIERDA){
            this._orientacion = IZQUIERDA;
            this._posX = this._posX-1;
        }
        else if(orientacion === DERECHA){
            this._orientacion = DERECHA;
            this._posX = this._posX+1;
        }
        setObject(this._posX,this._posY,this);
    }
    dispararEnemy(){
        if(this._posY === getHeroe()._posY || this._posX === getHeroe()._posX){
            if(buscarHeroe(this._orientacion,this._posX,this._posY)){
                dispararEnemigo(this._posX,this._posY,this._ID,this._orientacion);
            }
        }
    }
    generarRandom(limite){
        return Math.floor((Math.random() * limite) + 1) - 1;
    }
}

module.exports = Tank;