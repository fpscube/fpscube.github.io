

function waterInit()
{

}


function waterDraw()
{

    shaderWaterY = -28.5;
	mat4.identity(mvMatrix)
	mat4.translate(mvMatrix,mvMatrix, [0.0,-40.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[2000.0,10.0,2000.0]);
	cubeDraw(shaderProgram);
    shaderWaterY = -1000;
}