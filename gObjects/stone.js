
var CStoneInst;


class CStone
{

    constructor(pGame){
        CStoneInst = this;
        this.CollisionMatrixList = [];this.turn=0;
        pGame.Level["stones"]=[];
    }

    _clearCollisionMatrix()
    {
        this.CollisionMatrixList = [];
    }

    _storeCollisionMatrix(pMvMatrix)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.CollisionMatrixList.push(collMat);
    }

    add()
    {
        GameInst.Level["stones"].push(
            {   
                "position":
                    [GameInst.CamPos[0] +  GameInst.CamDir[0]*20.0,
                     GameInst.CamPos[1] - 20.0,
                     GameInst.CamPos[2] +  GameInst.CamDir[2]*20.0],
                "color":[0.52,0.7,1.0,0.6]
            }
        );
    }

    update()
    {
    }   

    getCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
    {
        var collision = pCollision ;
        for (var i=0;i<this.CollisionMatrixList.length;i++)
        {
            collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.CollisionMatrixList[i],collision,pDistSquaredOffset);
        }

        return collision;
    }

    draw()
    {
        this._clearCollisionMatrix();

        mat4.identity(mvMatrix);


        var levelInfo = GameInst.Level.stones;

        for(i=0;i<levelInfo.length;i++)
        {
            shaderVertexColorVector = levelInfo[i].color;
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,levelInfo[i].position); 
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(0), [1, 0, 0]);   
                mat4.scale(mvMatrix,mvMatrix,[40.0,3.0,40.0]); 
                Sphere.Draw(SphereShaderProgram);   
                this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix();
        }


        //shaderVertexColorVector = [0.52,0.7,1.0,0.6];


      
    }





}


