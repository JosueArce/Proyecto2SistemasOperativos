/**
 * Created by Josue on 31/10/2017.
 * TIENE 1 VIDA PERO SE MUEVE RAPIDO
 */
const Tank = require('./Tank');
const index = require('./index');
 const espacioLibre = require('./espacioLibre');

class tankEnemy1 extends Tank{
    constructor(x,y,velocidad,parteLogica,id){
        super(id, parteLogica, x, y, Math.floor((Math.random() * 4) + 1) - 1);
        this._velocidadTanke = velocidad;
    }
    get getVelocidadTanke(){
        return this._velocidadTanke;
    }
    set setVelocidadTanke(value){
        this._velocidadTanke = value;
    }
    esDestructible(){
        return true;
    }
    espacioLibre(){
        return false;
    }
    esObjetivo(){
        return true;
    }
    eliminar(){
        index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
        index.borrarEnemigo(this,0);
        index.emitSound("muerteEnemy");
    }
}

module.exports = tankEnemy1;