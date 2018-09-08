
var CStoneInst;


class CStone
{

    constructor(){
        CStoneInst = this;
        this.CollisionMatrixList = [];this.turn=0;
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

    draw(pShadow)
    {
        this._clearCollisionMatrix();

        mat4.identity(mvMatrix);
        var  scaleShadow = 1.0;
        if (pShadow) scaleShadow = 0.01;
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,20.0,0.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[80.0,10.0*scaleShadow,80.0]); 
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
            mat4.scale(mvMatrix,mvMatrix,[50.0,200.0,10.0*scaleShadow]); 
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

      //Tower 1
        mvPushMatrix();          
        mat4.translate(mvMatrix,mvMatrix,[300.0,20.0,450.0]);       
    
        for (var i=70;i<(360);i+=45)
        {
            var c = (i%17) / 17.0 +0.5
            
            shaderVertexColorVector = [c,c,0.2,1.0]; 
            mvPushMatrix();   
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(i+180), [0, 1, 0]);  
            mat4.translate(mvMatrix,mvMatrix,[0.0,50.0,-60.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(115), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[60.0,6.0,350]); 
            Sphere.Draw(SphereShaderProgram);   
            this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix(); 
        }               
        mvPopMatrix();

        //Tower 2
        mvPushMatrix();       
        mat4.translate(mvMatrix,mvMatrix,[-300.0,20.0,-450.0]);       
        for (var i=70;i<(360);i+=45)
        {
            var c = (i%17) / 17.0 +0.5
            
            shaderVertexColorVector = [0.1,c*0.8,c*1.2,1.0]; 
            mvPushMatrix();   
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(i+180), [0, 1, 0]);  
            mat4.translate(mvMatrix,mvMatrix,[0.0,50.0,-60.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(140), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[60.0,6.0,350]); 
            Sphere.Draw(SphereShaderProgram);   
            this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix(); 
        }             
        mvPopMatrix();
      
    }





}


