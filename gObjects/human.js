var CEnemiesInst;
var CHumansInst;


class CEnemies
{

    constructor(pNbEnemies)
    {
        this.humans=[];
        for(var i =0 ;i<pNbEnemies;i++){
            this.humans.push(new CHuman([i*20,0,0],Math.random()*8));
		}	
        this.NbALive=pNbEnemies;
        this.HitTarget=false;
        this.IsInTarget=false;
        CEnemiesInst = this;
    }



    update(pCamPos,pCamDir,pHeroPos,pHeroDir,pHeroFire)
    {
        this.HitTarget=false;
        this.IsInTarget=false;
        this.NbALive=0;
        for(var i =0 ;i<this.humans.length;i++){
            this.humans[i].UpdateEnemie(pCamPos,pCamDir,pHeroPos,pHeroDir,pHeroFire)
            if(!(this.humans[i].IsDead()))
            { 
                this.NbALive++;
            }
            this.HitTarget = this.HitTarget || this.humans[i].HitTarget;
            this.IsInTarget =  this.IsInTarget || this.humans[i].IsInTarget;
		} 
    }

    draw()
    {
        for(var i =0 ;i<this.humans.length;i++){
            this.humans[i].draw()
		} 

    }

    getCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
    {
        var collision = pLastCollPt;
        for(var i =0 ;i<this.humans.length;i++){
            collision = this.humans[i].GetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
        }
        return collision;
    }

    
    getHumansInSphere(pCenter,pRadius)
    {
        var humanList = [];
        var squaredRadius = pRadius*pRadius;

        for(var i =0 ;i<this.humans.length;i++){
            if (vec3.squaredDistance(this.humans[i].Pos,pCenter) < squaredRadius)
            {
                humanList.push(this.humans[i]);
            }
        }
        return humanList;
    }

}


class CHuman
{

constructor(pPos,pSpeed) {

    
    var fragmentShaderEnemyFire= `
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

    var fragmentShaderHeroFire = `

        precision lowp float;
            
        varying vec4 v_position; 
        varying vec4 a_position;      
        uniform vec4 uVertexColor;    
        uniform float uCounter; 
        uniform float uWaterY;

        void main()
        {
        float dist = a_position.y*a_position.y + a_position.x*a_position.x;
        gl_FragColor = vec4(1.0-dist,1.0-dist,0.0,cos(uCounter*6.0)-dist ); 
        
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

    var fragmentShaderHuman= `
        precision lowp float;
        
        varying vec3 v_normal;     
        uniform vec4 uVertexColor;   
        
        void main() {
          float light;

          light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 
          
          gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
        }
    `;

    this.Pos=pPos;
    this.HSpeed=0;
    this.VSpeed=0;
    this.VAcc=-100.0;
    this.Dir=[-1,0,1];
    this.HeadDir=[0,0,0];
    this.GunDir=[0,0,0];
    this.Speed=pSpeed;
    this.Acc=1;
    this.AngleRange=0
    this.State="Running";
    this.TargetHist=[];
    this.FireHeroShaderProgram =  initShaders(vertexShader1,fragmentShaderHeroFire);
    this.FireEnemyShaderProgram =  initShaders(vertexShader1,fragmentShaderEnemyFire);
    this.EyesShaderProgram =  initShaders(vertexShader1,fragmentShaderEyes);
    this.HumanShaderProgram =  initShaders(vertexShader1,fragmentShaderHuman);
    this.HitTarget = false;
    this.IsTouched = false;
    this.AnimCounter=0;
    this.Hero = false; 

    this.Bazooka = false;
    this.BazookaWeapon = 0;
    this.BazookaState = "Ready";
    
    this.AnimDir = new CTimeAnim();
    this.AnimReload = new CTimeAnim();
    this.AnimSpeedFall=  new CTimeAnim();
    this.AnimBodyFall = new CTimeAnim();
    this.AnimDead = new CTimeAnim();

    this.MvMatrix_Box = mat4.create();
    this.CollisionMatrixList = [];

    this.sqrDist = vec3.squaredDistance(this.Pos,pPos);

}




UpdateHero(pRunDir,pRunning,pFire,pFireDir,pDead,pStone)
{

    var elapsed = timeGetElapsedInS();
    var newPos=[];
    
    //Store Hero New Position
    this.HSpeed  =  (pRunning) ? 50 : 0;

    //Store current Pos In New Pos
    vec3.copy(newPos,this.Pos);
    
    //Horizontal Collision with Stone
    var newHorizontalPos=[];
    newHorizontalPos[0] = this.Pos[0] + this.HSpeed*elapsed*pRunDir[0];
    newHorizontalPos[2] = this.Pos[2] + this.HSpeed*elapsed*pRunDir[2];
    newHorizontalPos[1] = this.Pos[1] ;
    
    
    var horzCollisionPos = collisionObjectGetPoint(this.Pos,newHorizontalPos,null,0);

    if (horzCollisionPos==null && pRunning )
    {
        //Vertical Collision to detect new y Pos
        var tmpNewPos=[];
        vec3.copy(tmpNewPos,newHorizontalPos);
        this.VSpeed += this.VAcc*elapsed;
        tmpNewPos[1] += this.VSpeed - 5.5;
        var collisionPos = collisionObjectGetPoint(newHorizontalPos,tmpNewPos,null,0);
        var groundY =  groundGetY(tmpNewPos[0],tmpNewPos[2]);
        if(collisionPos!=null) 
        {
            tmpNewPos[1] = collisionPos[1];
            this.VSpeed = 0;
        }
        if(tmpNewPos[1]<groundY) tmpNewPos[1]  = groundY;
        {
            this.VSpeed = 0;
        }

        //Final Collision
        tmpNewPos[1] += 5.5;
        var collisionPos1 = collisionObjectGetPoint(this.Pos,tmpNewPos,null,16.0);
        tmpNewPos[1] += 5.0;
        this.Pos[1] += 5.0;
        var collisionPos2 = collisionObjectGetPoint(this.Pos,tmpNewPos,null,0);
        
        tmpNewPos[1] -= 5.0;
        this.Pos[1] -= 5.0;	

        if(collisionPos1==null && collisionPos2==null ) 
        {			
            vec3.copy(newPos,tmpNewPos);
        }
        
    }
    else
    {
        //Vertical Collision
        this.VSpeed += this.VAcc*elapsed;;
        newPos[1] += this.VSpeed - 5.5;
        var collisionPos = pStone.getCollisionPoint(this.Pos,newPos,null,0);
        var groundY =  groundGetY(newPos[0],newPos[2]);
        if(collisionPos!=null) 
        {
            newPos[1] = collisionPos[1];
            this.VSpeed = 0;
        }
        if(newPos[1]<groundY)
        { 
            newPos[1]  = groundY;
            this.VSpeed = 0;
        }
        newPos[1] += 5.5;
    }

    // Bazooka
    if(gunsCheckCollision(this.Pos,newPos) != null)
    {
        this.Bazooka = true;
        this.BazookaWeapon = 10;
        this.BazookaState = "Ready";
    }
       

     //Collision Check is finished apply new pos to current
     vec3.copy(this.Pos,newPos);


    if(pDead && this.State!= "Falling")
    {
        this.AnimSpeedFall.start(1000,this.AngleRange,1);
        this.AnimBodyFall.start(1000,0,1);
        this.State = "Falling";
    }
    else if (!pDead)
    {
        
        this.Dir[0] = -pRunDir[0];
        this.Dir[1] = 0;
        this.Dir[2] = -pRunDir[2];    
        this.State="Running";

        if(pRunning)
        {
            this.AngleRange=4;     
        }
        else
        {
            this.AngleRange=0.05;

        }
        vec3.copy(this.HeadDir,this.Dir);
        

        if(pFire)    
        {
            this.HeadDir[0] =  -pFireDir[0];
            this.HeadDir[1] =  -pFireDir[1];
            this.HeadDir[2] =  -pFireDir[2];
            this.State="Fire";
            this.Hero = true;
        }
        
        vec3.copy(this.GunDir,this.HeadDir);



        //Bazooka to heavy for rotation
        if (this.BazookaWeapon > 0)
        {
            vec3.copy(this.Dir,this.GunDir); 
            if (this.BazookaState == "Ready" && pFire)
            {
                var size = 0.6;
                var speed = 300;
                var fireDir = [];
                fireDir[0] = -this.GunDir[0];
                fireDir[1] = -this.GunDir[1];
                fireDir[2] = -this.GunDir[2];
                var pos = [];
                pos[0] = this.Pos[0] + this.GunDir[2]*0.8;
                pos[1] = this.Pos[1];
                pos[2] = this.Pos[2] -this.GunDir[0]*0.8 ;
                gunsFire(size,speed,fireDir,pos);
                this.BazookaState = "Fire";
                this.BazookaWeapon--;
            }
            if(this.BazookaState == "Fire" && !pFire)
            {
                this.BazookaState = "Ready";  
            }

        }

        //Switch gun when no more weapons
        this.Bazooka = (this.BazookaWeapon >0) ;
        gunsControl(this.Bazooka );


        //Orientation and BackWardsRunning
        if (vec3.dot(this.Dir,this.GunDir) <-0.75)
        {
            vec3.scale(this.Dir,this.Dir,-1);
            this.AnimCounter  -= 8.0*elapsed;
            if (this.AnimCounter > 10.0 * Math.PI)  this.AnimCounter = 10.0 * Math.PI - this.AnimCounter;
        }
        
        else
        {
            this.AnimCounter  += 8.0*elapsed;
            if (this.AnimCounter < -10.0 * Math.PI)  this.AnimCounter = -10.0 * Math.PI - this.AnimCounter;
        }

    }
}

UpdateEnemie(pCamPos,pCamDir,pHeroPos,pHeroDir,pHeroFire)
{

    if (this.State=="Dead") return;

    var elapsed = timeGetElapsedInS();

    //Human collision Detection
    this.IsInTarget = false;
    if (cubeIsRayCollisionDetected(pCamPos,pCamDir,this.MvMatrix_Box))
    {
        for (var i=0;i<this.CollisionMatrixList.length;i++)
        {
            this.IsInTarget = Sphere.IsRayCollisionDetected(pCamPos,pCamDir,this.CollisionMatrixList[i]);
            if (this.IsInTarget ) break;
        }   
    }  
    
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
        var distFeet = distFeet6*3.4 + distFeet6*1.9 + distFeet12*1.5;
        var speed = distFeet * elapsedFactor;
        var tmpNewPos=[];

        var rotationAngle = 0;
        do{
            tmpNewPos[2]  = this.Pos[2] - speed * 2.0 * this.Dir[2];
            tmpNewPos[0]  = this.Pos[0] - speed * 2.0 * this.Dir[0];
            tmpNewPos[1]  = groundGetY(tmpNewPos[0], tmpNewPos[2]) ;
            if (waterIsUnder(tmpNewPos[1]))
            {
                rotationAngle+=0.5
                vec3.rotateY(this.Dir,this.Dir,[0,0,0],rotationAngle);
                this.AnimDir.running = false;
            }
        } while(waterIsUnder(tmpNewPos[1]) && rotationAngle<6.5);
         
        tmpNewPos[1]  = tmpNewPos[1] +5.5 ;
        vec3.copy(this.Pos,tmpNewPos);      

        // Gun Target Dir
        //Process history of target position to simulate reaction time of 0,3s
        this.TargetHist.push([timeGetCurrentInS(),[pHeroPos[0],pHeroPos[1],pHeroPos[2]]]);	
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
        if (this.AnimCounter > (10 * Math.PI) )  this.AnimCounter = 10.0 * Math.PI - this.AnimCounter;
    }

    // Update Sqr Dist
    this.sqrDist = vec3.squaredDistance(this.Pos,pHeroPos);

    this.HitTarget=false;
    // Human State Machine
    //  =>test angle between target and human direction
    switch (this.State) {
        case "Running":
            if (dotProd> 0.5 && this.sqrDist < 10000) this.State = "Fire";
            if (pHeroFire && this.IsInTarget) this.State = "StartFalling";
            break;
        case "Fire":       
            //Collision detection
            var targetDir =  vec3.create();	
            var fireVector =  vec3.create();
            var distVector  =  vec3.create();
            var targetPos = [pHeroPos[0] ,pHeroPos[1]-3.5,pHeroPos[2]];
            vec3.subtract(targetDir,this.Pos,targetPos);
            var fireDist = vec3.dot(targetDir,this.GunDir);
            var enemieDist = vec3.distance(this.Pos,targetPos);		
            var dist = Math.sqrt(enemieDist**2 - fireDist**2);   
            this.HitTarget = (dist < 1 || isNaN(dist));
            //Start  Reload Animation
            this.AnimReload.start(500,0,2*3.14);
            this.State  = "Reload";
            if (pHeroFire && this.IsInTarget) this.State = "StartFalling";
            break;
        case "Reload":
            if (pHeroFire && this.IsInTarget)             this.State = "StartFalling";
            else if (dotProd< 0.5 || this.sqrDist > 10000)   this.State = "Running"; 
            else if (!this.AnimReload.running) this.State = "Fire"; 
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

BulletCollision()
{
    if(!this.IsDead()) 
    {
        this.State = "StartFalling";
    } 
}

GetCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
{
    var collision = Sphere.GetCollisionPosUsingMatrixList(pRayPoint1,pRayPoint2,this.CollisionMatrixList,pLastCollPt,pDistSquaredOffset,this)    
    return (collision);
}


IsDead()
{ 
    return (this.State=="Dead"  || this.State=="Disappear" || this.State=="Falling" );
}

_ArmDraw(pAnimCounter,pIsLeft)
{
    //Arm Part 1
    var  armUpAngle=0;
    var  armDownAngle=0;

    if (this.Bazooka && this.Hero)  
    { 
        armDownAngle=-90;
        armUpAngle=0;
    }
    else
    {
        switch (this.State) {
            
            case "Fire":    
            case "Reload":
                armUpAngle= degToRad(-86);
                armDownAngle = (Math.sin(this.AnimReload.getValue() + Math.PI/2)-1.0)*this.AngleRange*3.0;
                break;
            default:
                armUpAngle =  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0);
                armDownAngle = (Math.sin(pAnimCounter + Math.PI/2)-1.0)*this.AngleRange*3.0;
                break;
        }
    }

    
    mat4.rotate(mvMatrix,mvMatrix,  armUpAngle, [1, 0, 0]);
    
    shaderVertexColorVector = [0.2,0.2,0.2,1.0]; 

    mat4.translate(mvMatrix,mvMatrix, [0,-0.9,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.4,1.0,0.4]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram); 
    mvPopMatrix();    
    
    //ArmDown    
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0]);
    mat4.rotate(mvMatrix,mvMatrix, degToRad(armDownAngle), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.32,0.8,0.32]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram); 
    mvPopMatrix();
    //Hand    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.25,0.6,0.25]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram); 
    mvPopMatrix();   


    if (this.Bazooka && this.Hero)  
    { 
        if (pIsLeft)
        {
            mvPushMatrix();  
                mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
                mat4.translate(mvMatrix,mvMatrix,[0.0,-1.0,-0.5]); 
                gunsDrawFct();    
            mvPopMatrix(); 
        }
    } 
    else
    {
        //Gun    
        shaderVertexColorVector = [1.0,1.0,1.0,1.0];
        mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0.6]);
        mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.2,1.0,0.2]);
        cubeDraw(this.HumanShaderProgram);
        mvPopMatrix();
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.4,-0.5]);
        mat4.scale(mvMatrix,mvMatrix,[0.2,0.2,0.6]);        
        cubeDraw(this.HumanShaderProgram);
        mvPopMatrix();   
        shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    }


    if(this.State == "Fire" && !this.Bazooka)
    {
        
        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.0]);
        (this.Hero) ? squareDraw(this.FireHeroShaderProgram) : squareDraw(this.FireEnemyShaderProgram);
        mvPopMatrix();
        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
        if (this.Hero)
        {
            gl.uniform1f (this.FireHeroShaderProgram.counter, shaderCounter);
            squareDraw(this.FireHeroShaderProgram)
        }   
        else
        {
             squareDraw(this.FireEnemyShaderProgram);
        }
        mvPopMatrix();
    }
}


_LegDraw(pX,pY,pAnimCounter,pIsLeft)
{

    

    //cuisse
    mvPushMatrix();  
        shaderVertexColorVector = [0.2,0.2,0.2,1.0]; 
        mat4.translate(mvMatrix,mvMatrix, [pX,pY,0.08]);
        if (this.State != "Falling" && this.State != "Disappear")
        {
            lookAt([this.Dir[0],0,this.Dir[2]]);
        }
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0), [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0,-1.9,0]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.46,1.9,0.5]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.HumanShaderProgram); 
        mvPopMatrix();    
        //Molet
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.3,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*this.AngleRange*3.0), [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.3,0]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.4,1.3,0.4]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.HumanShaderProgram); 
        mvPopMatrix();
        //Shoes       
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*this.AngleRange*3.0), [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.7]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.HumanShaderProgram);     
        mvPopMatrix();   

    mvPopMatrix();


}

draw()
{

    if (this.State=="Dead") return;
    
    var animCounter = this.AnimCounter;
    
    this.CollisionMatrixList = [];
	mat4.identity(mvMatrix);

    shaderVertexColorVector = [0.99,0.76,0.67,1.0];
    //body movement
    mat4.translate(mvMatrix,mvMatrix, this.Pos);

    lookAt([this.HeadDir[0]+this.Dir[0],0,this.HeadDir[2]+this.Dir[2]])
    

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


    // body down
    mvPushMatrix();  
        shaderVertexColorVector = [1.0,1.0,1.0,1.0];
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,-0.05]);
        mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,0.55]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram); 
    mvPopMatrix();
 
    // body middle
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,1.0,0]);
        mat4.scale(mvMatrix,mvMatrix,[0.8,1.2,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram);       
    mvPopMatrix();     

    // body up
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,2.0,0]);
        mat4.scale(mvMatrix,mvMatrix,[1.0,1.0,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram);       
    mvPopMatrix(); 

    // shouldern
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,2.60,0]);
        mat4.scale(mvMatrix,mvMatrix,[1.5,0.6,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram);       
    mvPopMatrix(); 

    shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
    //neck
    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0,3.5,0]);
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.8,0.3]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.HumanShaderProgram);
    mvPopMatrix(); 

    
    //head
    mvPushMatrix(); 
        mat4.translate(mvMatrix,mvMatrix, [0,4.2,0]);
        lookAt(this.HeadDir);

        shaderVertexColorVector = [0.25,0.2,0.2,1.0]; 
        //Hair
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,0.05,-0.04]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [1, 0, 0]);
            mat4.scale(mvMatrix,mvMatrix,[0.53,0.53,0.53]); 
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.HumanShaderProgram);
    	mvPopMatrix();      
    	
        shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
   
        //Head
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.25,0.1]);
            mat4.scale(mvMatrix,mvMatrix,[0.48,0.6,0.5]); 
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.HumanShaderProgram);
    	mvPopMatrix();

    	//Nose
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.2,0.55]);
            mat4.scale(mvMatrix,mvMatrix,[0.1,0.1,0.1]); 
            Sphere.Draw(this.HumanShaderProgram);
    	mvPopMatrix();

    	//Mooth
        shaderVertexColorVector = [0.99,0.,0.1,1.0]; 
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.5,0.55]);
            mat4.scale(mvMatrix,mvMatrix,[0.1,0.025,0.02]); 
            Sphere.Draw(this.HumanShaderProgram);
    	mvPopMatrix();

        shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
    	//ears
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0,-0.1,0]);
        	mat4.scale(mvMatrix,mvMatrix,[0.55,0.3,0.2]); 
            Sphere.Draw(this.HumanShaderProgram);
        mvPopMatrix();

		//eyes
        shaderVertexColorVector = [1.0,1.0,1.0,1.0];
       	mat4.translate(mvMatrix,mvMatrix, [0.0,0.04,0.49]);
        mvPushMatrix();
       		mat4.translate(mvMatrix,mvMatrix, [-0.21,0.0,0.0]);
            mat4.scale(mvMatrix,mvMatrix,[0.1,0.08,0.05]);         
            Sphere.Draw(this.HumanShaderProgram);    
    	mvPopMatrix();

        mvPushMatrix();
       		mat4.translate(mvMatrix,mvMatrix, [0.21,0.0,0.0]);
            mat4.scale(mvMatrix,mvMatrix,[0.1,0.08,0.05]);             
            Sphere.Draw(this.HumanShaderProgram);  
        mvPopMatrix();       
        
        shaderVertexColorVector = [0.5,0.5,0.8,1.0];
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.01]);
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [-0.21,0.0,0.0]);
            mat4.scale(mvMatrix,mvMatrix,[0.05,0.05,0.05]);         
            Sphere.Draw(this.HumanShaderProgram);    
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.21,0.0,0.0]);
            mat4.scale(mvMatrix,mvMatrix,[0.05,0.05,0.05]);             
            Sphere.Draw(this.HumanShaderProgram);  
        mvPopMatrix();


    mvPopMatrix(); 

    //Legs
    this._LegDraw(0.46,0.2,animCounter,true);
    this._LegDraw(-0.46,0.2,animCounter  +  Math.PI,false);
    //Arms

    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [-1.2,2.6,0.0]);
    if(this.State == "Reload" || this.State == "Fire" )
    {
        lookAt(this.GunDir);
    }
    this._ArmDraw(animCounter,true);
    mvPopMatrix();

        
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [1.2,2.6,0.0]);
    if(this.State == "Reload" || this.State == "Fire" )
    {
        lookAt(this.GunDir);
    }
    this._ArmDraw(animCounter  +  Math.PI,false);
    mvPopMatrix();
    
    // Collision Box
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[6.0,7.0,6.0]);
        mat4.copy(this.MvMatrix_Box,mvMatrix);
       // shaderVertexColorVector = [1.0,1.0,1.0,0.5];
       // Sphere.Draw(this.HumanShaderProgram);         
    mvPopMatrix();
 

	mat4.identity(mvMatrix)

  }
}   