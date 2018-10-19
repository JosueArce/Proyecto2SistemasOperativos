
 class bloque{
    constructor(x,y,parteLogica,BLOQUENORMAL){
        this._coordinador = parteLogica;
        this._ID = BLOQUENORMAL;
        this._posX = x;
        this._posY = y;
    }

    get getID(){
        return this._ID;
    }
    eliminar(){
        setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
        destruir.play();
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
    esDestructible(){
        return true;
    }
    espacioLibre(){
        return false;
    }
    esObjetivo(){
        return false;
    }
}

module.exports = bloque;