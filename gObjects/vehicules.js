
var VehiculesInst;

var VehiculesSphereGlowFragmentShader = `
precision lowp float;
uniform vec4 uVertexColor; 
varying vec3 v_normal;
varying vec4 a_position;      

void main() {

  float light =  (0.2 - abs(a_position.x))/0.2 * 50.0 ;
 
  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light*5.0,uVertexColor.a);
}`;


var VehiculesSphereGlowFragmentShader2 = `
precision lowp float;
uniform vec4 uVertexColor; 
varying vec3 v_normal;
varying vec4 a_position;      

void main() {

  float light =  (0.2 - abs(a_position.x))/0.2 * 10.0 ;
  
 
  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a);
}`;

class CVehicules
{

    constructor()
    {
        this.Pos = [-600,0,90];
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 10.0;  

        this.EngineOn = false;
        this.Free = true;

        this.Dir = [1,0,0]; 
        this.WheelDir = [1,0,0]; 
        this.AxisDir = [0,0,1];
        this.FrontAxisDir = [0,0,1];
        this.BackAxisDir = [0,0,1];
        this.NormalDir = [0,1,0];
        this.FrontNormalDir = [0,1,0];
        this.BackNormalDir = [0,1,0];

        this.Distance = 0;

        this.FrontPt = new CPhysicalPt(this.Pos);
        this.FrontPt.Pos = this.Pos;
        this.FrontWheelLeftPt = new CPhysicalPt(this.Pos);
        this.FrontWheelRightPt = new CPhysicalPt(this.Pos);

        this.BackPt = new CPhysicalPt(this.Pos);
        this.BackPt.Pos = [this.Pos[0]-13.0,this.Pos[1],this.Pos[2]];
        this.BackPt.Pos[1] = groundGetY(this.BackPt.Pos[0],this.BackPt.Pos[2]) + 10.0; 

        this.BackWheelLeftPt = new CPhysicalPt(this.Pos);
        this.BackWheelRightPt = new CPhysicalPt(this.Pos);

        this.DriverPos =[];
        this.DriverOutPos =[];
        this.CrossDir = []; 
        this.BWheelNormalDir = [];
        this.FWheelNormalDir = [];
        this.CollisionMatrixList = [];   
        this.EnterCollisionMatrix = mat4.create();
        VehiculesInst = this;

        
        this.ShaderGlowProgram = SphereInitShaders(SphereVertexShader,VehiculesSphereGlowFragmentShader);
        this.ShaderGlowProgram2 = SphereInitShaders(SphereVertexShader,VehiculesSphereGlowFragmentShader2);

    }
    
    storeCollisionMatrix(pMvMatrix)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.CollisionMatrixList.push(collMat);
    }

    checkCollision(pRayPoint1,pRayPoint2)
    {
        var collision = null ;
        collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.EnterCollisionMatrix,collision,0);
        return (collision!=null);
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

  

    update(pHuman)
    {
        var elapsed = timeGetElapsedInS();



        // Save new Front and wheel position
        var prevFrontPtPos = [];
        var prevFrontWheelLeftPtPos = [];
        var prevFrontWheelRightPtPos = [];
        vec3.copy(prevFrontPtPos,this.FrontPt.Pos);
        vec3.copy(prevFrontWheelLeftPtPos,this.FrontWheelLeftPt.Pos);
        vec3.copy(prevFrontWheelRightPtPos,this.FrontWheelRightPt.Pos);

        //Project WheelDir to Dir plane
        vec3.copy(this.WheelDir,this.Dir);
        vec3.normalize(this.WheelDir,this.WheelDir);
        vec3.cross(this.WheelDir,this.FrontNormalDir,this.WheelDir,);
        vec3.normalize(this.WheelDir,this.WheelDir);
        vec3.cross(this.WheelDir,this.WheelDir,this.FrontNormalDir);
        vec3.normalize(this.WheelDir,this.WheelDir);


        var dotSpeedDir = vec3.dot(this.FrontPt.Speed,this.Dir);
        var speedVal = vec3.length(this.FrontPt.Speed);
        if(dotSpeedDir<0) speedVal = -speedVal;

        if(this.EngineOn)
        {
            this.Brake=0;

            var maxDriftAngle = 0.8 - speedVal/200;
            if(maxDriftAngle<0) maxDriftAngle = 0.05;


            if(mediaIsKey("Left"))
            {
                vec3.rotateY(this.WheelDir,this.Dir,[0,0,0],0.8);
                vec3.rotateY(this.FrontPt.Dir,this.Dir,[0,0,0],maxDriftAngle);
            }
            else if(mediaIsKey("Right"))
            {
                vec3.rotateY(this.WheelDir,this.Dir,[0,0,0],-0.8);
                vec3.rotateY(this.FrontPt.Dir,this.Dir,[0,0,0],-maxDriftAngle);
            }
            else
            {
                vec3.copy(this.FrontPt.Dir,this.WheelDir);
            }


            if(mediaIsKey("Up"))
            {
                this.FrontPt.Power=60;
            }
            else if(mediaIsKey("Down"))
            {
                if(dotSpeedDir>0)/*Forward*/
                {
                    // brake
                    this.FrontPt.Power=-100;
                    vec3.copy(this.FrontPt.Dir,this.FrontPt.Speed);
                    vec3.normalize(this.FrontPt.Dir,this.FrontPt.Dir);
                } 
                else
                {
                    this.FrontPt.Power=-10;
                }
                
            }
            else
            {
                this.FrontPt.Power=0;
            }


            /* Force wheel adherence */
            vec3.copy(this.FrontPt.Speed,this.FrontPt.Dir);
            vec3.normalize(this.FrontPt.Speed,this.FrontPt.Speed);
            vec3.scale(this.FrontPt.Speed,this.FrontPt.Speed,speedVal);           
            

        }
        else
        {

            vec3.scale(this.FrontPt.Speed,this.FrontPt.Speed,0.0);  
        }

        
        // Update Front
        this.FrontPt.update();
        
        // Compute new Dir
        vec3.subtract(this.Dir,this.FrontPt.Pos,this.BackPt.Pos); 
        vec3.normalize(this.Dir,this.Dir);

        // Update Back
        this.BackPt.Pos[0] = this.FrontPt.Pos[0] - this.Dir[0]*13.0;    
        this.BackPt.Pos[1] = this.FrontPt.Pos[1] - this.Dir[1]*13.0;    
        this.BackPt.Pos[2] = this.FrontPt.Pos[2] - this.Dir[2]*13.0;
        this.BackPt.update();         
        
        // Compute new Dir
        vec3.subtract(this.Dir,this.FrontPt.Pos,this.BackPt.Pos);
        vec3.normalize(this.Dir,this.Dir);

        // Compute new Front Normal 
        vec3.cross(this.FrontNormalDir,this.FrontAxisDir,this.Dir);    
        vec3.normalize(this.FrontNormalDir,this.FrontNormalDir);

        // Compute new Front Axis 
        vec3.cross(this.FrontAxisDir,this.Dir,this.FrontNormalDir);    
        vec3.normalize(this.FrontAxisDir,this.FrontAxisDir);

        // Compute new Back Normal 
        vec3.cross(this.BackNormalDir,this.BackAxisDir,this.Dir);    
        vec3.normalize(this.BackNormalDir,this.BackNormalDir);

        // Compute new Back Axis 
        vec3.cross(this.BackAxisDir,this.Dir,this.BackNormalDir);    
        vec3.normalize(this.BackAxisDir,this.BackAxisDir);

        this.FrontWheelLeftPt.Pos[0] = this.FrontPt.Pos[0]+this.FrontAxisDir[0]*4.0;  
        this.FrontWheelLeftPt.Pos[1] = this.FrontPt.Pos[1]+this.FrontAxisDir[1]*4.0;     
        this.FrontWheelLeftPt.Pos[2] = this.FrontPt.Pos[2]+this.FrontAxisDir[2]*4.0;  
        this.FrontWheelLeftPt.update();

        this.FrontWheelRightPt.Pos[0] = this.FrontPt.Pos[0]-this.FrontAxisDir[0]*4.0;  
        this.FrontWheelRightPt.Pos[1] = this.FrontPt.Pos[1]-this.FrontAxisDir[1]*4.0;     
        this.FrontWheelRightPt.Pos[2] = this.FrontPt.Pos[2]-this.FrontAxisDir[2]*4.0; 
        this.FrontWheelRightPt.update(); 

        // Compute new Front Axis         
        vec3.subtract(this.FrontAxisDir,this.FrontWheelLeftPt.Pos,this.FrontWheelRightPt.Pos);
        vec3.normalize(this.FrontAxisDir,this.FrontAxisDir);

        // Compute new Front Normal          
        vec3.cross(this.FrontNormalDir,this.FrontAxisDir,this.Dir);    
        vec3.normalize(this.FrontNormalDir,this.FrontNormalDir);

        this.BackWheelLeftPt.Pos[0] = this.BackPt.Pos[0]+this.BackAxisDir[0]*4.0;  
        this.BackWheelLeftPt.Pos[1] = this.BackPt.Pos[1]+this.BackAxisDir[1]*4.0;     
        this.BackWheelLeftPt.Pos[2] = this.BackPt.Pos[2]+this.BackAxisDir[2]*4.0;  
        this.BackWheelLeftPt.update();

        this.BackWheelRightPt.Pos[0] = this.BackPt.Pos[0]-this.BackAxisDir[0]*4.0;  
        this.BackWheelRightPt.Pos[1] = this.BackPt.Pos[1]-this.BackAxisDir[1]*4.0;     
        this.BackWheelRightPt.Pos[2] = this.BackPt.Pos[2]-this.BackAxisDir[2]*4.0;  
        this.BackWheelRightPt.update();

        // Compute new Back Axis         
        vec3.subtract(this.BackAxisDir,this.BackWheelLeftPt.Pos,this.BackWheelRightPt.Pos);
        vec3.normalize(this.BackAxisDir,this.BackAxisDir);

        // Compute new Back Normal          
        vec3.cross(this.BackNormalDir,this.BackAxisDir,this.Dir);    
        vec3.normalize(this.BackNormalDir,this.BackNormalDir);

        // Compute new
        vec3.add(this.NormalDir,this.FrontNormalDir,this.BackNormalDir);
        vec3.normalize(this.NormalDir,this.NormalDir);
        
        //Check Collision between front and back        
        var collision = null;
        
        collision = collisionObjectAndGroundGetPoint(this.FrontPt.Pos,this.FrontWheelLeftPt.Pos,null,0);
        if(collision==null) collision = collisionObjectAndGroundGetPoint(this.FrontPt.Pos,this.FrontWheelRightPt.Pos,null,0);
        if(collision==null) collision = collisionObjectAndGroundGetPoint(this.FrontPt.Pos,this.BackPt.Pos,null,0);
        if(collision==null) collision = collisionObjectAndGroundGetPoint(this.BackPt.Pos,this.BackWheelLeftPt.Pos,null,0);
        if(collision==null) collision = collisionObjectAndGroundGetPoint(this.BackPt.Pos,this.BackWheelRightPt.Pos,null,0);
        
        // Restore corret position
        if(collision!=null)
        {
            this.Dir[1]=0;
            vec3.normalize(this.Dir,this.Dir);
            this.NormalDir=[0,1,0];
            this.FrontNormalDir=[0,1,0];
            this.BackNormalDir=[0,1,0];
            vec3.cross(this.FrontAxisDir,this.Dir,this.FrontNormalDir);    
            vec3.normalize(this.FrontAxisDir,this.FrontAxisDir);
            vec3.cross(this.BackAxisDir,this.Dir,this.BackNormalDir);    
            vec3.normalize(this.BackAxisDir,this.BackAxisDir);
        }

        //Update Total Distance (for wheel rotation)
        var currentDistVec=[];
        vec3.subtract(currentDistVec,this.Pos,prevFrontPtPos);
        var currentDist = vec3.length(currentDistVec);
        if(dotSpeedDir<0) //Backward
            currentDist = -currentDist;
        this.Distance += currentDist;

        
        // Process Driver Pos
        this.DriverPos[0] =  this.Pos[0]-this.Dir[0]*10.5;
        this.DriverPos[2] =  this.Pos[2]-this.Dir[2]*10.5;
        this.DriverPos[1] =  this.Pos[1]-this.Dir[1]*10.5;  
        this.DriverPos[0] += this.NormalDir[0]*1.5;
        this.DriverPos[2] +=  this.NormalDir[2]*1.5;
        this.DriverPos[1] +=  this.NormalDir[1]*1.5;   

 
        // Process Driver Exit Pos       
        this.DriverOutPos[0]  =  this.Pos[0]+this.FrontAxisDir[0]*10.0;
        this.DriverOutPos[2]  =  this.Pos[2]+this.FrontAxisDir[2]*10.0;
        this.DriverOutPos[1]  =  this.Pos[1]+this.FrontAxisDir[1]*10.0 + 5.0;

        //Engine sound
        var soundCoef = vec3.length(this.FrontPt.Speed)/5 + 40.0;

        if(!this.EngineOn) soundCoef=0;
        playCarSound(soundCoef);

        //Check enemies collision

        if(this.EngineOn)
        {
            var humanList = CEnemiesInst.getHumansInSphere(this.FrontPt.Pos,20.0);

            for(var i =0 ;i<humanList.length;i++){
                
                var collision = null;
                for(var t=-0.1;t<=1.1;t=t+0.1)
                {
                    var pointA = [t*(prevFrontWheelRightPtPos[0]-prevFrontWheelLeftPtPos[0])+prevFrontWheelLeftPtPos[0],
                                  t*(prevFrontWheelRightPtPos[1]-prevFrontWheelLeftPtPos[1])+prevFrontWheelLeftPtPos[1],
                                  t*(prevFrontWheelRightPtPos[2]-prevFrontWheelLeftPtPos[2])+prevFrontWheelLeftPtPos[2]]
                    var pointB = [t*(this.FrontWheelRightPt.Pos[0]-this.FrontWheelLeftPt.Pos[0])+this.FrontWheelLeftPt.Pos[0],
                                  t*(this.FrontWheelRightPt.Pos[1]-this.FrontWheelLeftPt.Pos[1])+this.FrontWheelLeftPt.Pos[1],
                                  t*(this.FrontWheelRightPt.Pos[2]-this.FrontWheelLeftPt.Pos[2])+this.FrontWheelLeftPt.Pos[2]]
                    collision = humanList[i].getCollisionPoint(pointA,pointB,null,0);
                    if(collision!=null) break;
                }
                if(collision!=null)
                {
                    if(!(humanList[i].IsDead()) )
                    {
                        playSound(wavList[3]);
                        
                        vec3.scale(this.FrontPt.Speed,this.FrontPt.Speed,0.85);     
                    } 
                    humanList[i].BulletCollision(this.FrontPt.Dir,speedVal,1.0,pHuman);    
                }                       
            }

        }

    }

    draw()
    {   
        this.CollisionMatrixList = [];   
        mat4.identity(mvMatrix);
        shaderVertexColorVector = [1.0,1.0,1.0,1.0]; 

        
        mat4.translate(mvMatrix,mvMatrix,this.Pos);
    
        lookAtN(this.Dir,this.NormalDir); 
        
        mat4.translate(mvMatrix,mvMatrix,[0,0.0,-6.5]);
        
        //Collision
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[9.0,7.0,11]);
            mat4.copy(this.EnterCollisionMatrix,mvMatrix);
        mvPopMatrix();


        //Front Wheel   
        var wheelInfoTab = [[ 4, 6.5,this.WheelDir,this.FrontNormalDir,-25],
                        [-4, 6.5,this.WheelDir,this.FrontNormalDir,25],
                        [ 4,-6.5,this.Dir,this.BackNormalDir,-25],
                        [-4,-6.5,this.Dir,this.BackNormalDir,25]];


        
        for (var iWheel=0;iWheel<4;iWheel++)
        {
            var wheelInfo = wheelInfoTab[iWheel];
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,[wheelInfo[0],0,wheelInfo[1]]);
                lookAtN(wheelInfo[2],wheelInfo[3]);
                shaderVertexColorVector = [1.0,1.0,1.0,1.0];  
                for (var i=0;i<360;i+=30)
                {
                    mvPushMatrix();
                        mat4.rotate(mvMatrix,mvMatrix,  degToRad(i)+this.Distance/2, [1, 0, 0]); 
                        mat4.rotate(mvMatrix,mvMatrix,  degToRad(wheelInfo[4]), [0, 0, 1]); 
                        mat4.translate(mvMatrix,mvMatrix,[0.0,0.0,2.0]);    
                        mat4.scale(mvMatrix,mvMatrix,[0.9,1.6,0.8]);
                        Sphere.Draw(SphereShaderProgram);   
                    mvPopMatrix();
                }
                shaderVertexColorVector = [0.0,0.0,0.0,1.0]; 
                mat4.scale(mvMatrix,mvMatrix,[1.0,1.5,1.5]);
                this.storeCollisionMatrix(mvMatrix);
                Sphere.Draw(SphereShaderProgram); 
            mvPopMatrix();
        }

        shaderVertexColorVector = [0.01,0.01,0.01,1.0]; 
        //Structure

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[1.0,0.5,8.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[1.0,0.5,8.5]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,6.5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.4,0.4,5.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,-6.5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.4,0.4,5.0]);
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram);   
        mvPopMatrix();        

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1.9,2]); ; 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(25), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[0.3,0.3,2.9]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram);   
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
            Sphere.Draw(this.ShaderGlowProgram2);   
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
            Sphere.Draw(this.ShaderGlowProgram2);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0.5,-3.825]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(250), [1, 0, 0]); 
            mat4.translate(mvMatrix,mvMatrix,[0,0,1.5]); 
            mat4.scale(mvMatrix,mvMatrix,[1.5,0.5,2]); 
            this.storeCollisionMatrix(mvMatrix);
            Sphere.Draw(this.ShaderGlowProgram2);   
        mvPopMatrix();

    }
}
