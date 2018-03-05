
var gHumanPosX=0;
var gHumanSpeedX=0;
var gHumanSpeedFactor=0;
var gHumanCounter = 0


function humanUpdate()
{
    pAnimCounter/Math.PI
    // cos (angle max between legs)* (size legs) * 2.0

}



function humanArmDraw(pX,pY,pAnimCounter,pAngleRange)
{
  
    //cuisse
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*pAngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();    
    //Molet
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)-1.0)*pAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();
    //Foot       
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*pAngleRange*3.0), [1, 0, 0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();   

    mvPopMatrix();


}


function humanLegDraw(pX,pY,pAnimCounter,pAngleRange)
{
  
    //cuisse
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*pAngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();    
    //Molet
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad((Math.sin(pAnimCounter + Math.PI/2)+1.0)*pAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
    cubeDraw(shaderProgram);
    mvPopMatrix();
    //Chaussure       
    mat4.translate(mvMatrix,mvMatrix, [0.0,-1.0,0.0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.cos(pAnimCounter)*pAngleRange*3.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0.0,0.0,0.3]);
    mvPushMatrix();
    mat4.scale(mvMatrix,mvMatrix,[0.3,0.2,0.6]);
    cubeDraw(shaderProgram);
    mvPopMatrix();   

    mvPopMatrix();

    elapsedFactor = ( 8.0*gElapsed)/Math.PI;

    distFeet6 = Math.sin(degToRad(pAngleRange*6.0));
    distFeet12 = Math.sin(degToRad(pAngleRange*10.0));
    distFeet = distFeet6*2.0 + distFeet6*1.0 + distFeet12*1.0;
    gHumanSpeedX = distFeet * elapsedFactor;


    gHumanCounter = pAnimCounter;
    gHumanPosX += gHumanSpeedX;

}

var animCounter=0;
function humanDraw()
{
    speed = 6.0;
  //  animCounter = gAnim/50.0*speed + 10.0;
    animCounter  += 8.0*gElapsed;
    if (animCounter > 10.0 * Math.PI)  animCounter = 10.0 * Math.PI - animCounter;
    angleRange = speed;
    
	mat4.identity(mvMatrix);

    
    shaderVertexColorVector = [0.4,0.2,0.1,1.0];
    //body movement
    mat4.translate(mvMatrix,mvMatrix, [0.0,groundGetY(0.0,gHumanPosX)+5.5,gHumanPosX]);

    mat4.rotate(mvMatrix,mvMatrix,  degToRad(angleRange*1.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,Math.sin(animCounter*2.0)*angleRange/40.0,0]);
    
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(animCounter)*angleRange*0.5), [0, 0, 1]);

    // body
    mvPushMatrix();
	    mat4.scale(mvMatrix,mvMatrix,[0.6,2.0,0.5]);
        cubeDraw(shaderProgram);           
    mvPopMatrix();
 
    //shouldern
    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0,1.7,0]);
        mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0  ]);
        mat4.scale(mvMatrix,mvMatrix,[0.3,0.3,1.4]);
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
        mat4.scale(mvMatrix,mvMatrix,[0.5,0.5,0.4]);
        cubeDraw(shaderProgram);       
    mvPopMatrix(); 

    //Arms
    humanArmDraw(-1.2,1.7,animCounter,angleRange);
    humanArmDraw(1.2,1.7,animCounter  +  Math.PI ,angleRange);
    //Legs
    humanLegDraw(0.6,-1.5,animCounter,angleRange);
    humanLegDraw(-0.6,-1.5,animCounter  +  Math.PI ,angleRange);
    

	mat4.identity(mvMatrix)

}