

function waterInit()
{

}


function checkCollision(pPos1,pPos2)
{
       
}


function waterIsUnder(y)
{
	return (y<-28.5);
}

function waterDraw()
{

    shaderWaterY = -28.5;
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix,mvMatrix, [0.0,-40.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[2000.0,10.0,2000.0]);
	
	gl.uniform1f (shaderProgram.counter, shaderCounter);
	gl.uniform1f (shaderProgram.waterY, shaderWaterY);
	cubeDraw(shaderProgram);
    shaderWaterY = -1000;
}