var CTreesInst;

class CTrees
{
    constructor()
    {
        this.list=[];
        this.hash={}; // 100x100
        for (var i=0;i<360;i+=30)
        {
           var  x = Math.sin(5*degToRad(i))*1000-300;
           var  z = Math.sin(4*degToRad(i))*1000+60;
           var  y = groundGetY(x,z) - 8.0;
           

           //Hash Table align 100*100
           var xId = Math.floor(x/100);
           var zId = Math.floor(z/100);
           x = xId*100 + 50;
           z = zId*100 + 50;

           if (groundIsUnderWater(y)) 
           { 
               continue;
            }

          //  this.list.push(new CTree([-350.0,0.0,60.0]));
            var newTree = new CTree([x,y,z]);
            this.list.push(newTree);
            if (this.hash[xId] == null) this.hash[xId] = {};
            this.hash[xId][zId] = newTree;
        }
        CTreesInst = this;
    }

    
    getCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
    {
        //Hash Table align 100*100
        var xId = Math.floor(pRayPoint2[0]/100);
        var zHash= this.hash[xId];
        var collision = pCollision;
        if (zHash != null)
        {
            var zId = Math.floor(pRayPoint2[2]/100);
            var foundedTree = zHash[zId];
            if (foundedTree!=null)
            {
                collision = zHash[zId].getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);

            }
           
        }
        return collision;
    }

    update()
    {
        for (var i=0;i<this.list.length;i++){
            this.list[i].update();
        }
    }

    draw()
    {
        for (var i=0;i<this.list.length;i++){
            this.list[i].draw();
        }
    }


}


class CTree
{
    constructor(pPos)
    {
        this.collisionMatrixList = [];   
        this.pos = [];
        vec3.copy(this.pos,pPos);
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
        mat4.translate(mvMatrix,mvMatrix,this.pos); 

        this.collisionMatrixList = []; 
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
                    Sphere.Draw(SphereShaderProgram);   
                mvPopMatrix(); 
        }



    }

}


