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

        this.updateCreation(pGame)
    }

     
    getCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
    {
        var levelInfo = GameInst.Level.trees;
        var collision = pCollision ;

        for(var iTree=0;iTree<levelInfo.length;iTree++)
        {
            //first check squared distance from trees
            var distSquaredFromRayPoint2 = vec3.squaredDistance(levelInfo[iTree].position,pRayPoint2);
            if(distSquaredFromRayPoint2>(100*100)) continue;

            //next check collision with all sphere
            if(this.collisionMatrixList[iTree]==null) continue;
            for (var i=0;i<this.collisionMatrixList[iTree].length;i++)
            {
                collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.collisionMatrixList[iTree][i],collision,pDistSquaredOffset);
            }
        }

        return collision;
    }



    storeCollisionMatrix(pMvMatrix,iTree)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.collisionMatrixList[iTree].push(collMat);
    }

    updateCreation(pGame)
    {

    }

    draw()
    {
        mat4.identity(mvMatrix);

        this.collisionMatrixList = []; 



        var levelInfo = GameInst.Level.trees;
        this.collisionMatrixList.length =0;

        for(var iTree=0;iTree<levelInfo.length;iTree++)
        {
            this.collisionMatrixList[iTree]=[];
            mvPushMatrix();

            mat4.translate(mvMatrix,mvMatrix,levelInfo[iTree].position); 

            for (var i=0;i<6;i++)
            {
                    shaderVertexColorVector = [0.5+i*0.05,0.25+i*0.05,0.0,1.0]; 
                    mvPushMatrix();
                        mat4.translate(mvMatrix,mvMatrix,[0.0,i*12+6.0,0.0]);   
                    //  mat4.rotate(mvMatrix,mvMatrix,  degToRad(2), [1, 0, 0]);   
                        mat4.scale(mvMatrix,mvMatrix,[10.0-i*1.0,12.0,10.0-i*1.0]); 
                        this.storeCollisionMatrix(mvMatrix,iTree);
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
                        this.storeCollisionMatrix(mvMatrix,iTree);
                        Sphere.Draw(SphereShaderGlowProgram);   
                    mvPopMatrix(); 
            }

            //test collision
            //mat4.scale(mvMatrix,mvMatrix,[90.0,90.0,90.0]); 
            //Sphere.Draw(SphereShaderProgram);   
            mvPopMatrix(); 


        }



    }

}


