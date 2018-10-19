/**
 * Created by Josue on 31/10/2017.
 * TIENE 1 VIDA PERO SE MUEVE RAPIDO
 */
const Tank = require('./Tank');

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
        setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
        borrarEnemigo(this,0);
        muerteEnemy.play();
    }
}

module.exports = tankEnemy1;