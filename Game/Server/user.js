class User
{
	constructor(id, posX, posY, tank)
	{
		this._ID = id;
		this._PosX = posX;
		this._PosY = posY;
		this._State = true;
        this._Tank = tank;
	}

    get getID()
    {
        return this._ID;
    }

	get getPosX(){
        return this._PosX;
    }
    set setPosX(x){
        this._PosX = x;
    }

    get getPosY(){
        return this._PosY;
    }
    set setPosY(y){
        this._PosY = y;
    }

    get getState()
    {
    	return this._State;
    }

    set setState(s)
    {
    	this._State = s;
    }

    get getTank()
    {
        return this._Tank;
    }

    set setState(t)
    {
        this._Tank = t;
    }
}

module.exports = User;