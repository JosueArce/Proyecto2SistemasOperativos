/**
 * Created by Josue on 31/10/2017.
 * SE MUEVE LENTO PERO PROVOCA MAS DANIO
 */

const Tank = require('./Tank');
const index = require('./index');
 const espacioLibre = require('./espacioLibre');

class tankEnemy3 extends Tank{
    constructor(x,y,parteLogica,id,danio){
        super(id, parteLogica, x, y, Math.floor((Math.random() * 4) + 1) - 1);
        this._danio = danio;
    }
    get danio() {
        return this._danio;
    }
    set danio(value) {
        this._danio = value;
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
        index.borrarEnemigo(this,1);
        index.emitSound('muerteEnemy');
    }
}

module.exports = tankEnemy3;