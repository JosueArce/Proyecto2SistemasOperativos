
/***
 * Hace referencia los espacios restantes que no sean: bloques, tankes, objetivos
 * En caso de que un elemento vaya a estar sobre laa posición en la que se encuentre este objeto, se elimina este objeto
 * y se agrega el nuevo objeto
 * */

class espacioLibre{
    constructor(parteLogica,EMPTYSPACE){
        this._coordinador = parteLogica;
        this._ID = EMPTYSPACE;
    }
    get getID(){
        return this._ID;
    }
    esDestructible(){
        return false;
    }
    esObjetivo(){
        return false;
    }
    espacioLibre(){
        return true;
    }
}

module.exports = espacioLibre;

