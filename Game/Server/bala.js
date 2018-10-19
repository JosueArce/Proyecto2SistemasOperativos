 class bala{
    constructor(x,y,orientacion,balaTanke,parteLogica,BULLET){
        this._coordinador = parteLogica;
        this._ID = BULLET;
        this._posX = x;
        this._posY = y;
        this._orientacion = orientacion;
        this._tipoBala = balaTanke;//BALA PERTENECE A UN TANKE
        this._estadoBala = true;
    }
    get getOrientacion(){
        return this._orientacion;
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
    get getTipoBala(){
        return this._tipoBala;
    }
    set setTipoBala(val){
        this._tipoBala = val;
    }
    get getEstadoBala(){
        return this._estadoBala;
    }
    set setEstadoBala(estado){
        this._estadoBala = estado;
    }
    moverBala(orientacion){
        actualizar();
        let solicitud;
        if(orientacion === ARRIBA){
            this._orientacion = ARRIBA;
            solicitud = getObject(this._posX,this._posY-1); // objeto siguiente hacia arriba
            if(solicitud.espacioLibre()){
                this._posY--;//SIGA MOVIENDOSE
                setObject(this._posX,this._posY,this);
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === BALAHEROE){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                }
                if(this._tipoBala === BALAENEMIGO){
                    if(solicitud.getID === HEROE){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        muerteHeroe.play();
                    }
                }
            }
            if(solicitud.getID === BORDE){
                this._estadoBala = false;
                setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                balaPared.play();
            }
        }
        else if(orientacion === ABAJO){
            this._orientacion = ABAJO;
            solicitud = getObject(this._posX,this._posY+1);
            if(solicitud.espacioLibre()){
                this._posY++;
                setObject(this._posX,this._posY,this);
                return;
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === BALAHEROE){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                }
                if(this._tipoBala === BALAENEMIGO){
                    if(solicitud.getID === HEROE){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        muerteHeroe.play();
                    }
                }
            }
            if(solicitud.getID === BORDE){
                this._estadoBala = false;
                setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                balaPared.play();
            }
        }
        else if(orientacion === IZQUIERDA){
            this._orientacion = IZQUIERDA;
            solicitud = getObject(this._posX-1,this._posY);
            if(solicitud.espacioLibre()){
                this._posX--;
                setObject(this._posX,this._posY,this);
                return;
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === BALAHEROE){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                }
                if(this._tipoBala === BALAENEMIGO){
                    if(solicitud.getID === HEROE){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        muerteHeroe.play();
                    }
                }
            }
            if(solicitud.getID === BORDE){
                this._estadoBala = false;
                setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                balaPared.play();
            }
        }
        else if(orientacion === DERECHA){
            this._orientacion = DERECHA;
            solicitud = getObject(this._posX+1,this._posY);
            if(solicitud.espacioLibre()){
                this._posX++;
                setObject(this._posX,this._posY,this);
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === BALAHEROE){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                }
                if(this._tipoBala === BALAENEMIGO){
                    if(solicitud.getID === HEROE){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        muerteHeroe.play();
                    }
                }
            }
            if(solicitud.getID === BORDE){
                this._estadoBala = false;
                setObject(this._posX,this._posY,new espacioLibre(this._coordinador));
                balaPared.play();
            }
        }
    }

    run(){
        while(this._estadoBala){
            this.moverBala(this._orientacion);
        }
        quitarBalasMatriz(this.getID);
    }

    esDestructible(){
        return false;
    }
    espacioLibre(){
        return false;
    }
}

module.exports = bala;