
var gHumanPos=[0,0,0];
var gHumanHeadDir=[0,0,0];
var gHumanSpeedZ=0;
var gHumanSpeedFactor=0;
var gHumanAngleRange=0


function humanUpdate()
{

    elapsedFactor = ( 8.0*gElapsed)/Math.PI;

    distFeet6 = Math.sin(degToRad(gHumanAngleRange*6.0));
    distFeet12 = Math.sin(degToRad(gHumanAngleRange*10.0));
    distFeet = distFeet6*2.0 + distFeet6*1.0 + distFeet12*1.0;
    gHumanSpeedZ = distFeet * elapsedFactor;

    gHumanPos[2] += gHumanSpeedZ*2.0;
    gHumanPos[0]=0.0;
    gHumanPos[1]=groundGetY(0.0,gHumanPos[2])+5.5 ;

    targetPos = []
    targetPos = [gPos[0],gPos[1]-3.5,gPos[2]];

    vec3.subtract(gHumanHeadDir,targetPos,gHumanPos);
    vec3.normalize(gHumanHeadDir,gHumanHeadDir);
    dotProd =vec3.dot(gHumanHeadDir,[0,0,1.0]);
    turnFactor = (dotProd + 1.0) /2.0;
    gHumanHeadDir = [gHumanHeadDir[0]*turnFactor,gHumanHeadDir[1]*turnFactor,gHumanHeadDir[2]*turnFactor + 1.0 - turnFactor];

};



function humanArmDraw(pX,pY,pAnimCounter,hasGun)
{
  
    
    //ArmUp
    mvPushMatrix();  
    mat4.translate(mvMatrix,mvMatrix, [pX,pY,0]);
    mat4.rotate(mvMatrix,mvMatrix,  degToRad(Math.sin(pAnimCounter)*gHumanAngleRange*6.0), [1, 0, 0]);
    mat4.translate(mvMatrix,mvMatrix, [0,-0.9,0]);
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
    speed = 5.0;
    
    animCounter  += 8.0*gElapsed;
    if (animCounter > 10.0 * Math.PI)  animCounter = 10.0 * Math.PI - animCounter;
    gHumanAngleRange = speed;
    
	mat4.identity(mvMatrix);

    
    shaderVertexColorVector = [0.99,0.76,0.67,1.0];
    //body movement
    mat4.translate(mvMatrix,mvMatrix, gHumanPos);

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
        
	    var lookAtMatrix = mat4.create();
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
       		mat4.translate(mvMatrix,mvMatrix, [0.0,0.2,-0.5]);
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
    humanArmDraw(-1.2,2.0,animCounter,true);
    humanArmDraw(1.2,2.0,animCounter  +  Math.PI ,true);
    

	mat4.identity(mvMatrix)

}