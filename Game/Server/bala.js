 const index = require('./index');
 const espacioLibre = require('./espacioLibre');

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
        let solicitud;
        if(orientacion === index.directions[0]){
            this._orientacion = index.directions[0];
            solicitud = index.getObject(this._posX,this._posY-1); // objeto siguiente hacia arriba
            if(solicitud.espacioLibre()){
                this._posY--;//SIGA MOVIENDOSE
                index.setObject(this._posX,this._posY,this);
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === index.tankIDS[3]){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                }
                if(this._tipoBala === index.tankIDS[4]){
                    if(solicitud.getID === index.tankIDS[5]){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        index.emitSound('muerteHeroe');
                    }
                }
            }
            if(solicitud.getID === index.directions[5]){
                this._estadoBala = false;
                index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                index.emitSound('balaPared');
            }
        }
        else if(orientacion === index.directions[1]){
            this._orientacion = index.directions[1];
            solicitud = index.getObject(this._posX,this._posY+1);
            if(solicitud.espacioLibre()){
                this._posY++;
                index.setObject(this._posX,this._posY,this);
                return;
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === index.tankIDS[3]){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                }
                if(this._tipoBala === index.tankIDS[4]){
                    if(solicitud.getID === index.tankIDS[5]){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        index.emitSound('muerteHeroe');
                    }
                }
            }
            if(solicitud.getID === index.directions[5]){
                this._estadoBala = false;
                index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                index.emitSound('balaPared');
            }
        }
        else if(orientacion === index.directions[2]){
            this._orientacion = index.directions[2];
            solicitud = index.getObject(this._posX-1,this._posY);
            if(solicitud.espacioLibre()){
                this._posX--;
                index.setObject(this._posX,this._posY,this);
                return;
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === index.tankIDS[3]){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                }
                if(this._tipoBala === index.tankIDS[4]){
                    if(solicitud.getID === index.tankIDS[5]){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        index.emitSound('muerteHeroe');
                    }
                }
            }
            if(solicitud.getID === index.directions[5]){
                this._estadoBala = false;
                index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                index.emitSound('balaPared');
            }
        }
        else if(orientacion === index.directions[3]){
            this._orientacion = index.directions[3];
            solicitud = index.getObject(this._posX+1,this._posY);
            if(solicitud.espacioLibre()){
                this._posX++;
                index.setObject(this._posX,this._posY,this);
            }
            if(solicitud.esDestructible()){
                if(this._tipoBala === index.tankIDS[3]){//DESTRUYE LOS OBJETOS
                    solicitud.eliminar();//DEPEDIENDO DEL OBJETO A QUIEN PERTENEZCA ACCIONA ALGO
                    this._estadoBala = false;
                    index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                }
                if(this._tipoBala === index.tankIDS[4]){
                    if(solicitud.getID === index.tankIDS[5]){
                        solicitud.eliminar();
                        this._estadoBala = false;
                        index.emitSound('muerteHeroe');
                    }
                }
            }
            if(solicitud.getID === index.directions[5]){
                this._estadoBala = false;
                index.setObject(this._posX,this._posY,new espacioLibre(this._coordinador,index.directions[4]));
                index.emitSound('balaPared');
            }
        }
    }

    run(){
        while(this._estadoBala){
            this.moverBala(this._orientacion);

            index.GameChanged = true;
        }
        index.RemoveBulletsMatrix(this.getID);

    }

    esDestructible(){
        return false;
    }
    espacioLibre(){
        return false;
    }
}

module.exports = bala;