var CEnemiesInst;
var CHumansInst;


class CEnemies
{

    constructor(pNbEnemies)
    {
        this.humans=[];
    
        var i=0;
        var enCount=0;
        while(enCount<pNbEnemies)
        {

            var  x = Math.sin(5*(i/pNbEnemies*2*Math.PI)) *150;
            var  z = Math.sin(4*(i/pNbEnemies*2*Math.PI)) *150;
            var  y = groundGetY(x,z);

            var dir = [-x,0.0,z];

            if (!groundIsUnderWater(y))
            {
                this.humans.push(new CHuman([x,1000,z],Math.random()*8,dir,false,"Bot_" + i));
                enCount+=1;
            }
            i++;
        }
    
         //   y =groundGetY(-300,20) +30.0;
       //     this.humans.push(new CHuman([-300,y,20],2));
	
        this.NbALive=pNbEnemies;
        this.IsInTarget = null;

        CEnemiesInst = this;
    }



    update(pCamPos,pCamDir,pHeroPos)
    {

        var bestTargetSquaredDist = null;
        if(GameInst.HumanInTarget != null)
        {
            bestTargetSquaredDist = vec3.squaredDistance(pHeroPos,GameInst.HumanInTarget.CamRayCollisionPos);
        }

        this.NbALive=0;
        
        for(var i =0 ;i<this.humans.length;i++){
            this.humans[i].UpdateEnemie(pCamPos,pCamDir,pHeroPos);
            if(!(this.humans[i].IsDead()))
            { 
                this.NbALive++;
            }
            if (this.humans[i].CamRayCollisionPos==null) continue;
            
            var targetSquaredDist = vec3.squaredDistance(pHeroPos,this.humans[i].CamRayCollisionPos);

            if(GameInst.HumanInTarget==null || (targetSquaredDist < bestTargetSquaredDist))
            {
                GameInst.HumanInTarget =  this.humans[i];
                bestTargetSquaredDist = targetSquaredDist;
            }
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
            collision = this.humans[i].getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
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



var HumanGlowFragmentShader = `
precision lowp float;
uniform vec4 uVertexColor; 
varying vec3 v_normal;
varying vec4 a_position;      

void main() {
    float light;
  if (a_position.y > 0.0) light = (1.0-abs((a_position.y-0.8)*5.0))* 1.0;
  else light = (1.0-abs((a_position.y+0.8)*5.0))* 1.0;
 
  gl_FragColor = vec4(light,light,light*1.5 ,uVertexColor.a);
}`;

var HumanGlowDownFragmentShader = `
precision lowp float;
uniform vec4 uVertexColor; 
varying vec3 v_normal;
varying vec4 a_position;      

void main() {
    float light;
  if (a_position.y < 0.0) light = (1.0-abs((a_position.y+0.8)*5.0))* 1.0;
 
  gl_FragColor = vec4(light,light,light*1.5 ,uVertexColor.a);
}`;

var HumanGlowSphereFragmentShader = `
precision lowp float;
uniform vec4 uVertexColor; 
varying vec3 v_normal;
varying vec4 a_position;      

void main() {
    float light = 0.0;
    float dist = sqrt(a_position.x*a_position.x + ((a_position.y+0.04)*(a_position.y+0.04)));
    light += 1.0-dist*dist*5.0;
 
 
  gl_FragColor = vec4(light*1.5,light,light ,uVertexColor.a);
}`;

var gGlowShaderProgram = -1;
var gGlowDownShaderProgram = -1;
var gGlowSphereShaderProgram = -1;


class CHuman
{

constructor(pPos,pSpeed,pDir,pHero,pName) {

    this.Pos=pPos;
    this.NewPos=[];
    this.HSpeed=0;
    this.VSpeed=0;
    this.VAcc=-300.0;
    this.Hero = pHero;
    this.Life = 100;
    this.Name = pName;
    this.Id = -1;

    this.Dir=pDir;
    vec3.normalize(this.Dir,this.Dir);
    this.NormalDir=[0,1,0];
    this.HeadDir=[0,0,0];
    this.GunDir=[0,0,0];

    this.Speed=pSpeed;
    this.Acc=1;
    this.AngleRange=0;
    this.State="Running";
    this.InVehicule = false;
    this.Vehicule = null;
    this.FireCount = 0;
    this.Uzi = new CGunsUzi();
    this.Bazooka = new CGunsBazooka();
    this.Sniper = new CGunsSniper();
    this.Zoom =  false;
    this.GunSelected = this.Uzi;

    this.KillBy=[0,0,0,0,0,0,0,0];
    this.KillByEventTime=[null,null,null,null,null,null,null,null];
    this.IsTouched = false;

    this.AnimDir = new CTimeAnim();
    this.AnimFireToRunning= new CTimeAnim();
    this.AnimReload = new CTimeAnim();
    this.AnimSpeedFall=  new CTimeAnim();
    this.AnimBodyFall = new CTimeAnim();
    this.AnimDead = new CTimeAnim();

    this.MvMatrix_Box = mat4.create();
    this.CollisionMatrixList = [];
    this.TargetHist=[];
    this.AnimCounter=0;


    this.MultiCounter = 0;
    this.MultiRefreshTime = null;
    this.MultiConnexionTime = null;
    this.MultiDisConnexionTime = null;


    this.sqrDist = vec3.squaredDistance(this.Pos,pPos);

    
    this.HumanPhy = new CHumanPhysical();
    this.BinDataSize = 172;
 
    if(gGlowShaderProgram==-1)
    {
        gGlowShaderProgram = SphereInitShaders(SphereVertexShader,HumanGlowFragmentShader);
        gGlowDownShaderProgram = SphereInitShaders(SphereVertexShader,HumanGlowDownFragmentShader);
        gGlowSphereShaderProgram = SphereInitShaders(SphereVertexShader,HumanGlowSphereFragmentShader);
    }
    
    this.GlowShaderProgram = gGlowShaderProgram;
    this.GlowDownShaderProgram = gGlowDownShaderProgram;
    this.GlowSphereShaderProgram = gGlowSphereShaderProgram;

    
    this.TargetPos=null;
    this.CamRayCollisionPos = null;
}

reInit()
{
    this.HSpeed=0;
    this.VSpeed=0;
    this.VAcc=-300.0;
    this.Life = 100;


    this.Dir=[1,0,-1];
    vec3.normalize(this.Dir,this.Dir);
    this.NormalDir=[0,1,0];
    this.HeadDir=[0,0,0];
    this.GunDir=[0,0,0];

    this.Speed=0;
    this.Acc=1;
    this.AngleRange=0;
    this.State="Running";
    this.Uzi = new CGunsUzi();
    this.Bazooka = new CGunsBazooka();
    this.Sniper = new CGunsSniper();
    this.GunSelected = this.Uzi;
    this.Zoom =  false;
    this.InVehicule = false;

    this.IsTouched = false;
   
}

computeNewVerticalPosition()
{
    //Check Vertical Collision 
    var previousBodyVPos =  [this.NewPos[0],this.Pos[1],this.NewPos[2]];
    var newFeetVPos =  [this.NewPos[0],this.NewPos[1]-5.5,this.NewPos[2]];
    var feetCollision = collisionObjectAndGroundGetPoint(previousBodyVPos,newFeetVPos,null,0);

    //If collision  then ajust vertical position
    if (feetCollision != null) {
        this.NewPos[1] = feetCollision[1] + 5.5;
        this.VSpeed = 0;
    }
}

computeNewPosition()
{
    var elapsed = timeGetElapsedInS();
    var mvCollision = false;

    //Store current Pos In New Pos
    vec3.copy(this.NewPos,this.Pos);

    //Get New Vertical Speed (gravity)    
    //VSpeed is higher when last position is on ground (Vspeed=0) in order to follow high slope
    if(this.VSpeed==0) 
    {
        this.VSpeed += this.VAcc*elapsed*10.0;
    }
    else
    {
        this.VSpeed += this.VAcc*elapsed;
    }

    //Get New Position
    this.NewPos[0] = this.Pos[0] + this.HSpeed*elapsed*this.Dir[0];
    this.NewPos[2] = this.Pos[2] + this.HSpeed*elapsed*this.Dir[2];
    this.NewPos[1] = this.Pos[1] + this.VSpeed*elapsed;
    
    //Compute vertical position
    this.computeNewVerticalPosition();

    // if Running
    if (this.HSpeed!=0)
    {
        // Check Head and Body Collision
        var collisionBody = collisionObjectAndGroundGetPoint(this.Pos,this.NewPos,null,16);
        var collisionHead = collisionObjectAndGroundGetPoint(this.Pos,[this.NewPos[0],this.NewPos[1]+5.0,this.NewPos[2]],null,0);

        // Undo movement and reajust vertical position if collision 
        if(collisionBody != null || collisionHead != null)
        {
            vec3.copy(this.NewPos,this.Pos);
            mvCollision = true;
            //Compute vertical position
            this.computeNewVerticalPosition();
        }
    }

    // Return true if a collision has occured
    return mvCollision;
}

ChangeGun(){ 
    if(!this.InVehicule)
    {
        if(this.GunSelected == this.Uzi) this.GunSelected = this.Bazooka;
        else if(this.GunSelected == this.Bazooka) this.GunSelected = this.Sniper;
        else if(this.GunSelected == this.Sniper)  this.GunSelected = this.Uzi;
        this.Zoom =  false;
    }  
    
}

UpdateHeroDead()
{

    this.Zoom=false;
    this.IsTouched = false;
    switch (this.State) {
        case "StartFalling":
            this.HumanPhy.update(); 
            vec3.subtract(this.NormalDir,this.HumanPhy.Pos1,this.HumanPhy.Pos2);
            vec3.normalize(this.NormalDir,this.NormalDir); 
            vec3.cross(this.Dir,this.NormalDir,this.Dir); 
            vec3.cross(this.Dir,this.Dir,this.NormalDir); 
            vec3.normalize(this.Dir,this.Dir); 
            if(this.HumanPhy.Ground1) this.State = "Falling";  
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
     
}




UpdateHero(pFire,pFireAuto,pFireDir,pMvAsk,pMvMediaAngle,pVehicules,pDisconnectionTimeInMs,pHumanInTarget)
{

    var elapsed = timeGetElapsedInS();
    this.IsTouched = false;
    
    this.TargetPos=null;
    if(GameInst.HumanInTarget!=null) this.TargetPos = GameInst.HumanInTarget.CamRayCollisionPos;

    // Update Hero Direction and Hero Horz Speed
    if(!this.InVehicule){

        // if Running process hero dir function of camdir and media angle
        if (pMvAsk){
            vec3.rotateY(this.Dir,pFireDir,[0,0,0],pMvMediaAngle);
            this.Dir[1]=0;
            vec3.normalize(this.Dir,this.Dir);
            this.HSpeed = 50;
        }	
        else
        {
            this.HSpeed = 0;
        }
        pVehicules.EngineOn = false;
    }
    else
    {	
        this.Zoom=false;			
        pVehicules.update(this);	
        vec3.copy(this.Pos,pVehicules.DriverPos);
        vec3.copy(this.Dir,pVehicules.Dir);
        vec3.normalize(this.Dir,this.Dir);
        this.HSpeed = 0;        
        pVehicules.EngineOn = true;	
        this.GunSelected = this.Uzi;
    }




    // Remove guns with no more weapons
    if(this.GunSelected.WeaponsCount == 0) 
    {
        this.GunSelected.Selected = false;
    }
    
    
    this.AngleRange = (this.HSpeed>0.1)?4:0;
    vec3.copy(this.HeadDir,this.Dir);


    // Human State Machine
    switch (this.State) {
        case "Running":
            if((pFire || (this.TargetPos!=null && pFireAuto)) && this.GunSelected.WeaponsCount>0) 
            {
                vec3.copy(this.HeadDir,pFireDir );
                if(this.GunSelected == this.Sniper && this.Zoom == false )
                {
                    this.Zoom = true;
                    this.State="ReadyToFire";
                }
                else
                {
                    this.State="Fire";
                }
            }   
            break;
        case "Fire": 
            vec3.copy(this.HeadDir,pFireDir);
            this.FireCount +=1;
            this.AnimReload.start(150,0,2*3.14);      
            this.State="ReadyToFire";        
            break;
        case "ReadyToFire":
            vec3.copy(this.HeadDir,pFireDir ); 
            if(!pFire && (this.TargetPos==null || !pFireAuto))
            {
                this.AnimFireToRunning.start(800,0,1);
                this.State = "FireToRunning";
            }
            else if (this.GunSelected==this.Uzi &&
                        this.GunSelected.WeaponsCount>0 &&
                    !this.AnimReload.running)
            {
                this.State = "Fire";
            }   
            break;       
        case "FireToRunning":
            vec3.copy(this.HeadDir,pFireDir);
            if(pFire  && this.GunSelected.WeaponsCount>0) this.State="Fire"; 
            else if(!this.AnimFireToRunning.running) this.State="Running"; 
            break; 
                        
    }

    vec3.copy(this.GunDir,this.HeadDir);


    //Orientation and BackWardsRunning
    if (vec3.dot(this.Dir,this.GunDir) < -0.25 )
    {
        if(this.HSpeed >0) this.HSpeed=-this.HSpeed;
        vec3.scale(this.Dir,this.Dir,-1);
        this.AnimCounter  -= 8.0*elapsed;
        if (this.AnimCounter > 10.0 * Math.PI)  this.AnimCounter = 10.0 * Math.PI - this.AnimCounter;
    }        
    else
    {
        this.AnimCounter  += 8.0*elapsed;
        if (this.AnimCounter < -10.0 * Math.PI)  this.AnimCounter = -10.0 * Math.PI - this.AnimCounter;
    }

    //Bazooka too heavy
    if(this.GunSelected == this.Bazooka)
    {
        this.Dir[0]=this.GunDir[0];
        this.Dir[2]=this.GunDir[2];
    }
    
    // Move and Check for gun or vehicules selection 
    if(!this.InVehicule )
    {
        //Update hero position according position speed and collision
        this.computeNewPosition();

        // Check for a new gun selection
        this.GunSelected = GunsInst.checkCollision(this,this.GunSelected,this.Pos,this.NewPos);
        
        // Check for a vehicule selection
        if(pVehicules.Free &&  pVehicules.checkCollision(this.Pos,this.NewPos))
        {
            pVehicules.Free = false;
            this.InVehicule = true;
            this.Vehicule = pVehicules;
        }

        //Collision Check is finished apply new pos to current
        vec3.copy(this.Pos,this.NewPos);
    }

        
   
}



ExitVehicule(pVehicule)
{
    this.InVehicule = false;
    vec3.copy(this.Pos,pVehicule.DriverOutPos);
    this.State = "Running";
    this.Dir[1]=0;
    vec3.normalize(this.Dir,this.Dir);
    pVehicule.Free = true;
    pVehicule.Power = 0;
    pVehicule.FrontPt.Speed = [0,0,0];
}

CameraRayCollisionDetection(pCamPos,pCamDir)
{
    //Human collision Detection
    this.CamRayCollisionPos = null;
    if (Sphere.IsRayCollisionDetected(pCamPos,pCamDir,this.MvMatrix_Box))
    {

        var point2 = [pCamPos[0] + pCamDir[0]*500.0,pCamPos[1] + pCamDir[1]*500.0,pCamPos[2] + pCamDir[2]*500.0];
        this.CamRayCollisionPos = Sphere.GetCollisionPosUsingMatrixList(pCamPos,point2,this.CollisionMatrixList,null,0,null);
    }  
}


UpdateEnemie(pCamPos,pCamDir,pHeroPos)
{
    if (this.State=="Dead") return;

    var elapsed = timeGetElapsedInS();
    

    this.CameraRayCollisionDetection(pCamPos,pCamDir);

    
    if (this.State!="Disappear"  &&  this.State!="StartFalling"  &&  this.State!="Falling" )
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
        var elapsedFactor = 16.0/Math.PI;
        var distFeet6 = Math.sin(degToRad(this.AngleRange*6.0));
        var distFeet12 = Math.sin(degToRad(this.AngleRange*10.0));
        var distFeet = distFeet6*3.4 + distFeet6*1.9 + distFeet12*1.5;
        var speed = distFeet * elapsedFactor;
        var tmpNewPos=[];

        
        this.HSpeed = speed;
        var objectCollision = this.computeNewPosition();
        var rotationAngle = -3.14;

        while((groundIsUnderWater(groundGetY(this.NewPos[0],this.NewPos[2])) || objectCollision)  && rotationAngle<3.14)
        {
            rotationAngle+=0.5;
            vec3.rotateY(this.Dir,this.Dir,[0,0,0],rotationAngle);
            this.AnimDir.running = false;
            objectCollision = this.computeNewPosition();
        } 

        
        vec3.copy(this.Pos,this.NewPos );
            

        // Gun Target Dir
        //Process history of target position to simulate reaction time of 0,3s
        this.TargetHist.push([timeGetCurrentInS(),[pHeroPos[0],pHeroPos[1],pHeroPos[2]]]);	
        var gunTargetPos=this.TargetHist[0][1];
        while (( timeGetCurrentInS() - this.TargetHist[0][0]) > 0.3){
            gunTargetPos = this.TargetHist.shift()[1];
        } 
        gunTargetPos = [gunTargetPos[0] ,gunTargetPos[1]-3.5,gunTargetPos[2]];
        vec3.subtract(this.GunDir,gunTargetPos,this.Pos);
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

    // Human State Machine
    //  =>test angle between target and human direction
    switch (this.State) {
        case "Running":
            if (dotProd> 0.5 && this.sqrDist < 10000) this.State = "Fire";
            vec3.copy(this.GunDir,this.Dir);
            break;
        case "Fire":   
            //Start  Reload Animation
            this.AnimReload.start(500,0,2*3.14);
            this.State  = "Reload";
            break;
        case "Reload":
            if (dotProd< 0.5 || this.sqrDist > 10000)   this.State = "Running"; 
            else if (!this.AnimReload.running) this.State = "Fire"; 
            break;
        case "StartFalling":
            this.HumanPhy.update(); 
            vec3.subtract(this.NormalDir,this.HumanPhy.Pos1,this.HumanPhy.Pos2);
            vec3.normalize(this.NormalDir,this.NormalDir); 
            vec3.cross(this.Dir,this.NormalDir,this.Dir); 
            vec3.cross(this.Dir,this.Dir,this.NormalDir); 
            vec3.normalize(this.Dir,this.Dir); 
            if(this.HumanPhy.Ground1) this.State = "Falling"; 
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



BulletCollision(pDir,pSpeed,pPower,pHumanSrc)
{
    if (this.IsDead()) return;

    var prevLife = this.Life;

    if(this.Hero && GameInst.Hero == this)
    {
        this.IsTouched = true;
        console.log(pPower + " " + this.Life);
        this.Life -= pPower;
        if(this.Life < 0) this.Life = 0;
    }
 
    if(this.Life == 0 && prevLife>0 && pHumanSrc.Id>=0)
    {
        this.KillBy[pHumanSrc.Id]++; 
        this.KillByEventTime[pHumanSrc.Id] = timeGetCurrentInMs();
    }    

    if (this.Life == 0  ||  !this.Hero)
    {

        if(this.InVehicule)   this.ExitVehicule(GameInst.Vehicules); 
        this.State = "StartFalling";
        this.Life = 0;
         
        this.HumanPhy = new CHumanPhysical();
        vec3.scale(this.HumanPhy.Speed,pDir,pSpeed);
        this.HumanPhy.Pos1 = this.Pos;
        this.HumanPhy.Pos2[0] = this.Pos[0] - this.NormalDir[0]*4.0;
        this.HumanPhy.Pos2[1] = this.Pos[1] - this.NormalDir[1]*4.0;
        this.HumanPhy.Pos2[2] = this.Pos[2] - this.NormalDir[2]*4.0;


    }

}

getCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
{
    var collision = Sphere.GetCollisionPosUsingMatrixList(pRayPoint1,pRayPoint2,this.CollisionMatrixList,pLastCollPt,pDistSquaredOffset,this)   ; 
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


    if(this.GunSelected == this.Bazooka)
    {
        armDownAngle=degToRad(-90);
        armUpAngle=0;
    }
    else if(this.GunSelected == this.Uzi)
    {
        switch (this.State) {
            case "Fire":   
            case "ReadyToFire": 
                armUpAngle= degToRad(-89 );
                armDownAngle = 0;
                break;
            case "Reload":
                armUpAngle= degToRad(-86);
                armDownAngle = degToRad(Math.sin(this.AnimReload.getValue() + Math.PI/2)-1.0)*this.AngleRange*3.0;
                break;
            case "FireToRunning":
                armUpAngle= degToRad((1-this.AnimFireToRunning.getValue()**3) * -89 );
                armDownAngle = 0;
                break;
            default:
                armUpAngle =  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0);
                armDownAngle = degToRad(Math.sin(pAnimCounter + Math.PI/2)-1.0)*this.AngleRange*3.0;

                if (this.InVehicule)
                {
                    armUpAngle= degToRad(-60 );
                    armDownAngle =  degToRad(-15);
                }
                break;
        }

    }
    else
    {
        armUpAngle =  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0);
        armDownAngle = degToRad(Math.sin(pAnimCounter + Math.PI/2)-1.0)*this.AngleRange*3.0;
    }
    
    mat4.rotate(mvMatrix,mvMatrix,  armUpAngle, [1, 0, 0]);
    
    shaderVertexColorVector = [0.01,0.01,0.01,1.0]; 

    mat4.translate(mvMatrix,mvMatrix, [0,-0.9,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.4,1.0,0.4]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.GlowDownShaderProgram); 
    mvPopMatrix();    
    
    //ArmDown    
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0]);
    mat4.rotate(mvMatrix,mvMatrix, armDownAngle, [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.32,0.8,0.32]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.GlowShaderProgram); 
    mvPopMatrix();

    //Hand    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.25,0.6,0.25]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(SphereShaderProgram); 
    mvPopMatrix();   

    //if(this.State!="Vehicule")
    {
        //Gun Bazooka
        if((this.GunSelected == this.Bazooka) && pIsLeft )
        {
            mvPushMatrix();  
                mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
                mat4.translate(mvMatrix,mvMatrix,[0.0,-1.0,-0.5]); 
                this.GunSelected.draw(this.State == "Fire",this.TargetPos,this.GunDir,this) ;
                this._drawTargetVector();
            mvPopMatrix(); 
        }     
         //Gun Sniper
        else if((this.GunSelected == this.Sniper) && pIsLeft )
        {
            if(this.Zoom && this.State == "Fire")
            {

                mvPushMatrix();  	
                    mat4.identity(mvMatrix);
                    mat4.translate(mvMatrix,mvMatrix, this.Pos);
                    mat4.translate(mvMatrix,mvMatrix,[0.0,5.5,0.0]); 
                    this.GunSelected.draw(true,this.TargetPos,this.GunDir,this);
                    this._drawTargetVector();
                mvPopMatrix();
            }
            else
            {
                mvPushMatrix();  
                    mat4.translate(mvMatrix,mvMatrix,[0.0,-1.2,0.5]); 
                    this.GunSelected.draw(false,this.TargetPos,this.GunDir,this);
                    this._drawTargetVector();
                mvPopMatrix();
            }
        }
        //Gun Uzi
        else if(this.GunSelected == this.Uzi)
        { 
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.7,0.55]);   
            this.GunSelected.draw(this.State == "Fire",this.TargetPos,this.GunDir,this) ;
            this._drawTargetVector();
        } 
    }

}


_LegDraw(pX,pY,pAnimCounter)
{

  
    var  legUpAngle=0;
    var  legMidAngle=0;
    var  legDownAngle=0; 
    var  posZ = 0.08;

    if(this.InVehicule)
    {
        legUpAngle = degToRad(-82);
        legMidAngle = 0;
        legDownAngle = 0;
        pY =pY-0.3;
        posZ = -0.4;
    }
    else
    {
        legUpAngle =  degToRad(Math.sin(pAnimCounter)*this.AngleRange*6.0);
        legMidAngle =  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*this.AngleRange*3.0);
        legDownAngle =  degToRad(Math.cos(pAnimCounter)*this.AngleRange*3.0);
        posZ = 0.08;
    }

    //cuisse
    mvPushMatrix();  
    shaderVertexColorVector = [0.01,0.01,0.01,1.0]; 
        mat4.translate(mvMatrix,mvMatrix, [pX,pY,posZ]);
        mat4.rotate(mvMatrix,mvMatrix, legUpAngle, [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0,-1.9,0]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.46,1.9,0.5]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.GlowDownShaderProgram); 
        mvPopMatrix();    
        //Molet
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.3,0]);
        mat4.rotate(mvMatrix,mvMatrix, legMidAngle , [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.3,0]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.4,1.3,0.4]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(this.GlowShaderProgram); 
        mvPopMatrix();
        //Shoes       
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  legDownAngle, [1, 0, 0]);
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.7]);
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(SphereShaderProgram);     
        mvPopMatrix();   

    mvPopMatrix();


}

_drawTargetVector()
{

    // fire vector
    if(this.targetDir!=null)    
    {
        mvPushMatrix();   
            var targetDir = getCurDirByPos(this.targetPos) ;    
            lookAt(targetDir); 
            mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,100]);
            mat4.scale(mvMatrix,mvMatrix,[0.1,0.1,100.0]);
            Sphere.Draw(SphereShaderProgram); 
        mvPopMatrix();
    }

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

    // Falling Annimation
    if (this.State == "Falling" || this.State == "Disappear")
    {
        var disapeardCoef = this.AnimDead.getValue()**2;
        if (this.State == "Disappear")  mat4.translate(mvMatrix,mvMatrix, [0,-disapeardCoef*5.0,0]);
    }

    
    lookAtN(this.Dir,this.NormalDir);
    
    

    mat4.rotate(mvMatrix,mvMatrix,  degToRad(this.AngleRange*1.0) , [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,Math.sin(animCounter*2.0)*this.AngleRange/40.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(animCounter)*this.AngleRange*0.5), [0, 0, 1]);

        

    // body down
    mvPushMatrix();  
    shaderVertexColorVector = [0.01,0.01,0.01,1.0]; 
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,-0.05]);
        mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,0.55]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(SphereShaderProgram); 
    mvPopMatrix();
    
    /* draw sphere with same shader */
    Sphere.Optim = true;
 
    // body middle
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,1.0,0]);
        mat4.scale(mvMatrix,mvMatrix,[0.8,1.2,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(SphereShaderProgram);       
    mvPopMatrix();     

    // body up
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,2.0,0]);
        mat4.scale(mvMatrix,mvMatrix,[1.0,1.0,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(this.GlowSphereShaderProgram);       
    mvPopMatrix(); 

    // shouldern
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,2.60,0]);
        mat4.scale(mvMatrix,mvMatrix,[1.4,0.6,0.5]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(SphereShaderProgram);       
    mvPopMatrix(); 

    shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
    //neck
    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0,3.5,0]);
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.8,0.3]);
        collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
        Sphere.Draw(SphereShaderProgram);
    mvPopMatrix(); 

    
    //head
    mvPushMatrix(); 
        mat4.translate(mvMatrix,mvMatrix, [0,4.2,0]);
        if(this.TargetPos!=null) this.HeadDir = getCurDirByPos(this.TargetPos);
        lookAt(this.HeadDir);

        shaderVertexColorVector = [0.0,0.0,0.0,1.0]; 
        //Hair
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,0.05,-0.04]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [1, 0, 0]);
            mat4.scale(mvMatrix,mvMatrix,[0.53,0.53,0.53]); 
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(SphereShaderProgram);
    	mvPopMatrix();      
    	
        shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
   
        //Head
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.25,0.1]);
            mat4.scale(mvMatrix,mvMatrix,[0.48,0.6,0.5]); 
            collisionPushMatrix(this.CollisionMatrixList,mvMatrix);
            Sphere.Draw(SphereShaderProgram);
    	mvPopMatrix();

    	//Nose
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.25,0.55]);
            mat4.scale(mvMatrix,mvMatrix,[0.08,0.1,0.08]); 
            Sphere.Draw(SphereShaderProgram);
    	mvPopMatrix();

    	//Mooth
        shaderVertexColorVector = [0.99,0.,0.1,1.0]; 
    	 mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.0,-0.5,0.55]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-10), [0, 0, 1]);
            mat4.scale(mvMatrix,mvMatrix,[0.12,0.025,0.02]); 
            Sphere.Draw(SphereShaderProgram);
    	mvPopMatrix();

        shaderVertexColorVector = [0.99,0.76,0.67,1.0]; 
    	//ears
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0,-0.1,0]);
        	mat4.scale(mvMatrix,mvMatrix,[0.55,0.3,0.2]); 
            Sphere.Draw(SphereShaderProgram);
        mvPopMatrix();

		//eyes
        shaderVertexColorVector = [100.0,100.0,150.0,1.0];
       	mat4.translate(mvMatrix,mvMatrix, [0.0,-0.04,0.49]);
        mvPushMatrix();
       		mat4.translate(mvMatrix,mvMatrix, [-0.21,0.0,0.0]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-10), [0, 0, 1]);
            mat4.scale(mvMatrix,mvMatrix,[0.12,0.04,0.05]);         
            Sphere.Draw(SphereShaderProgram);  
            this._drawTargetVector();
  
            shaderVertexColorVector = [0.0,0.0,0.0,1.0];  
            mat4.scale(mvMatrix,mvMatrix,[0.02,1.0,1.2]);         
            Sphere.Draw(SphereShaderProgram); 
            this._drawTargetVector();   
    	mvPopMatrix();

        shaderVertexColorVector = [100.0,100.0,150.0,1.0];
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix, [0.21,0.0,0.0]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [0, 0, 1]);
            mat4.scale(mvMatrix,mvMatrix,[0.12,0.04,0.05]);         
            Sphere.Draw(SphereShaderProgram);  
            shaderVertexColorVector = [0.0,0.0,0.0,1.0];  
            mat4.scale(mvMatrix,mvMatrix,[0.02,1.0,1.2]);         
            Sphere.Draw(SphereShaderProgram);    
        mvPopMatrix();       


    mvPopMatrix(); 

    
    Sphere.Optim = false;

    //Legs
    mvPushMatrix();
    if(this.InVehicule) lookAt(this.Vehicule.Dir);
    this._LegDraw(0.46,0.2,animCounter,true);
    this._LegDraw(-0.46,0.2,animCounter  +  Math.PI,false);
    mvPopMatrix();
    //Arms

    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [-1.2,2.6,0.0]);
    lookAt(this.GunDir);
    this._ArmDraw(animCounter,true);
    mvPopMatrix();

        
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [1.2,2.6,0.0]);
    lookAt(this.GunDir);
    this._ArmDraw(animCounter  +  Math.PI,false);
    mvPopMatrix();
    
    // Collision Box
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[6.0,7.0,6.0]);
        mat4.copy(this.MvMatrix_Box,mvMatrix);
       // shaderVertexColorVector = [1.0,1.0,1.0,0.5];
       // Sphere.Draw(SphereShaderProgram);         
    mvPopMatrix();
 

	mat4.identity(mvMatrix)



    
  }
}   