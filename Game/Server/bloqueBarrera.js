
class bloqueBarrera{
    constructor(parteLogica,BORDE){
        this._coordinador = parteLogica;
        this._ID = BORDE;
    }

    get getID(){
        return this._ID;
    }
    esDestructible(){
        return false;
    }
    espacioLibre(){
        return false;
    }
    esObjetivo(){
        return false;
    }
}

module.exports = bloqueBarrera;