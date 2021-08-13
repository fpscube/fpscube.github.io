var CTreesInst;



class CTrees
{
    constructor(pGame)
    {
        CTreesInst = this;
        this.collisionMatrixList = [];  
        if (pGame.Level["trees"]==null)
        {
            pGame.Level["trees"]=[];
        }
    }

     
    getCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
    {
        var collision = pCollision ;
        for (var i=0;i<this.collisionMatrixList.length;i++)
        {
            collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.collisionMatrixList[i],collision,pDistSquaredOffset);
        }

        return collision;
    }



    storeCollisionMatrix(pMvMatrix)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.collisionMatrixList.push(collMat);
    }

    update()
    {

    }

    draw()
    {
        mat4.identity(mvMatrix);

        this.collisionMatrixList = []; 



        var levelInfo = GameInst.Level.trees;

        for(var iTree=0;iTree<levelInfo.length;iTree++)
        {
            mvPushMatrix();

            mat4.translate(mvMatrix,mvMatrix,levelInfo[iTree].position); 

            for (var i=0;i<6;i++)
            {
                    shaderVertexColorVector = [0.5+i*0.05,0.25+i*0.05,0.0,1.0]; 
                    mvPushMatrix();
                        mat4.translate(mvMatrix,mvMatrix,[0.0,i*12+6.0,0.0]);   
                    //  mat4.rotate(mvMatrix,mvMatrix,  degToRad(2), [1, 0, 0]);   
                        mat4.scale(mvMatrix,mvMatrix,[10.0-i*1.0,12.0,10.0-i*1.0]); 
                        this.storeCollisionMatrix(mvMatrix);
                        Sphere.Draw(SphereShaderProgram);   
                    mvPopMatrix(); 
            }

            shaderVertexColorVector = [0.35,0.65,0.0,1.0]; 
            for (var i=0;i<360;i+=45)
            {
                    mvPushMatrix();
                        mat4.rotate(mvMatrix,mvMatrix,  degToRad(i), [0, 1, 0]); 
                        mat4.translate(mvMatrix,mvMatrix,[20.0,6*12-5.0,0.0]);    
                        mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 0, 1]);  
                        mat4.scale(mvMatrix,mvMatrix,[40.0,2.0,6.0]); 
                        this.storeCollisionMatrix(mvMatrix);
                        Sphere.Draw(SphereShaderGlowProgram);   
                    mvPopMatrix(); 
            }

            mvPopMatrix(); 
        }



    }

}


