/**
 * Created by Josue on 31/10/2017.
 * SOPORTA 3 BALAZOS DEL TANKE HEROE PERO SE MUEVE LENTO
 */
const index = require('./index');
const Tank = require('./Tank');
 const espacioLibre = require('./espacioLibre');

class tankEnemy2 extends Tank{
    constructor(x,y,vidaTotal,parteLogica,id){
        super(id, parteLogica, x, y, Math.floor((Math.random() * 4) + 1) - 1);
        this._resistencia = vidaTotal;
    }
    get getResistencia(){
        return this._resistencia;
    }
    set setResistencia(value){
        this._resistencia = value;
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
        this._resistencia--;
        if(this._resistencia === 0){
            index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
            index.borrarEnemigo(this,1);
            index.emitSound("muerteEnemy");
        }
    }
}

module.exports = tankEnemy2;