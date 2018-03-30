gGunsFireTimer=0;



function gunsInit()
{

    
}


function gunsDraw(pPos,pDir)
{
	var timeMs= timeGetCurrentInMs();
	var gElapsed = timeGetElapsedInS();

	mat4.identity(mvMatrix)
	var lookAtMatrix = mat4.create();
	mat4.translate(mvMatrix,mvMatrix, pPos);
	mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],pDir,[0,1,0]);
	mat4.invert(lookAtMatrix,lookAtMatrix);
	mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);

	gunSpeed = 0;
	if(mediaIsKey("Fire")) 
	{
		gunSpeed=5;
	
		gGunsFireTimer += gElapsed*50;
		if (gGunsFireTimer > 10) 
		{
			gGunsFireTimer=0;

		}

		mvPushMatrix();	
		mat4.translate(mvMatrix,mvMatrix, [2.0,-0.6,-4.1]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.0]);
		squareDraw(shaderProgram2);	
		mvPopMatrix();
		
		mvPushMatrix();	
		mat4.translate(mvMatrix,mvMatrix, [2.0,-0.6,-4.0]);
		mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
		squareDraw(shaderProgram2);	
		mvPopMatrix();
	
		mvPushMatrix();	
		mat4.translate(mvMatrix,mvMatrix, [-2.0,-0.6,-4.1]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.5]);
		squareDraw(shaderProgram2);	
		mvPopMatrix();
		
		mvPushMatrix();	
		mat4.translate(mvMatrix,mvMatrix, [-2.0,-0.6,-4.0]);
		mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
		squareDraw(shaderProgram2);	
		mvPopMatrix();


	}

	
	shaderVertexColorVector = [0.2,0.1,0.2,1.0];
	mvPushMatrix();
	mat4.translate(mvMatrix,mvMatrix, [2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(timeMs*gunSpeed*2.0), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	cubeDraw(shaderProgram);	
	mvPopMatrix();

	mvPushMatrix();
	mat4.translate(mvMatrix,mvMatrix, [-2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-timeMs*gunSpeed*2.0), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	cubeDraw(shaderProgram);
	mvPopMatrix(); 
}