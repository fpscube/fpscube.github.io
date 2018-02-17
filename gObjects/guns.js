


function gunsInit()
{

    
}


function gunsDraw(pPos,pDir)
{
	
	mat4.identity(mvMatrix)
	var lookAtMatrix = mat4.create();
	mat4.translate(mvMatrix,mvMatrix, pPos);
	mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],pDir,[0,1,0]);
	mat4.invert(lookAtMatrix,lookAtMatrix);
	mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);

	shaderVertexColorVector = [0.2,0.1,0.2,1.0];
	gunSpeed = 0;
	if(mediaIsKey("Fire")) gunSpeed=5;
	
	mvPushMatrix();
	mat4.translate(mvMatrix,mvMatrix, [2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim*gunSpeed), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	setMatrixUniforms();
	cubeDraw();	
	mvPopMatrix();

	mvPushMatrix();
	mat4.translate(mvMatrix,mvMatrix, [-2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-gAnim*gunSpeed), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	setMatrixUniforms();
	cubeDraw();
	mvPopMatrix(); 
}