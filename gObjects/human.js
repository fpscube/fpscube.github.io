
var gHumanPos=[0,0,0];
var gHumanDir=[-1,0,1];
var gHumanHeadDir=[0,0,0];
var gHumanGunDir=[0,0,0];
var gHumanSpeedFactor=2.0;
var gHumanAngleRange=0
var gHumanDirAnimSpeed=5;
var gHumanDirAnimCounter=100;
var gHumanDirAnimStart=[-1,0,1];
var gHumanDirAnimEnd=[-1,0,1];
var gHumanFire=false

var gHumanAcc=1;

function humanUpdate()
{
    
    if (gHumanSpeedFactor> 8.0)  gHumanAcc=-1;
    if (gHumanSpeedFactor< 1.0)  gHumanAcc=1;
    gHumanSpeedFactor += gElapsed*gHumanAcc;

    
     gHumanDirAnimCounter += gElapsed*gHumanDirAnimSpeed;
    if (gHumanDirAnimCounter>=100)
    {
         gHumanDirAnimCounter=0; 
         gHumanDirAnimStart=[gHumanDir[0],gHumanDir[1],gHumanDir[2]];
         gHumanDirAnimEnd=[Math.random()-0.5,0.0,Math.random()-0.5];
         vec3.normalize(gHumanDirAnimEnd,gHumanDirAnimEnd);
    }

    coefEnd = gHumanDirAnimCounter/100.0;
    coefStart = 1-coefEnd;
    gHumanDir = [gHumanDirAnimStart[0]*coefStart + gHumanDirAnimEnd[0]*coefEnd,gHumanDirAnimStart[1]*coefStart+ gHumanDirAnimEnd[1]*coefEnd,gHumanDirAnimStart[2]*coefStart+ gHumanDirAnimEnd[2]*coefEnd];
    vec3.normalize(gHumanDir,gHumanDir);


    gHumanAngleRange = gHumanSpeedFactor;

    elapsedFactor = ( 8.0*gElapsed)/Math.PI;

    distFeet6 = Math.sin(degToRad(gHumanAngleRange*6.0));
    distFeet12 = Math.sin(degToRad(gHumanAngleRange*10.0));
    distFeet = distFeet6*2.0 + distFeet6*1.0 + distFeet12*1.0;
    speed = distFeet * elapsedFactor;

    gHumanPos[2] -= speed * 2.0 * gHumanDir[2];
    gHumanPos[0] -= speed * 2.0 * gHumanDir[0];
    gHumanPos[1] = groundGetY(gHumanPos[0],gHumanPos[2])+5.5 ;

    targetPos = []
    targetPos = [gPos[0],gPos[1]-3.5,gPos[2]];

    vec3.subtract(gHumanHeadDir,gHumanPos,targetPos);
    vec3.normalize(gHumanHeadDir,gHumanHeadDir);
    dotProd =vec3.dot(gHumanHeadDir,gHumanDir);
    turnFactor = (dotProd + 1.0) /2.0;
    gHumanFire=(dotProd> 0.5);

    vec3.copy(gHumanGunDir,gHumanHeadDir);
    gHumanHeadDir = [gHumanHeadDir[0]*turnFactor+ (1.0 - turnFactor)*gHumanDir[0],gHumanHeadDir[1]*turnFactor+ (1.0 - turnFactor)*gHumanDir[1],gHumanHeadDir[2]*turnFactor + (1.0 - turnFactor)*gHumanDir[2]];

};



function humanArmDraw(pX,pY,pAnimCounter,hasGun)
{
  
    
    //ArmUp
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0.0,0]);
    if (gHumanFire)
    {
       mat4.rotate(mvMatrix,mvMatrix,  degToRad(-86), [1, 0, 0]);
    }
    else
    {
      mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*gHumanAngleRange*6.0), [1, 0, 0]);
    }   
    mat4.translate(mvMatrix,mvMatrix, [0,-0.6,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.9,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();    
    
    //ArmDown
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)-1.0)*gHumanAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-0.8,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.8,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();
    //Hand    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];  
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    //mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*gHumanAngleRange*3.0), [1, 0, 0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();   

    //Gun
    if (hasGun)
    {
        
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
        
        
    }


    mvPopMatrix();


}


function humanLegDraw(pX,pY,pAnimCounter)
{
  
    //cuisse
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*gHumanAngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();    
    //Molet
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*gHumanAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();
    //Shoes       
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*gHumanAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.6]);
    cubeDraw(shaderProgram);
    mvPopMatrix();   

    mvPopMatrix();


}

var animCounter=0;
function humanDraw()
{
    
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

    // body
    mvPushMatrix();  
	    mat4.scale(mvMatrix,mvMatrix,[0.8,2.0,0.4]);
        cubeDraw(shaderProgram);           
    mvPopMatrix();
 
    //shouldern
    mvPushMatrix();    
        mat4.translate(mvMatrix,mvMatrix, [0,1.7,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0 ]);
        mat4.scale(mvMatrix,mvMatrix,[0.4,0.3,0.9]);
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
    humanLegDraw(0.5,-1.5,animCounter);
    humanLegDraw(-0.5,-1.5,animCounter  +  Math.PI );
    //Arms

    if (gHumanFire)
    {
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanDir,[0,1,0]);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
        mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],gHumanGunDir,[0,1,0]);
        mat4.invert(lookAtMatrix,lookAtMatrix);
        mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
    }
    humanArmDraw(-1.2,1.7,animCounter,true);
    humanArmDraw(1.2,1.7,animCounter  +  Math.PI,true );
    

	mat4.identity(mvMatrix)

}