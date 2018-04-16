
var gHumanPos;
var gHumanDir;
var gHumanHeadDir;
var gHumanGunDir;
var gHumanSpeedFactor;
var gHumanAngleRange;
var gHumanFire;
var gHumanAcc;
var gHumanTargetHist=[];
var gHumanFireShaderProgram;
var gHumanFireSucced;

//Collision Matrix
var gHumanMvMatrix_Box; 
var gHumanMvMatrix_Head; 
var gHumanMvMatrix_Neck; 
var gHumanMvMatrix_Body; 
var gHumanMvMatrix_Shouldern; 
var gHumanMvMatrix_LeftArmP1; 
var gHumanMvMatrix_LeftArmP2; 
var gHumanMvMatrix_LeftHand; 
var gHumanMvMatrix_LeftLegP1; 
var gHumanMvMatrix_LeftLegP2; 
var gHumanMvMatrix_LeftLegP3; 
var gHumanMvMatrix_RightArmP1; 
var gHumanMvMatrix_RightArmP2; 
var gHumanMvMatrix_RightHand; 
var gHumanMvMatrix_RightLegP1; 
var gHumanMvMatrix_RightLegP2; 
var gHumanMvMatrix_RightLegP3; 

var gHumanFragmentShaderFire= `
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

var gHumanfragmentShaderEyes= `
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

function humanInit()
{
    timeAnimInit("HumanDir");
    timeAnimInit("HumanArmFire");
    timeAnimInit("HumanBulletFire");
    gHumanPos=[0,0,0];
    gHumanDir=[-1,0,1];
    gHumanHeadDir=[0,0,0];
    gHumanGunDir=[0,0,0];
    gHumanSpeedFactor=2.0;
    gHumanAngleRange=0
    gHumanAcc=1;
    gHumanState="Running";
    gHumanTargetHist=[];
    gHumanFireShaderProgram =  initShaders(vertexShader1,gHumanFragmentShaderFire);
    gHumanEyesShaderProgram =  initShaders(vertexShader1,gHumanfragmentShaderEyes);
    gHumanFireSucced = false;

    gHumanMvMatrix_Box = mat4.create(); 
    gHumanMvMatrix_Head = mat4.create(); 
    gHumanMvMatrix_Neck = mat4.create(); 
    gHumanMvMatrix_Body = mat4.create(); 
    gHumanMvMatrix_Shouldern = mat4.create(); 
    gHumanMvMatrix_LeftArmP1 = mat4.create(); 
    gHumanMvMatrix_LeftArmP2 = mat4.create(); 
    gHumanMvMatrix_LeftHand = mat4.create(); 
    gHumanMvMatrix_LeftLegP1 = mat4.create(); 
    gHumanMvMatrix_LeftLegP2 = mat4.create(); 
    gHumanMvMatrix_LeftLegP3 = mat4.create(); 
    gHumanMvMatrix_RightArmP1 = mat4.create(); 
    gHumanMvMatrix_RightArmP2 = mat4.create(); 
    gHumanMvMatrix_RightHand = mat4.create(); 
    gHumanMvMatrix_RightLegP1 = mat4.create(); 
    gHumanMvMatrix_RightLegP2 = mat4.create(); 
    gHumanMvMatrix_RightLegP3 = mat4.create(); 
}

function humanHasFireSucced(){ return gHumanFireSucced;}

function humanIsInGunTarget(){

     return ( 
        cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_Box) &&  
        (    
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_Head) ||  
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_Neck) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_Body) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_Shouldern) ||  
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftArmP1) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftArmP2) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftHand) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftLegP1) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftLegP2) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_LeftLegP3) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightArmP1) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightArmP2) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightHand) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightLegP1) ||  
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightLegP2) ||   
            cubeIsRayCollisionDetected(gPos,gDir,gHumanMvMatrix_RightLegP3)
        ) 
    )
    
 }

function humanUpdate()
{

    
    var elapsed =timeGetElapsedInS();
    
    gHumanSpeedFactor += elapsed*gHumanAcc;
    
    if (gHumanSpeedFactor> 8.0) { gHumanSpeedFactor=8.0; gHumanAcc=-1;}
    if (gHumanSpeedFactor< 1.0) { gHumanSpeedFactor=1.0; gHumanAcc=1;}
 
    if (!timeAnimIsRunning("HumanDir"))
    {
        animStart=[gHumanDir[0],gHumanDir[1],gHumanDir[2]];
        animEnd=[Math.random()-0.5,0.0,Math.random()-0.5];
        animDuration = 10000 + Math.random()*10000;
        timeAnimStart("HumanDir",animDuration,animStart,animEnd);
    }

    gHumanDir = timeAnimGetVec3Value("HumanDir");
    vec3.normalize(gHumanDir,gHumanDir);

    gHumanAngleRange = gHumanSpeedFactor;

    elapsedFactor = ( 8.0*elapsed)/Math.PI;

    distFeet6 = Math.sin(degToRad(gHumanAngleRange*6.0));
    distFeet12 = Math.sin(degToRad(gHumanAngleRange*10.0));
    distFeet = distFeet6*2.0 + distFeet6*1.0 + distFeet12*1.0;
    speed = distFeet * elapsedFactor;

    gHumanPos[2] -= speed * 2.0 * gHumanDir[2];
    gHumanPos[0] -= speed * 2.0 * gHumanDir[0];
    gHumanPos[1] = groundGetY(gHumanPos[0],gHumanPos[2])+5.5 ;

    //Process history of target position to simulate reaction time of 0,3s
	gHumanTargetHist.push([timeGetCurrentInS(),[gPos[0],gPos[1],gPos[2]]]);	
    var gunTargetPos=gHumanTargetHist[0][1];
	while (( timeGetCurrentInS() - gHumanTargetHist[0][0]) > 0.3){
        gunTargetPos = gHumanTargetHist.shift()[1];
    } 

    gunTargetPos = [gunTargetPos[0] ,gunTargetPos[1]-3.5,gunTargetPos[2]];

    vec3.subtract(gHumanGunDir,gHumanPos,gunTargetPos);
    vec3.normalize(gHumanGunDir,gHumanGunDir);
    dotProd =vec3.dot(gHumanGunDir,gHumanDir);
    turnFactor = (dotProd + 1.0) /2.0;
    vec3.copy(gHumanHeadDir,gHumanGunDir);
    gHumanHeadDir = [gHumanGunDir[0]*turnFactor+ (1.0 - turnFactor)*gHumanDir[0],gHumanGunDir[1]*turnFactor+ (1.0 - turnFactor)*gHumanDir[1],gHumanGunDir[2]*turnFactor + (1.0 - turnFactor)*gHumanDir[2]];

    
    if (dotProd> 0.5 )
    {
        if( !timeAnimIsRunning("HumanArmFire")) 
        {            
            gHumanState = "Fire";
            timeAnimStart("HumanArmFire",500,0,2*3.14);
            timeAnimStart("HumanBulletFire",100,0,100);
            var targetDir =  vec3.create();	
            var fireVector =  vec3.create();
            var distVector  =  vec3.create();
            var targetPos = [gPos[0] ,gPos[1]-3.5,gPos[2]];
            vec3.subtract(targetDir,gHumanPos,targetPos);
            var fireDist = vec3.dot(targetDir,gHumanGunDir);
            var enemieDist = vec3.distance(gHumanPos,targetPos);		
            dist = Math.sqrt(enemieDist**2 - fireDist**2);   
            if (dist < 1 || isNaN(dist)) gHumanFireSucced = true;

            console.log(dist);

        }
        else
        {            
            gHumanState = "PrepareFire";
            gHumanFireSucced = false;
        }
    }
    else
    {
        
        gHumanState = "Running";
    }
};



function humanArmDraw(pAnimCounter,pIsLeft)
{
    //Arm Part 1
    if (gHumanState != "Running")
    {
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(-86), [1, 0, 0]);
        armDownAngle = (Math.sin( timeAnimGetValue("HumanArmFire") + Math.PI/2)-1.0)*gHumanAngleRange*3.0;
    }
    else
    {
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*gHumanAngleRange*6.0), [1, 0, 0]);
        armDownAngle = (Math.sin(pAnimCounter + Math.PI/2)-1.0)*gHumanAngleRange*3.0;
    }   
    mat4.translate(mvMatrix,mvMatrix, [0,-0.6,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.9,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftArmP1,mvMatrix) : mat4.copy(gHumanMvMatrix_RightArmP1,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();    
    
    //ArmDown    
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mat4.rotate(mvMatrix,mvMatrix, degToRad(armDownAngle), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.8,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftArmP2,mvMatrix) : mat4.copy(gHumanMvMatrix_RightArmP2,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();
    //Hand    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    //mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*gHumanAngleRange*3.0), [1, 0, 0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftHand,mvMatrix) : mat4.copy(gHumanMvMatrix_RightHand,mvMatrix);
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


    if(gHumanState == "Fire")
    {
        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.0]);
        squareDraw(gHumanFireShaderProgram);	
        mvPopMatrix();

        mvPushMatrix();	
        mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
        mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
        squareDraw(gHumanFireShaderProgram);	
        mvPopMatrix();
    }
}


function humanLegDraw(pX,pY,pAnimCounter,pIsLeft)
{
  
    //cuisse
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*gHumanAngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-1.0,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftLegP1,mvMatrix) : mat4.copy(gHumanMvMatrix_RightLegP1,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();    
    //Molet
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*gHumanAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftLegP2,mvMatrix) : mat4.copy(gHumanMvMatrix_RightLegP2,mvMatrix);
        cubeDraw(shaderProgram);
    mvPopMatrix();
    //Shoes       
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*gHumanAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
    mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.6]);
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        (pIsLeft) ? mat4.copy(gHumanMvMatrix_LeftLegP3,mvMatrix) : mat4.copy(gHumanMvMatrix_RightLegP3,mvMatrix);
        cubeDraw(shaderProgram);
        cubeDraw(shaderProgram);
    mvPopMatrix();   

    mvPopMatrix();


}

var animCounter=0;
function humanDraw()
{
    
    var gElapsed = timeGetElapsedInS();
    var lookAtMatrix = mat4.create();

    animCounter  += 8.0*gElapsed;
    if (animCounter > 10.0 * Math.PI)  animCounter = 10.0 * Math.PI - animCounter;
    
	mat4.identity(mvMatrix);

    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];
    //body movement
    mat4.translate(mvMatrix,mvMatrix, gHumanPos);

    mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanDir,[0,1,0]);
    mat4.invert(lookAtMatrix,lookAtMatrix);
    mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);

    mat4.rotate(mvMatrix,mvMatrix,  degToRad(gHumanAngleRange*1.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,Math.sin(animCounter*2.0)*gHumanAngleRange/40.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(animCounter)*gHumanAngleRange*0.5), [0, 0, 1]);

    // Collision Box
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[10.0,10.0,10.0]);
        mat4.copy(gHumanMvMatrix_Box,mvMatrix);
        //cubeDraw(shaderProgram);           
    mvPopMatrix();
 

    // body
    mvPushMatrix();  
        mat4.scale(mvMatrix,mvMatrix,[0.8,2.0,0.4]);
        mat4.copy(gHumanMvMatrix_Body,mvMatrix);
        cubeDraw(shaderProgram);           
    mvPopMatrix();
 
    //shouldern
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,1.7,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0 ]);
        mat4.scale(mvMatrix,mvMatrix,[0.4,0.3,0.9]);
        mat4.copy(gHumanMvMatrix_Shouldern,mvMatrix);
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
		mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanHeadDir,[0,1,0]);
		mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mvPushMatrix();
            mat4.scale(mvMatrix,mvMatrix,[0.5,0.5,0.4]); 
            mat4.copy(gHumanMvMatrix_Head,mvMatrix);
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
    humanLegDraw(0.5,-1.5,animCounter,true);
    humanLegDraw(-0.5,-1.5,animCounter  +  Math.PI,false);
    //Arms

    
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [-1.2,1.7,0.0]);
    if(gHumanState != "Running")
    {
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanDir,[0,1,0]);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanGunDir,[0,1,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
    }
    humanArmDraw(animCounter,true);
    mvPopMatrix();

        
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [1.2,1.7,0.0]);
    if(gHumanState != "Running" )
    {
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanDir,[0,1,0]);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanGunDir,[0,1,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
    }
    humanArmDraw(animCounter  +  Math.PI,false);
    mvPopMatrix();
    

	mat4.identity(mvMatrix)

}