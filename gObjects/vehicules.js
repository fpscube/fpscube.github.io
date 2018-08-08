
var VehiculesInst;


class CVehicules
{

    constructor()
    {
        this.Pos = [-650,0,80];
        this.DriverPos =[-550,0,80];
        this.DriverOutPos =[-550,0,80];
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 3.0;
        this.NewPos = [-550,0,80];
        this.Dir = [1,0,0]; 
        this.WheelDir = [1,0,0]; 
        this.LastWheelDir = [1,0,0]; 
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

        var dotWheel = vec3.dot(this.Dir,this.WheelDir);
        var dotMax = (this.HSpeed/150)**2*0.499 + 0.5;
        console.log(dotMax);
        console.log(dotWheel);
        if(dotWheel<dotMax) 
        {    
            var orthoDir  = [];   
            vec3.rotateY(orthoDir,this.Dir,[0,0,0],Math.PI/2);
            dotWheel = vec3.dot(orthoDir,this.WheelDir);
            if(dotWheel<0)    
                vec3.rotateY(this.WheelDir,this.Dir,[0,0,0],-Math.acos(dotMax));
            else
                vec3.rotateY(this.WheelDir,this.Dir,[0,0,0],Math.acos(dotMax));
        }

        this.HSpeed += this.Acc *elapsed;

        // Speed Limit
        if(this.HSpeed<=0)
        {
            this.HSpeed=0; 
            vec3.copy(this.WheelDir,this.Dir);
        }        
        if(this.HSpeed>150) this.HSpeed=150;

        if(this.HSpeed>0)
        {

            this.Dir[0] = (this.Dir[0]*13 + this.WheelDir[0]*this.HSpeed*elapsed);
            this.Dir[2] = (this.Dir[2]*13 + this.WheelDir[2]*this.HSpeed*elapsed);
            vec3.normalize(this.Dir,this.Dir);
        }
         

        this.Pos[0] = this.Pos[0] + this.HSpeed*elapsed* this.Dir[0];
        this.Pos[2] = this.Pos[2] + this.HSpeed*elapsed* this.Dir[2];
      //  this.Pos[1] = this.Pos[1] + this.VSpeed*elapsed;
        
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 3.0;

        this.DriverPos[0] =  this.Pos[0]-this.Dir[0]*10.5;
        this.DriverPos[2] =  this.Pos[2]-this.Dir[2]*10.5;
        this.DriverPos[1] =  this.Pos[1]+1.6;
        this.DriverOutPos[0]  =  this.Pos[0]+this.Dir[2]*10.0;
        this.DriverOutPos[2]  =  this.Pos[2]-this.Dir[0]*10.0;
        this.DriverOutPos[1]  =  this.Pos[1]+5;




    }

    draw()
    {   
        this.collisionMatrixList = [];   
        mat4.identity(mvMatrix);
        shaderVertexColorVector = [1.0,1.0,1.0,1.0]; 

        
        mat4.translate(mvMatrix,mvMatrix,this.Pos);
    
        lookAt(this.Dir); 
        mat4.translate(mvMatrix,mvMatrix,[0,0,-6.5]);
        

        //Front Wheel
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-4,0,6.5]);
            lookAt(this.WheelDir); 
            mat4.scale(mvMatrix,mvMatrix,[1.0,2.5,2.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[4,0,6.5]);  
            lookAt(this.WheelDir); 
            mat4.scale(mvMatrix,mvMatrix,[1.0,2.5,2.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        //Back Wheel    
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-4,0,-6.5]); 
            mat4.scale(mvMatrix,mvMatrix,[1.0,2.5,2.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[4,0,-6.5]); 
            mat4.scale(mvMatrix,mvMatrix,[1.0,2.5,2.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();

        //Structure
        shaderVertexColorVector = [0.2,0.2,0.2,1.0]; 

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[1.0,0.5,8.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[1.0,0.5,8.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,6.5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.4,0.4,5.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,-6.5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.4,0.4,5.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();        

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1.9,2]); ; 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(25), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[0.3,0.3,2.9]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        //Guidon
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[0,3.0,-0.6]); 
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(5), [1, 0, 0]); 
        mat4.scale(mvMatrix,mvMatrix,[1.25,0.25,0.25]); 
        this.storeCollisionMatrix(mvMatrix);
        Sphere.Draw(SphereShaderProgram);   
       mvPopMatrix();

        //Body
        shaderVertexColorVector = [0.2,0.2,0.8,1.0]; 
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0.5,5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(25), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[1.9,1.4,3.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();


        //Street w
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,3.0,-0.6]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[0.65,0.5,0.25]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();
         
        //Chair
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0.5,-2.825]); 
            mat4.scale(mvMatrix,mvMatrix,[2,0.5,1.5]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0.5,-3.825]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(250), [1, 0, 0]); 
            mat4.translate(mvMatrix,mvMatrix,[0,0,1.5]); 
            mat4.scale(mvMatrix,mvMatrix,[1.5,0.5,2]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

    }
}
