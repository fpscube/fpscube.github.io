
var VehiculesInst;


class CVehicules
{

    constructor()
    {
        this.Pos = [-650,0,80];
        this.DriverPos =[-550,0,80];
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 3.0;
        this.NewPos = [-550,0,80];
        this.Dir = [1,0,0]; 
        this.HSpeed = 0;
        this.VSpeed= 0;
        this.Acc = 0;
        this.collisionMatrixList = [];   
        VehiculesInst = this;

    }

    
    storeCollisionMatrix(pMvMatrix)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.collisionMatrixList.push(collMat);
    }

    checkCollision(pRayPoint1,pRayPoint2)
    {
        var collision = null ;
        for (var i=0;i<this.collisionMatrixList.length;i++)
        {
            collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.collisionMatrixList[i],collision,0);
        }

        return (collision!=null);
    }



    update()
    {
        var elapsed = timeGetElapsedInS();

        this.HSpeed += (this.Acc -1) *elapsed;
        if(this.HSpeed<0) this.HSpeed=0;
        
        if(this.HSpeed>150) this.HSpeed=150;

        this.Pos[0] = this.Pos[0] + this.HSpeed*elapsed*this.Dir[0];
        this.Pos[2] = this.Pos[2] + this.HSpeed*elapsed*this.Dir[2];
      //  this.Pos[1] = this.Pos[1] + this.VSpeed*elapsed;
        
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 3.0;

        this.DriverPos[0] =  this.Pos[0]-this.Dir[0]*4.0;
        this.DriverPos[2] =  this.Pos[2]-this.Dir[2]*4.0;
        this.DriverPos[1] =  this.Pos[1]+1.6;
    }

    draw()
    {   
        this.collisionMatrixList = [];   
        mat4.identity(mvMatrix);
        shaderVertexColorVector = [1.0,1.0,1.0,1.0]; 

        
        mat4.translate(mvMatrix,mvMatrix,this.Pos);
    
        lookAt([this.Dir[0],0,this.Dir[2]]); 
        
        mat4.scale(mvMatrix,mvMatrix,[0.5,0.5,0.5]);

        //Gear
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-8,0,-13]); 
            mat4.scale(mvMatrix,mvMatrix,[2.0,5,5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-8,0,13]); 
            mat4.scale(mvMatrix,mvMatrix,[2.0,5,5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();
    
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[8,0,-13]); 
            mat4.scale(mvMatrix,mvMatrix,[2.0,5,5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[8,0,13]);  
            mat4.scale(mvMatrix,mvMatrix,[2.0,5,5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();


        //Structure
        shaderVertexColorVector = [0.2,0.2,0.2,1.0]; 

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[2.0,1.0,17.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[2.0,1.0,17.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,13]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,10.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,-13]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,10.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();        

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,3.8,4]); ; 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(25), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[0.6,0.6,5.8]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        //Guidon
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[0,6.0,-1.2]); 
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(5), [1, 0, 0]); 
        mat4.scale(mvMatrix,mvMatrix,[2.5,0.5,0.5]); 
        this.storeCollisionMatrix(mvMatrix);
        Sphere.Draw(SphereShaderProgram);   
       mvPopMatrix();

        //Body
        shaderVertexColorVector = [0.2,0.2,0.8,1.0]; 
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1.0,10]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(25), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[3.8,2.8,7]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();


        //Street w
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,6.0,-1.2]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[1.3,1.0,0.5]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();
         
        //Chair
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1,-5.65]); 
            mat4.scale(mvMatrix,mvMatrix,[4,1.0,3]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1,-7.65]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(250), [1, 0, 0]); 
            mat4.translate(mvMatrix,mvMatrix,[0,0,3]); 
            mat4.scale(mvMatrix,mvMatrix,[3,1.0,4]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

    }
}
