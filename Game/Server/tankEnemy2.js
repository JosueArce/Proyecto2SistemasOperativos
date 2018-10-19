/**
 * Created by Josue on 31/10/2017.
 * SOPORTA 3 BALAZOS DEL TANKE HEROE PERO SE MUEVE LENTO
 */

const Tank = require('./Tank');

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
            setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
            borrarEnemigo(this,1);
            muerteEnemy.play();
        }
    }
}

module.exports = tankEnemy2;