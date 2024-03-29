/**
 * Created by Josue on 31/10/2017.
 * Clase que permite crear un objetivo
 */

const index = require('./index');
const espacioLibre = require('./espacioLibre');

class objetivos{
    constructor(x,y,parteLogica,id,vida){
        this._posX = x;
        this._posY = y;
        this._coordinador = parteLogica;
        this._ID = id;
        this._vida = vida;
    }
    get getID(){
        return this._ID;
    }
    get getPosX(){
        return this._posX;
    }
    set setPosX(x){
        this._posX = x;
    }
    get getPosY(){
        return this._posY;
    }
    set setPosY(y){
        this._posY = y;
    }
    eliminar(){
        this._vida--;
        if (this._vida === 0){
            index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
            index.emitSound('muerteObjeto');
            index.RestarObjetivos();
            index.GameChanged = true;
            //index.verificarEstadoJuego();
        }
    }

    espacioLibre(){
        return false;
    }
    esDestructible(){
        return true;
    }
    esObjetivo(){
        return true;
    }
}

module.exports = objetivos;