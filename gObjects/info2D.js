
var gInfo2DCrossColor;
var gInfo2DInjuryAlpha;
var gInfo2DLifeQt;
var gInfo2DAnim;

function info2DInit()
{
	gInfo2DCrossColor= [1.0,1.0,1.0,1.0];
	gInfo2DInjuryAlpha = 0.0;
	gInfo2DLifeQt = 1.0;
	gInfo2DAnim = new CTimeAnim();
	
}

function info2DUpdate(pEnemieTarget,pInjury,pNbLife)
{

	gInfo2DCrossColor =((pEnemieTarget) ?  [1.0,0.0,0.0,1.0]: [1.0,1.0,1.0,1.0]);
	gInfo2DLifeQt = pNbLife;
	if (pInjury) gInfo2DAnim.start(200,0.7,0.0);
	gInfo2DInjuryAlpha = gInfo2DAnim.getValue();
}

function info2DDraw()
{
	// Cross Display
	shaderVertexColorVector  = gInfo2DCrossColor;
	mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
	mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
	squareDraw(shaderProgram);	

	// Life Bar Display			
	shaderVertexColorVector = [1.0,1.0,1.0,1.0];
	mat4.ortho(pMatrix, -2.0, 10.0, -10.0, 0.5, -1.0, 1.0);	
	mat4.identity(mvMatrix);
	mat4.scale(mvMatrix,mvMatrix,[gInfo2DLifeQt/10,0.1,0.1]);
	squareDraw(shaderProgram);

	// Injury Display			
	if (gInfo2DInjuryAlpha>0)
	{
		shaderVertexColorVector = [1.0,0.0,0.0,gInfo2DInjuryAlpha];
		mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
		mat4.identity(mvMatrix);
		squareDraw(shaderProgram);
	}
		
}



