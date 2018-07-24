
var CStoneInst;


class CStone
{

    constructor(){
        CStoneInst = this;
        this.CollisionMatrixList = [];
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
        
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,20.0,0.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[80.0,10.0,80.0]); 
            Sphere.Draw(SphereShaderProgram);   
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();

        
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-20.0,-5.0,-50.0]);  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(120), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,30.0]); 
            Sphere.Draw(SphereShaderProgram); 
        
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();


    
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[150.0,30.0,-500.0])
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-5), [0, 0,1]);;  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(84), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[50.0,200.0,10.0]); 
            Sphere.Draw(SphereShaderProgram); 
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();
        

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[150.0,20.0,-350.0]);  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(85), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,25.0]); 
            Sphere.Draw(SphereShaderProgram); 
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();

      

    }
    



}