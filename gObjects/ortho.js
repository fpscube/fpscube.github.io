
function orthoInit()
{

}




function orthoCrossDisplay(pColor)
{
	shaderVertexColorVector =pColor;
	// Cross Display
	mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
	mat4.identity(mvMatrix)
	mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
	mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
	squareDraw(shaderProgram);	
    
}


function orthoLifeBarDisplay()
{
	// Life Bar Display			
	shaderVertexColorVector = [1.0,1.0,1.0,1.0];
	mat4.ortho(pMatrix, -2.0, 10.0, -10.0, 0.5, -1.0, 1.0);	
	mat4.identity(mvMatrix)
	mat4.scale(mvMatrix,mvMatrix,[gLife/10,0.1,0.1]);
	squareDraw(shaderProgram);
    
}