class CHuman
{

constructor(pPos) {

    
    var fragmentShaderFire= `
        precision lowp float;
            
        varying vec4 v_position; 
        varying vec4 a_position;      
        uniform vec4 uVertexColor;    
        uniform float uCounter; 
        uniform float uWaterY;

        void main()
        {
        float dist = a_position.y*a_position.y + a_position.x*a_position.x;
        gl_FragColor = vec4(uVertexColor.x,uVertexColor.y,uVertexColor.z,1.0-dist); 
        
        }`;

    var fragmentShaderEyes= `
        precision lowp float;
            
        varying vec4 v_position; 
        varying vec4 a_position;      
        uniform vec4 uVertexColor;    
        uniform float uCounter; 
        uniform float uWaterY;

        void main()
        {
        float dist = a_position.y*a_position.y + a_position.x*a_position.x;
        gl_FragColor = vec4(uVertexColor.x,uVertexColor.y,uVertexColor.z,1.0-dist); 
        
        }`;

    this.Pos=pPos;
    this.Dir=[-1,0,1];
    this.HeadDir=[0,0,0];
    this.GunDir=[0,0,0];
    this.Speed=2.0;
    this.Acc=1;
    this.AngleRange=0
    this.State="Running";
    this.TargetHist=[];
    this.FireShaderProgram =  initShaders(vertexShader1,fragmentShaderFire);
    this.EyesShaderProgram =  initShaders(vertexShader1,fragmentShaderEyes);
    this.HitTarget = false;
    this.IsTouched = false;
    this.AnimCounter=0;
    
    this.AnimDir = new CTimeAnim();
    this.AnimReload = new CTimeAnim();
    this.AnimSpeedFall=  new CTimeAnim();
    this.AnimBodyFall = new CTimeAnim();
    this.AnimDead = new CTimeAnim();

    this.MvMatrix_Box = mat4.create(); 
    this.MvMatrix_Head = mat4.create(); 
    this.MvMatrix_Neck = mat4.create(); 
    this.MvMatrix_Body = mat4.create(); 
    this.MvMatrix_Shouldern = mat4.create(); 
    this.MvMatrix_LeftArmP1 = mat4.create(); 
    this.MvMatrix_LeftArmP2 = mat4.create(); 
    this.MvMatrix_LeftHand = mat4.create(); 
    this.MvMatrix_LeftLegP1 = mat4.create(); 
    this.MvMatrix_LeftLegP2 = mat4.create(); 
    this.MvMatrix_LeftLegP3 = mat4.create(); 
    this.MvMatrix_RightArmP1 = mat4.create(); 
    this.MvMatrix_RightArmP2 = mat4.create(); 
    this.MvMatrix_RightHand = mat4.create(); 
    this.MvMatrix_RightLegP1 = mat4.create(); 
    this.MvMatrix_RightLegP2 = mat4.create(); 
    this.MvMatrix_RightLegP3 = mat4.create(); 

    this.sqrDist = vec3.squaredDistance(this.Pos,pPos);

}



UpdateControled(pPos,pCamDir,pRunning,pRunDir,pFire)
{

    
    var elapsed = timeGetElapsedInS();

    var projDir = [];
    vec3.rotateY(projDir,pCamDir,[0,0,0],0.2);
    this.Pos[0] = projDir[0]*15+pPos[0];
    this.Pos[2] = projDir[2]*15+pPos[2];
    this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2])+5.5 ;
    

    // Update Anim Counter
    this.AnimCounter  += 8.0*elapsed;
    if (this.AnimCounter > 10.0 * Math.PI)  this.AnimCounter = 10.0 * Math.PI - this.AnimCounter;
    

    if(pRunning)
    {
        this.AngleRange=4;
    
        this.State="Running";
        this.Dir[0] = -pRunDir[0];
        this.Dir[1] = 0;
        this.Dir[2] = -pRunDir[2];
    }
    else
    {
        this.AngleRange=0.05;
        this.State="Running";

    }
    vec3.copy(this.HeadDir,this.Dir);
    

    if(pFire)    
    {
        this.HeadDir[0] =   -pCamDir[0];
        this.HeadDir[1] =   -pCamDir[1];
        this.HeadDir[2] =   -pCamDir[2];
         this.State="FireStart";
    }
    
    vec3.copy(this.GunDir,this.HeadDir);
}

Update(pPos,pDir,pFire)
{

    if (this.IsDead()) return;

    var elapsed = timeGetElapsedInS();

    //Human collision Detection
    this.IsInTarget =  cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_Box) &&  
    (    
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_Head) ||  
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_Neck) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_Body) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_Shouldern) ||  
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftArmP1) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftArmP2) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftHand) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftLegP1) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftLegP2) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_LeftLegP3) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightArmP1) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightArmP2) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightHand) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightLegP1) ||  
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightLegP2) ||   
        cubeIsRayCollisionDetected(pPos,pDir,this.MvMatrix_RightLegP3)
    ) ;
    
    if (this.State!="Disappear")
    {
        //  Speed 
        this.Speed += elapsed*this.Acc;
        if (this.Speed> 8.0) { this.Speed=8.0; this.Acc=-1;}
        if (this.Speed< 1.0) { this.Speed=1.0; this.Acc=1;}
    
        //  Dir 
        if (!this.AnimDir.running && this.State!="Disappear" )
        {
            var animStart=[this.Dir[0],this.Dir[1],this.Dir[2]];
            var animEnd=[Math.random()-0.5,0.0,Math.random()-0.5];
            var animDuration = 10000 + Math.random()*10000;
            this.AnimDir.start(animDuration,animStart,animEnd);
        }
        this.Dir = this.AnimDir.getVec3Value();
        vec3.normalize(this.Dir,this.Dir);

        // Position   
        this.AngleRange = this.Speed;
        var elapsedFactor = ( 8.0*elapsed)/Math.PI;
        var distFeet6 = Math.sin(degToRad(this.AngleRange*6.0));
        var distFeet12 = Math.sin(degToRad(this.AngleRange*10.0));
        var distFeet = distFeet6*2.0 + distFeet6*1.0 + distFeet12*1.0;
        var speed = distFeet * elapsedFactor;
        this.Pos[2] -= speed * 2.0 * this.Dir[2];
        this.Pos[0] -= speed * 2.0 * this.Dir[0];
        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2])+5.5 ;

        // Gun Target Dir
        //Process history of target position to simulate reaction time of 0,3s
        this.TargetHist.push([timeGetCurrentInS(),[pPos[0],pPos[1],pPos[2]]]);	
        var gunTargetPos=this.TargetHist[0][1];
        while (( timeGetCurrentInS() - this.TargetHist[0][0]) > 0.3){
            gunTargetPos = this.TargetHist.shift()[1];
        } 
        gunTargetPos = [gunTargetPos[0] ,gunTargetPos[1]-3.5,gunTargetPos[2]];
        vec3.subtract(this.GunDir,this.Pos,gunTargetPos);
        vec3.normalize(this.GunDir,this.GunDir);

        // Head Dir
        var dotProd =vec3.dot(this.GunDir,this.Dir);
        var turnFactor = (dotProd + 1.0) /2.0;
        vec3.copy(this.HeadDir,this.GunDir);
        this.HeadDir = [this.GunDir[0]*turnFactor+ (1.0 - turnFactor)*this.Dir[0],this.GunDir[1]*turnFactor+ (1.0 - turnFactor)*this.Dir[1],this.GunDir[2]*turnFactor + (1.0 - turnFactor)*this.Dir[2]];


        // Update Anim Counter
        this.AnimCounter  += 8.0*elapsed;
        if (this.AnimCounter > 10.0 * Math.PI)  this.AnimCounter = 10.0 * Math.PI - this.AnimCounter;
    }

    // Update Sqr Dist
    this.sqrDist = vec3.squaredDistance(this.Pos,pPos);

    this.HitTarget=false;
    // Human State Machine
    //  =>test angle between target and human direction
    switch (this.State) {
        case "Running":
            if (dotProd> 0.5 && this.sqrDist < 10000) this.State = "FireStart";
            if (pFire && this.IsInTarget) this.State = "StartFalling";
            break;
        case "FireStart":            
            this.State  = "Fire";
            if (pFire && this.IsInTarget) this.State = "StartFalling";
            break;
        case "Fire":
            //Collision detection
            var targetDir =  vec3.create();	
            var fireVector =  vec3.create();
            var distVector  =  vec3.create();
            var targetPos = [pPos[0] ,pPos[1]-3.5,pPos[2]];
            vec3.subtract(targetDir,this.Pos,targetPos);
            var fireDist = vec3.dot(targetDir,this.GunDir);
            var enemieDist = vec3.distance(this.Pos,targetPos);		
            var dist = Math.sqrt(enemieDist**2 - fireDist**2);   
            this.HitTarget = (dist < 1 || isNaN(dist));
            //Start  Reload Animation
            this.AnimReload.start(500,0,2*3.14);
            this.State  = "Reload";
            if (pFire && this.IsInTarget) this.State = "StartFalling";
            break;
        case "Reload":
            if (pFire && this.IsInTarget)             this.State = "StartFalling";
            else if (dotProd< 0.5 || this.sqrDist > 10000)   this.State = "Running"; 
            else if (!this.AnimReload.running) this.State = "FireStart"; 
            break;
        case "StartFalling":
            this.AnimSpeedFall.start(1000,this.AngleRange,1);
            this.AnimBodyFall.start(1000,0,1);
            this.State = "Falling";
            break;
        case "Falling":
            if (!this.AnimSpeedFall.running){
                this.State = "Disappear"; 
                this.AnimDead.start(5000,0,1);
            } 
            this.AngleRange= this.AnimSpeedFall.getValue();
            break;
        case "Disappear":
            if (!this.AnimDead.running) this.State = "Dead";
            this.AngleRange= 1;
            break;
        case "Dead":
            break;
    }

};


IsDead()
{ 
    return this.State=="Dead";
}

_ArmDraw(pAnimCounter,pIsLeft)
{
    //Arm Part 1
    var  armDownAngle=0;

    switch (this.State) {
        
        case "Fire":
        case "FireStart":    
        case "Reload":
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-86), [1, 0, 0]);
            armDownAngle = (Math.sin(this.AnimReload.getValue() + Math.PI/2)-1.0)*this.AngleRange*3.0;
            break;
        default:
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0), [1, 0, 0]);
            armDownAngle = (Math.sin(pAnimCounter + Math.PI/2)-1.0)*this.AngleRange*3.0;
            break;
    }

    mat4.translate(mvMatrix,mvMatrix, [0,-0.6,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.9,0.3]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftArmP1,mvMatrix) : mat4.copy(this.MvMatrix_RightArmP1,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();    
    
    //ArmDown    
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mat4.rotate(mvMatrix,mvMatrix, degToRad(armDownAngle), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.8,0.3]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftArmP2,mvMatrix) : mat4.copy(this.MvMatrix_RightArmP2,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();
    //Hand    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    //mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*this.AngleRange*3.0), [1, 0, 0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.3]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftHand,mvMatrix) : mat4.copy(this.MvMatrix_RightHand,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();   

    //Gun    
    shaderVertexColorVector = [1.0,1.0,1.0,1.0];
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0.6]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.2,1.0,0.2]);
    cubeDraw(shaderProgram);
    mvPopMatrix();
    mvPushMatrix();
    mat4.translate(mvMatrix,mvMatrix, [0.0,0.4,-0.5]);
    mat4.scale(mvMatrix,mvMatrix,[0.2,0.2,0.6]);        
    cubeDraw(shaderProgram);
    mvPopMatrix();   
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  


    if(this.State == "FireStart")
    {
        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.0]);
       // squareDraw(this.FireShaderProgram);	
        squareDraw(shaderProgram2);	
        mvPopMatrix();

        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
        //squareDraw(this.FireShaderProgram);	
        squareDraw(shaderProgram2);	
        mvPopMatrix();
    }
}


_LegDraw(pX,pY,pAnimCounter,pIsLeft)
{

    //cuisse
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-1.0,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftLegP1,mvMatrix) : mat4.copy(this.MvMatrix_RightLegP1,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();    
    //Molet
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*this.AngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftLegP2,mvMatrix) : mat4.copy(this.MvMatrix_RightLegP2,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();
    //Shoes       
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*this.AngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.6]);
        (pIsLeft) ? mat4.copy(this.MvMatrix_LeftLegP3,mvMatrix) : mat4.copy(this.MvMatrix_RightLegP3,mvMatrix);
        cubeDraw(shaderProgram);
        cubeDraw(shaderProgram);
    mvPopMatrix();   

    mvPopMatrix();


}

Draw()
{
    
    if (this.IsDead()) return;
    
    var animCounter = this.AnimCounter;
    var lookAtMatrix = mat4.create();
	mat4.identity(mvMatrix);

    shaderVertexColorVector = [0.99,0.76,0.67,1.0];
    //body movement
    mat4.translate(mvMatrix,mvMatrix, this.Pos);

    mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.Dir,[0,1,0]);
    mat4.invert(lookAtMatrix,lookAtMatrix);
    mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);

    mat4.rotate(mvMatrix,mvMatrix,  degToRad(this.AngleRange*1.0) , [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,Math.sin(animCounter*2.0)*this.AngleRange/40.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(animCounter)*this.AngleRange*0.5), [0, 0, 1]);


    // Falling Annimation
    if (this.State == "Falling" || this.State == "Disappear")
    {
        var bodyFallCoef = this.AnimBodyFall.getValue()**2;
        var disapeardCoef = this.AnimDead.getValue()**2;
        //mat4.translate(mvMatrix,mvMatrix, [0,bodyFallCoef*40,0]);
        if (this.State == "Disappear")  mat4.translate(mvMatrix,mvMatrix, [0,-disapeardCoef*5.0,0]);
        mat4.translate(mvMatrix,mvMatrix, [0,-5,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(bodyFallCoef*90), [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0,5,0]);
    }

    // Collision Box
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[10.0,10.0,10.0]);
        mat4.copy(this.MvMatrix_Box,mvMatrix);
        //cubeDraw(shaderProgram);           
    mvPopMatrix();
 

    // body
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[0.8,2.0,0.4]);
        mat4.copy(this.MvMatrix_Body,mvMatrix);
        cubeDraw(shaderProgram);           
    mvPopMatrix();
 
    //shouldern
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,1.7,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0 ]);
        mat4.scale(mvMatrix,mvMatrix,[0.4,0.3,0.9]);
        mat4.copy(this.MvMatrix_Shouldern,mvMatrix);
        cubeDraw(shaderProgram);       
    mvPopMatrix(); 

    //neck
    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0,2.3,0]);
        mat4.scale(mvMatrix,mvMatrix,[0.2,0.3,0.3]);
        cubeDraw(shaderProgram);       
    mvPopMatrix(); 

    
    //head
    mvPushMatrix(); 
        mat4.translate(mvMatrix,mvMatrix, [0,3.0,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
		mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.HeadDir,[0,1,0]);
		mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.5,0.5,0.4]); 
            mat4.copy(this.MvMatrix_Head,mvMatrix);
        	cubeDraw(shaderProgram);    
    	mvPopMatrix();
		//ears
        mvPushMatrix();
   			shaderVertexColorVector = [1.0,1.0,1.0,1.0];
        	mat4.scale(mvMatrix,mvMatrix,[0.6,0.2,0.2]); 
        	cubeDraw(shaderProgram);    
    	mvPopMatrix();
		//eyes
       		mat4.translate(mvMatrix,mvMatrix, [0.0,0.2,0.5]);
        mvPushMatrix();
             shaderVertexColorVector = [0.8,0.8,0.8,1.0];
       		mat4.translate(mvMatrix,mvMatrix, [-0.3,0.0,0.0]);
        	mat4.scale(mvMatrix,mvMatrix,[0.1,0.1,0.05]); 
			cubeDraw(shaderProgram3);   
    	mvPopMatrix();
        mvPushMatrix();
            shaderVertexColorVector = [0.8,0.8,0.8,1.0];
       		mat4.translate(mvMatrix,mvMatrix, [0.3,0.0,0.0]);
        	mat4.scale(mvMatrix,mvMatrix,[0.1,0.1,0.05]); 
			cubeDraw(shaderProgram3);   
    	mvPopMatrix();


    mvPopMatrix(); 

    shaderVertexColorVector = [0.99,0.76,0.67,1.0];
    //Legs
    this._LegDraw(0.5,-1.5,animCounter,true);
    this._LegDraw(-0.5,-1.5,animCounter  +  Math.PI,false);
    //Arms

    
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [-1.2,1.7,0.0]);
    if(this.State == "Reload" || this.State == "Fire" || this.State == "FireStart" )
    {
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.Dir,[0,1,0]);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.GunDir,[0,1,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
    }
    this._ArmDraw(animCounter,true);
    mvPopMatrix();

        
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [1.2,1.7,0.0]);
    if(this.State == "Reload" || this.State == "Fire" || this.State == "FireStart" )
    {
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.Dir,[0,1,0]);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],this.GunDir,[0,1,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
    }
    this._ArmDraw(animCounter  +  Math.PI,false);
    mvPopMatrix();
    

	mat4.identity(mvMatrix)

}
}